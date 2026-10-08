import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import Transaction from '@/models/Transaction';

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

// 1. Employee POST: Create Voucher with forced companyId, createdBy, and PENDING_OWNER_APPROVAL
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();

    const rawAmount = body.amount ?? body.totalAmount ?? body.total ?? 0;
    const amountNum = Number(rawAmount);

    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json({ error: "A valid positive amount is required." }, { status: 400 });
    }

    // Determine GAAP Transaction Type
    let transactionType = (body.type || "EXPENSE").toString().trim();
    if (transactionType === "Sales Invoice" || transactionType === "Sales") transactionType = "SALES";
    else if (transactionType === "Vendor Payment" || transactionType === "Purchase") transactionType = "PURCHASE";
    else if (transactionType === "General Expense" || transactionType === "Expense") transactionType = "EXPENSE";
    else if (transactionType === "Customer Received" || transactionType === "Collection") transactionType = "COLLECTION";

    // Force companyId and createdBy to match the JWT payload strictly
    const companyId = decoded.companyId || decoded.userId;
    const createdBy = decoded.userId;

    const newTransaction = await Transaction.create({
      companyId: new mongoose.Types.ObjectId(companyId),
      createdBy: createdBy.toString(),
      type: transactionType,
      amount: amountNum,
      totalAmount: amountNum,
      status: 'PENDING_OWNER_APPROVAL',
      transactionDate: body.transactionDate ? new Date(body.transactionDate) : (body.billDate ? new Date(body.billDate) : new Date()),
      metadata: {
        vendorName: body.vendorName || body.partyName || body.payeeName || "General",
        customerName: body.customerName || body.partyName || "",
        payeeName: body.payeeName || body.partyName || "",
        paymentMode: body.paymentMode || "Cash",
        description: body.description || "",
        invoiceNumber: body.invoiceNumber || body.billNumber || "",
        gstin: body.gstin || "",
        category: body.category || transactionType
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "Voucher created and queued for owner approval.",
      transaction: newTransaction,
      data: newTransaction 
    }, { status: 201 });

  } catch (error) {
    console.error("Employee POST Transaction Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create voucher" }, { status: 500 });
  }
}

// 2. Employee GET: View Own Vouchers sorted by createdAt descending
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    await connectDB();

    // Query strictly for own vouchers createdBy this user
    const data = await Transaction.find({ createdBy: decoded.userId })
      .sort({ createdAt: -1 });

    return NextResponse.json(data);

  } catch (error) {
    console.error('Employee GET Transactions Error:', error);
    return NextResponse.json({ error: 'Failed to fetch vouchers' }, { status: 500 });
  }
}