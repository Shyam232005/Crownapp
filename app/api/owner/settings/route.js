import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import Owner from "@/models/Owner"; // Ensure you have this model

export const dynamic = "force-dynamic";
export const revalidate = 0;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const isOwner = decoded.role === "Owner" || decoded.role === "OWNER" || decoded.normalizedRole === "OWNER";
    if (!isOwner) {
      return NextResponse.json({ success: false, error: "Forbidden: Owner access only" }, { status: 403 });
    }

    await connectDB();
    
    const ownerCompanyId = decoded.companyId || decoded.userId;
    let owner = await Owner.findById(ownerCompanyId).select("-password");
    
    if (!owner) {
      return NextResponse.json({ success: false, error: "Owner not found" }, { status: 404 });
    }

    if (!owner.inviteCode) {
      const crypto = await import("crypto");
      owner.inviteCode = `BIZ-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
      await owner.save();
    }

    return NextResponse.json({ success: true, data: owner }, { status: 200 });

  } catch (error) {
    console.error("GET Owner Settings Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const isOwner = decoded.role === "Owner" || decoded.role === "OWNER" || decoded.normalizedRole === "OWNER";
    if (!isOwner) {
      return NextResponse.json({ success: false, error: "Forbidden: Owner access only" }, { status: 403 });
    }

    await connectDB();
    const body = await request.json();

    // Map the form payload back to our database schema
    const updatePayload = {
      companyName: body.businessName,
      gstin: body.gstin,
      location: body.address,
      name: body.fullName,
      phoneNumber: body.phone,
      upiId: body.upiId,
      bankAccount: body.bankAccount
    };

    // Remove empty fields to avoid overwriting existing data with blanks
    Object.keys(updatePayload).forEach(key => {
      if (updatePayload[key] === undefined) delete updatePayload[key];
    });

    const updatedOwner = await Owner.findByIdAndUpdate(
      decoded.userId,
      { $set: updatePayload },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedOwner) {
      return NextResponse.json({ error: "Failed to update profile" }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: updatedOwner }, { status: 200 });

  } catch (error) {
    console.error("PATCH Owner Settings Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}