import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import CA from "@/models/CA";
import Report from "@/models/Report";
import Owner from "@/models/Owner";

export const dynamic = "force-dynamic";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "CA" && decoded.role !== "CA-Employee") {
      return NextResponse.json({ error: "Forbidden: CA access only" }, { status: 403 });
    }

    await connectDB();
    
    // Fetch the CA Firm's mapped clients
    const caFirmId = decoded.companyId || decoded.userId;
    const caFirm = await CA.findById(caFirmId);

    if (!caFirm || !caFirm.clients || caFirm.clients.length === 0) {
      return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }

    // Fetch reports uploaded specifically for this CA's clients
    const reports = await Report.find({ companyId: { $in: caFirm.clients } })
      .populate('companyId', 'companyName')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: reports }, { status: 200 });

  } catch (error) {
    console.error("GET CA Audits Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "CA" && decoded.role !== "CA-Employee") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const body = await request.json();
    const { companyId, clientName, period, reportType, fileData, status } = body;

    if (!companyId || !fileData) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify CA owns the requested companyId mapping
    const caFirmId = decoded.companyId || decoded.userId;
    const caFirm = await CA.findById(caFirmId);

    if (!caFirm.clients.includes(companyId)) {
        return NextResponse.json({ error: "Unauthorized client modification" }, { status: 403 });
    }

    // Save the Base64 document
    const newReport = await Report.create({
      companyId,
      uploadedBy: decoded.userId, // ID of the specific CA staff member who uploaded it
      staffName: decoded.name || "CA Staff",
      clientName,
      period,
      reportType,
      fileData,
      status: status || "Clean (Verified)"
    });

    return NextResponse.json({ success: true, data: newReport }, { status: 201 });

  } catch (error) {
    console.error("POST CA Audit Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}