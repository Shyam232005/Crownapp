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

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "CA" && decoded.role !== "CA-Employee") {
      return NextResponse.json({ error: "Forbidden: CA access only" }, { status: 403 });
    }

    await connectDB();
    const body = await request.json();
    const { clientId, format } = body;

    if (!clientId) {
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 });
    }

    // 1. Verify this CA Firm actually manages this client
    const caFirmId = decoded.companyId || decoded.userId;
    const caFirm = await CA.findById(caFirmId);

    if (!caFirm.clients.includes(clientId)) {
      return NextResponse.json({ error: "Unauthorized access to client data" }, { status: 403 });
    }

    // 2. Fetch ONLY 'APPROVED' transactions
    const transactions = await Transaction.find({
      companyId: clientId,
      status: "APPROVED"
    }).sort({ transactionDate: 1 });

    if (transactions.length === 0) {
      return NextResponse.json({ error: "No new approved transactions found to export." }, { status: 400 });
    }

    // 3. Build the CSV Document
    let csvContent = "Date,Voucher Type,Party Ledger Name,Amount,Status,Description\n";
    
    transactions.forEach(tx => {
      const date = new Date(tx.transactionDate || tx.createdAt).toLocaleDateString('en-IN');
      const party = (tx.metadata?.vendorName || tx.metadata?.customerName || tx.metadata?.payeeName || "Internal").replace(/,/g, ' ');
      const desc = (tx.metadata?.description || "").replace(/,/g, ' ');
      
      csvContent += `${date},${tx.type},${party},${tx.totalAmount},EXPORTED,${desc}\n`;
    });

    // 4. Update status to EXPORTED so they aren't downloaded again next month
    const txIds = transactions.map(tx => tx._id);
    await Transaction.updateMany(
      { _id: { $in: txIds } },
      { $set: { status: "EXPORTED" } }
    );

    // 5. Log the bulk action for compliance tracking
    await AuditLog.create({
      entityId: clientId, 
      entityName: 'Bulk Export',
      action: `CA_EXPORT_${(format || 'csv').toUpperCase()}`,
      performedBy: decoded.userId,
      changes: { recordsExported: transactions.length }
    });

    // Return the raw text file to the frontend blob generator
    return NextResponse.json({
      success: true,
      fileData: csvContent,
      filename: `FineOps_Export_${clientId.slice(-6)}_${new Date().toISOString().split('T')[0]}.csv`
    }, { status: 200 });

  } catch (error) {
    console.error("Export API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}