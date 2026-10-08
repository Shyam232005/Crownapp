import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import Transaction from "@/models/Transaction";
import AuditLog from "@/models/AuditLog";
import CA from "@/models/CA";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

// Handles fetching the actual export data (Tally CSV generation)
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
      return NextResponse.json({ error: "Client ID required" }, { status: 400 });
    }

    await connectDB();

    // Verify CA owns the requested client mapping
    const caFirmId = decoded.companyId || decoded.userId;
    const caFirm = await CA.findById(caFirmId);

    if (!caFirm.clients.includes(clientId)) {
        return NextResponse.json({ error: "Unauthorized client access" }, { status: 403 });
    }

    // Ensure we ONLY fetch entries that the SME Owner has marked as APPROVED
    const exportData = await Transaction.find({
        companyId: clientId,
        status: "APPROVED"
    }).sort({ transactionDate: 1 });

    return NextResponse.json({ success: true, data: exportData }, { status: 200 });

  } catch (error) {
    console.error("GET CA Export Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}