import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import CA from "@/models/CA";
import Transaction from "@/models/Transaction";
import AuditLog from "@/models/AuditLog";

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
    
    // CA Firm ID is stored in companyId for CAStaff, or userId for the CA Owner
    const caFirmId = decoded.companyId || decoded.userId;
    const caFirm = await CA.findById(caFirmId);
    
    if (!caFirm || !caFirm.clients || caFirm.clients.length === 0) {
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    // Fetch transactions for all clients linked to this CA Firm
    // Only pull items that have passed Owner Approval
    const transactions = await Transaction.find({
      companyId: { $in: caFirm.clients },
      status: { $in: ["PENDING_CA_REVIEW", "QUERY_RAISED", "APPROVED", "EXPORTED"] }
    })
    .populate("companyId", "companyName") // Get the business name for the UI table
    .sort({ transactionDate: -1, createdAt: -1 });

    return NextResponse.json({ success: true, data: transactions }, { status: 200 });
  } catch (error) {
    console.error("GET CA Vouchers Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request) {
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
    const { transactionId, status } = body;

    if (!transactionId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify the CA firm is authorized for the transaction's company
    const caFirmId = decoded.companyId || decoded.userId;
    const caFirm = await CA.findById(caFirmId);
    
    const transaction = await Transaction.findById(transactionId);
    if (!transaction) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

    if (!caFirm.clients.includes(transaction.companyId.toString())) {
       return NextResponse.json({ error: "Unauthorized client modification" }, { status: 403 });
    }

    // Apply the audit decision
    transaction.status = status;
    await transaction.save();

    await AuditLog.create({
      entityId: transaction._id,
      entityName: 'Transaction',
      action: `CA_AUDIT_${status}`,
      performedBy: decoded.userId,
      changes: { statusChangedTo: status }
    });

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("PATCH CA Vouchers Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}