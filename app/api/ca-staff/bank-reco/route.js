import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import CA from "@/models/CA";
import BankReco from "@/models/BankReco"; // Assuming this model from your screenshot

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

import CAStaff from "@/models/CAStaff";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const isCA = decoded.role === "CA" || decoded.normalizedRole === "CA";
    const isStaff = decoded.role === "CAStaff" || decoded.role === "CA-Employee" || decoded.role === "CA_STAFF" || decoded.normalizedRole === "CA_STAFF";

    if (!isCA && !isStaff) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    if (!clientId) {
        return NextResponse.json({ success: false, error: "Client ID is required" }, { status: 400 });
    }

    await connectDB();
    
    if (isStaff) {
      const staffMember = await CAStaff.findById(decoded.userId);
      const assignedIds = (staffMember?.assignedCompanies?.length ? staffMember.assignedCompanies : (staffMember?.assignedClients || [])).map(id => id.toString());
      if (!assignedIds.includes(clientId.toString())) {
        return NextResponse.json({ success: false, error: "Unauthorized client access" }, { status: 403 });
      }
    } else {
      const caFirmId = decoded.caFirmId || decoded.companyId || decoded.userId;
      const caFirm = await CA.findById(caFirmId);
      const allIds = (caFirm ? [...(caFirm.clientCompanies || []), ...(caFirm.clients || [])] : []).map(id => id.toString());
      if (!allIds.includes(clientId.toString())) {
        return NextResponse.json({ success: false, error: "Unauthorized client access" }, { status: 403 });
      }
    }

    // Fetch the reconciliation data for the specific client
    const recoData = await BankReco.find({ companyId: clientId }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: recoData }, { status: 200 });

  } catch (error) {
    console.error("GET Bank Reco Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const isCA = decoded.role === "CA" || decoded.normalizedRole === "CA";
    const isStaff = decoded.role === "CAStaff" || decoded.role === "CA-Employee" || decoded.role === "CA_STAFF" || decoded.normalizedRole === "CA_STAFF";

    if (!isCA && !isStaff) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const body = await request.json().catch(() => ({}));
    const { companyId, desc, date, bankAmt, match, bookAmt } = body;

    if (!companyId || !desc || bankAmt === undefined) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    if (isStaff) {
      const staffMember = await CAStaff.findById(decoded.userId);
      const assignedIds = (staffMember?.assignedCompanies?.length ? staffMember.assignedCompanies : (staffMember?.assignedClients || [])).map(id => id.toString());
      if (!assignedIds.includes(companyId.toString())) {
        return NextResponse.json({ success: false, error: "Unauthorized client access" }, { status: 403 });
      }
    } else {
      const caFirmId = decoded.caFirmId || decoded.companyId || decoded.userId;
      const caFirm = await CA.findById(caFirmId);
      const allIds = (caFirm ? [...(caFirm.clientCompanies || []), ...(caFirm.clients || [])] : []).map(id => id.toString());
      if (!allIds.includes(companyId.toString())) {
        return NextResponse.json({ success: false, error: "Unauthorized client access" }, { status: 403 });
      }
    }

    // Create the mock/parsed reconciliation entry
    const newRecoEntry = await BankReco.create({
      companyId,
      caId: decoded.userId, // The specific staff member who uploaded it
      desc,
      date: date ? new Date(date) : new Date(),
      bankAmt: Number(bankAmt),
      match: match || false,
      bookAmt: bookAmt !== undefined ? Number(bookAmt) : null
    });

    return NextResponse.json({ success: true, data: newRecoEntry }, { status: 201 });

  } catch (error) {
    console.error("POST Bank Reco Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}