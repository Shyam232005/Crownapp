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
    
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const isCA = decoded.role === "CA" || decoded.normalizedRole === "CA";
    const isStaff = decoded.role === "CAStaff" || decoded.role === "CA-Employee" || decoded.role === "CA_STAFF" || decoded.normalizedRole === "CA_STAFF";

    if (!isCA && !isStaff) {
      return NextResponse.json({ success: false, error: "Forbidden: CA staff access only" }, { status: 403 });
    }

    await connectDB();

    let assignedClientIds = [];
    if (isStaff) {
      const staffMember = await CAStaff.findById(decoded.userId);
      if (!staffMember) {
        return NextResponse.json({ success: false, error: "Staff member not found" }, { status: 404 });
      }
      assignedClientIds = staffMember.assignedCompanies?.length 
        ? staffMember.assignedCompanies 
        : (staffMember.assignedClients || []);
    } else {
      const caFirmId = decoded.caFirmId || decoded.companyId || decoded.userId;
      const caFirm = await CA.findById(caFirmId);
      assignedClientIds = caFirm ? [...(caFirm.clientCompanies || []), ...(caFirm.clients || [])] : [];
    }

    if (!assignedClientIds || assignedClientIds.length === 0) {
      return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }

    // Fetch transactions strictly across assigned clients
    const vouchers = await Transaction.find({
      companyId: { $in: assignedClientIds },
      status: { $in: ["PENDING_CA_REVIEW", "QUERY_RAISED", "APPROVED", "EXPORTED"] }
    })
    .populate("companyId", "companyName gstin")
    .sort({ updatedAt: -1 });

    return NextResponse.json({ success: true, data: vouchers }, { status: 200 });

  } catch (error) {
    console.error("GET Global Vouchers Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request) {
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
    const { transactionId, status } = await request.json().catch(() => ({}));

    if (!transactionId || !status) {
      return NextResponse.json({ success: false, error: "Transaction ID and status are required" }, { status: 400 });
    }

    // Find the transaction and verify it belongs to one of the assigned clients
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 });
    }

    let assignedClientIds = [];
    if (isStaff) {
      const staffMember = await CAStaff.findById(decoded.userId);
      assignedClientIds = staffMember 
        ? (staffMember.assignedCompanies?.length ? staffMember.assignedCompanies : staffMember.assignedClients || [])
        : [];
    } else {
      const caFirmId = decoded.caFirmId || decoded.companyId || decoded.userId;
      const caFirm = await CA.findById(caFirmId);
      assignedClientIds = caFirm ? [...(caFirm.clientCompanies || []), ...(caFirm.clients || [])] : [];
    }

    const isAuthorized = assignedClientIds.some(
      cId => cId.toString() === transaction.companyId.toString()
    );

    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: "Unauthorized access to client data" }, { status: 403 });
    }

    // Update the transaction status
    transaction.status = status;
    await transaction.save();

    // Log the audit event so the Owner sees it in their CA-Hub
    await AuditLog.create({
      entityId: transaction.companyId.toString(),
      entityName: "Transaction",
      action: status === "APPROVED" ? "CA_AUDIT_APPROVED" : "QUERY_RAISED",
      performedBy: decoded.userId.toString(),
      changes: { transactionId, status }
    });

    return NextResponse.json({ success: true, data: transaction }, { status: 200 });

  } catch (error) {
    console.error("PATCH Global Vouchers Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}