import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import CAStaff from "@/models/CAStaff";
import CA from "@/models/CA";
import Owner from "@/models/Owner";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const isCA = decoded.role === "CA" || decoded.normalizedRole === "CA";
    if (!isCA) {
      return NextResponse.json({ success: false, error: "Forbidden: CA Firm Admin access only" }, { status: 403 });
    }

    await connectDB();
    const body = await request.json().catch(() => ({}));
    const { staffId, companyIds } = body;

    if (!staffId) {
      return NextResponse.json({ success: false, error: "Staff ID is required." }, { status: 400 });
    }

    const caFirmId = decoded.caFirmId || decoded.companyId || decoded.userId;

    // Convert string IDs to ObjectIds safely
    const validCompanyIds = (Array.isArray(companyIds) ? companyIds : [])
      .filter(id => id && mongoose.Types.ObjectId.isValid(id))
      .map(id => new mongoose.Types.ObjectId(id));

    const updatedStaff = await CAStaff.findOneAndUpdate(
      { 
        _id: new mongoose.Types.ObjectId(staffId),
        $or: [{ caFirmId }, { caId: caFirmId }]
      },
      { 
        $set: { 
          assignedCompanies: validCompanyIds,
          assignedClients: validCompanyIds
        } 
      },
      { new: true }
    ).populate({
      path: 'assignedCompanies',
      select: 'name companyName gstin'
    });

    if (!updatedStaff) {
      return NextResponse.json({ success: false, error: "Staff member not found under your firm." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Client companies assigned successfully.",
      data: updatedStaff
    }, { status: 200 });

  } catch (error) {
    console.error("CA Staff Assignment Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to assign companies" }, { status: 500 });
  }
}
