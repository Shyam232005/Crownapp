import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import CAStaff from "@/models/CAStaff";
import TaxDraft from "@/models/TaxDraft";

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
    if (!["CA", "CAStaff", "CA-Employee"].includes(decoded.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    
    // Get Firm ID
    let caFirmId = decoded.companyId || decoded.userId;
    if (decoded.role === "CAStaff" || decoded.role === "CA-Employee") {
      const staffMember = await CAStaff.findById(decoded.userId);
      if (staffMember) caFirmId = staffMember.caFirmId;
    }

    const drafts = await TaxDraft.find({ caFirmId }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: drafts }, { status: 200 });

  } catch (error) {
    console.error("GET Tax Drafts Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!["CA", "CAStaff", "CA-Employee"].includes(decoded.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const body = await request.json();
    const { clientId, clientName, month, outputTax, itc, liability } = body;

    if (!clientId || outputTax === undefined || itc === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let caFirmId = decoded.companyId || decoded.userId;
    if (decoded.role === "CAStaff" || decoded.role === "CA-Employee") {
      const staffMember = await CAStaff.findById(decoded.userId);
      if (staffMember) caFirmId = staffMember.caFirmId;
    }

    const newDraft = await TaxDraft.create({
      caFirmId,
      companyId: clientId,
      clientName,
      month,
      outputTax,
      itc,
      liability,
      status: "Draft",
      createdBy: decoded.userId
    });

    return NextResponse.json({ success: true, data: newDraft }, { status: 201 });

  } catch (error) {
    console.error("POST Tax Draft Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!["CA", "CAStaff", "CA-Employee"].includes(decoded.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const { id, status } = await request.json();

    const updatedDraft = await TaxDraft.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updatedDraft }, { status: 200 });

  } catch (error) {
    console.error("PATCH Tax Draft Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}