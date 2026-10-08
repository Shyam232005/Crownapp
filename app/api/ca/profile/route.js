import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { cookies } from "next/headers";
import CA from "@/models/CA";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

export async function GET(request) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      return NextResponse.json({ success: false, error: "Invalid session token" }, { status: 401 });
    }

    const caId = decoded.userId || decoded.companyId;
    if (!caId) {
      return NextResponse.json({ success: false, error: "User ID missing from session" }, { status: 401 });
    }

    let caProfile = await CA.findById(caId).select("inviteCode firmName phoneNumber icaiNumber");
    
    if (!caProfile && decoded.companyId) {
      caProfile = await CA.findById(decoded.companyId).select("inviteCode firmName phoneNumber icaiNumber");
    }

    if (!caProfile) {
      return NextResponse.json({ success: false, error: "CA Profile not found" }, { status: 404 });
    }

    if (!caProfile.inviteCode) {
      const rawString = `${caProfile.firmName || 'CA'}-${caProfile.icaiNumber || '000'}-${Date.now()}-${Math.random()}`;
      const hash = crypto.createHash("md5").update(rawString).digest("hex").substring(0, 6).toUpperCase();
      caProfile.inviteCode = `CA-${hash}`;
      await caProfile.save();
    }

    return NextResponse.json({ 
      success: true,
      inviteCode: caProfile.inviteCode,
      firmName: caProfile.firmName 
    }, { status: 200 });

  } catch (error) {
    console.error("CA Profile API Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}