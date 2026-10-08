import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import Transaction from "@/models/Transaction";
import AuditLog from "@/models/AuditLog";
import CA from "@/models/CA";
import Owner from "@/models/Owner";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

// Handles fetching the actual export data (Tally CSV generation) with Zero-Trust enforcement
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "CA" && decoded.role !== "CA-Employee" && decoded.role !== "CAStaff") {
      return NextResponse.json({ error: "Forbidden: CA access only" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    if (!clientId) {
      return NextResponse.json({ error: "Client ID required" }, { status: 400 });
    }

    await connectDB();

    // 1. Verify CA owns the requested client mapping
    const caFirmId = decoded.companyId || decoded.userId;
    const caFirm = await CA.findById(caFirmId);

    if (!caFirm || !caFirm.clients.some(cId => cId.toString() === clientId.toString())) {
      return NextResponse.json({ error: "Unauthorized client access: client not linked to this firm" }, { status: 403 });
    }

    // 2. Zero-Trust Vault API-level Blocking
    const ownerDoc = await Owner.findById(clientId).select("vaultStatus");
    const latestUnlockLog = await AuditLog.findOne({
      entityId: clientId,
      action: "VAULT_UNLOCKED"
    }).sort({ createdAt: -1 });

    const isVaultUnlocked = (ownerDoc && ownerDoc.vaultStatus === "Unlocked") || !!latestUnlockLog;

    if (!isVaultUnlocked) {
      return NextResponse.json({ 
        error: "Zero-Trust Vault Locked: Access blocked. The SME Owner must explicitly unlock the Data Vault before vouchers can be exported." 
      }, { status: 423 });
    }

    // 3. Ensure we ONLY fetch entries that the SME Owner has marked as APPROVED
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