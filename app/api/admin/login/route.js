import { NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import connectDB from "@/lib/mongodb";
import Admin from "@/models/Admin";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json().catch(() => ({}));
    const { email, identifier, password } = body;

    const inputIdentifier = (email || identifier || "").trim().toLowerCase();
    if (!inputIdentifier || !password) {
      return NextResponse.json(
        { success: false, error: "Admin email/phone and password are required." },
        { status: 400 }
      );
    }

    const adminEnvEmail = (process.env.ADMIN_EMAIL || "shyamsangani23@gmail.com").toLowerCase().trim();
    const adminEnvPhone = (process.env.ADMIN_PHONE || "9723386344").trim();

    let authenticatedAdmin = null;

    // 1. Verify against Environment Super-Admin credentials
    if (inputIdentifier === adminEnvEmail || inputIdentifier === adminEnvPhone.toLowerCase()) {
      const adminHash = process.env.ADMIN_PASSWORD_HASH;
      let isMatch = false;

      if (adminHash) {
        isMatch = await bcrypt.compare(password, adminHash);
      } else {
        // Fallback check if plain text in dev
        isMatch = password === "Admin@123" || password === "CrownAdmin#2026";
      }

      if (isMatch) {
        authenticatedAdmin = {
          id: "super-admin-root",
          name: "Super Admin",
          email: adminEnvEmail,
          role: "ADMIN",
          isSuperAdmin: true
        };
      }
    }

    // 2. If not env admin, check Admin collection in Database
    if (!authenticatedAdmin) {
      const dbAdmin = await Admin.findOne({
        $or: [{ email: inputIdentifier }, { phoneNumber: inputIdentifier }]
      });

      if (dbAdmin) {
        const isMatch = await bcrypt.compare(password, dbAdmin.password);
        if (isMatch) {
          authenticatedAdmin = {
            id: dbAdmin._id.toString(),
            name: dbAdmin.name,
            email: dbAdmin.email,
            role: "ADMIN",
            isSuperAdmin: true
          };
        }
      }
    }

    if (!authenticatedAdmin) {
      return NextResponse.json(
        { success: false, error: "Invalid admin credentials." },
        { status: 401 }
      );
    }

    // 3. Generate Secure JWT Token with role: 'ADMIN'
    const payload = {
      userId: authenticatedAdmin.id,
      email: authenticatedAdmin.email,
      role: "ADMIN",
      normalizedRole: "ADMIN",
      isSuperAdmin: true,
      name: authenticatedAdmin.name,
      companyId: null
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    const cookieStore = await cookies();
    cookieStore.set({
      name: "crown_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/"
    });

    return NextResponse.json(
      {
        success: true,
        message: "Super Admin authenticated successfully.",
        redirectUrl: "/console",
        user: authenticatedAdmin
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin Login Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Admin authentication failed." },
      { status: 500 }
    );
  }
}
