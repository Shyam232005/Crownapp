import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import CA from "@/models/CA";
import CAStaff from "@/models/CAStaff";
import Transaction from "@/models/Transaction";
import AuditLog from "@/models/AuditLog";
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
    if (!["CA", "CAStaff", "CA-Employee"].includes(decoded.role)) {
      return NextResponse.json({ error: "Forbidden: CA staff access only" }, { status: 403 });
    }

    await connectDB();

    let caFirmId = decoded.companyId || decoded.userId;
    if (decoded.role === "CAStaff" || decoded.role === "CA-Employee") {
      const staffMember = await CAStaff.findById(decoded.userId);
      if (staffMember) caFirmId = staffMember.caFirmId;
    }

    const caFirm = await CA.findById(caFirmId);
    if (!caFirm || !caFirm.clients || caFirm.clients.length === 0) {
      return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }

    // Fetch transactions across ALL connected clients
    const vouchers = await Transaction.find({
      companyId: { $in: caFirm.clients },
      status: { $in: ["PENDING_CA_REVIEW", "QUERY_RAISED", "APPROVED", "EXPORTED"] }
    })
    .populate("companyId", "companyName")
    .sort({ updatedAt: -1 });

    return NextResponse.json({ success: true, data: vouchers }, { status: 200 });

  } catch (error) {
    console.error("GET Global Vouchers Error:", error);
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
    const { transactionId, status } = await request.json();

    if (!transactionId || !status) {
      return NextResponse.json({ error: "Transaction ID and status are required" }, { status: 400 });
    }

    // Find the transaction and verify it belongs to one of the CA's clients
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    let caFirmId = decoded.companyId || decoded.userId;
    if (decoded.role === "CAStaff" || decoded.role === "CA-Employee") {
      const staffMember = await CAStaff.findById(decoded.userId);
      if (staffMember) caFirmId = staffMember.caFirmId;
    }

    const caFirm = await CA.findById(caFirmId);
    if (!caFirm.clients.includes(transaction.companyId.toString())) {
      return NextResponse.json({ error: "Unauthorized access to client data" }, { status: 403 });
    }

    // Update the transaction status
    transaction.status = status;
    await transaction.save();

    // Log the audit event so the Owner sees it in their CA-Hub
    await AuditLog.create({
      entityId: transaction.companyId,
      entityName: "Transaction",
      action: status === "APPROVED" ? "CA_AUDIT_APPROVED" : "QUERY_RAISED",
      performedBy: decoded.userId,
      changes: { transactionId, status }
    });

    return NextResponse.json({ success: true, data: transaction }, { status: 200 });

  } catch (error) {
    console.error("PATCH Global Vouchers Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}