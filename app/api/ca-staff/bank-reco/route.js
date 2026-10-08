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

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "CA" && decoded.role !== "CA-Employee") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    if (!clientId) {
        return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
    }

    await connectDB();
    
    // Security check: Ensure the CA actually manages this client
    const caFirmId = decoded.companyId || decoded.userId;
    const caFirm = await CA.findById(caFirmId);

    if (!caFirm.clients.includes(clientId)) {
        return NextResponse.json({ error: "Unauthorized client access" }, { status: 403 });
    }

    // Fetch the reconciliation data for the specific client
    const recoData = await BankReco.find({ companyId: clientId }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: recoData }, { status: 200 });

  } catch (error) {
    console.error("GET Bank Reco Error:", error);
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
    const { companyId, desc, date, bankAmt, match, bookAmt } = body;

    if (!companyId || !desc || bankAmt === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify CA owns the requested mapping
    const caFirmId = decoded.companyId || decoded.userId;
    const caFirm = await CA.findById(caFirmId);

    if (!caFirm.clients.includes(companyId)) {
        return NextResponse.json({ error: "Unauthorized client access" }, { status: 403 });
    }

    // Create the mock/parsed reconciliation entry
    const newRecoEntry = await BankReco.create({
      companyId,
      caId: decoded.userId, // The specific staff member who uploaded it
      desc,
      date,
      bankAmt,
      match: match || false,
      bookAmt: bookAmt || null
    });

    return NextResponse.json({ success: true, data: newRecoEntry }, { status: 201 });

  } catch (error) {
    console.error("POST Bank Reco Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}