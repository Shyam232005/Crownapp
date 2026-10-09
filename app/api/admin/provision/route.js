import { NextResponse } from "next/server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import Owner from "@/models/Owner";
import CA from "@/models/CA";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

async function verifySuperAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("crown_session")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.isSuperAdmin || decoded.role === "Admin" || decoded.role === "ADMIN" || decoded.role === "SUPER_ADMIN") {
      return decoded;
    }
    return null;
  } catch (err) {
    return null;
  }
}

// POST: Manually Provision an Account
export async function POST(request) {
  try {
    const admin = await verifySuperAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access to admin console." }, { status: 403 });
    }

    await connectDB();
    const body = await request.json();
    const { 
      role, name, email, phoneNumber, password, 
      companyName, gstin, location, Category, 
      firmName, icaiNumber, planName, trialDays 
    } = body;

    if (!role || !name || !email || !phoneNumber || !password) {
      return NextResponse.json({ error: "Required fields missing (role, name, email, phone, password)." }, { status: 400 });
    }

    // Reject reserved super admin credentials
    const adminEmail = (process.env.ADMIN_EMAIL || "shyamsangani23@gmail.com").toLowerCase().trim();
    const adminPhone = (process.env.ADMIN_PHONE || "9723386344").trim();
    if (email.toLowerCase().trim() === adminEmail || phoneNumber.trim() === adminPhone) {
      return NextResponse.json({ error: "Cannot provision account with reserved Super-Admin credentials." }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (role === "Owner") {
      const existing = await Owner.findOne({ $or: [{ email }, { phoneNumber }] });
      if (existing) {
        return NextResponse.json({ error: "Owner already exists with this email or phone." }, { status: 400 });
      }

      const days = Number(trialDays) || 30;
      const expiry = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

      const newOwner = new Owner({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: phoneNumber.trim(),
        password: hashedPassword,
        companyName: companyName ? companyName.trim() : `${name.trim()}'s Enterprises`,
        gstin: gstin ? gstin.trim().toUpperCase() : "24AABCS1429B1Z",
        location: location || "India",
        Category: Category || "General Trade",
        subscriptionExpiry: expiry,
        subscription: {
          planName: planName || "Free Trial",
          cycle: "trial",
          status: "active",
          startDate: new Date(),
          endDate: expiry
        }
      });

      await newOwner.save();

      return NextResponse.json({
        success: true,
        message: `Business Owner "${newOwner.name}" provisioned successfully with ${days}-day trial.`,
        user: {
          id: newOwner._id.toString(),
          name: newOwner.name,
          email: newOwner.email,
          role: "Owner",
          companyName: newOwner.companyName,
          inviteCode: newOwner.inviteCode,
          subscriptionExpiry: expiry.toISOString()
        }
      }, { status: 201 });
    }

    else if (role === "CA") {
      const existing = await CA.findOne({ $or: [{ email }, { phoneNumber }] });
      if (existing) {
        return NextResponse.json({ error: "CA Firm already exists with this email or phone." }, { status: 400 });
      }

      const newCA = new CA({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: phoneNumber.trim(),
        password: hashedPassword,
        firmName: firmName ? firmName.trim() : `${name.trim()} & Associates`,
        icaiNumber: icaiNumber ? icaiNumber.trim() : "ICAI-999999",
        principalCa: name.trim()
      });

      await newCA.save();

      return NextResponse.json({
        success: true,
        message: `CA Firm "${newCA.firmName}" provisioned successfully.`,
        user: {
          id: newCA._id.toString(),
          name: newCA.name,
          firmName: newCA.firmName,
          email: newCA.email,
          role: "CA",
          inviteCode: newCA.inviteCode
        }
      }, { status: 201 });
    }

    return NextResponse.json({ error: "Unsupported role for manual provisioning." }, { status: 400 });

  } catch (error) {
    console.error("Admin Provision Error:", error);
    return NextResponse.json({ error: "Failed to provision account." }, { status: 500 });
  }
}
