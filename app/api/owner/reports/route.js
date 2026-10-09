import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import Report from "@/models/Report"; // Assuming you have a Report or Document model for these uploads

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
    
    // Fetch reports specifically uploaded for this owner's company
    const ownerCompanyId = decoded.companyId || decoded.userId;
    const reports = await Report.find({ companyId: ownerCompanyId }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: reports }, { status: 200 });

  } catch (error) {
    console.error("GET Owner Reports Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}