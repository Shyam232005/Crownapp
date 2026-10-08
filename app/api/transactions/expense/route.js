import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import Transaction from '@/models/Transaction';
import LedgerEntry from '@/models/LedgerEntry';

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

    await connectDB();
    const body = await request.json();
    const { category, totalAmount, payeeName, description, paymentMode = "Cash" } = body;

    if (!totalAmount || !payeeName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const isEmployee = decoded.role === 'Employee';
    const status = isEmployee ? 'PENDING_OWNER_APPROVAL' : 'PENDING_CA_REVIEW';

    // 1. Create the Transaction Record
    const txDoc = await Transaction.create({
      companyId: decoded.companyId,
      createdBy: decoded.userId,
      type: 'EXPENSE',
      status,
      totalAmount,
      metadata: { payeeName, category, description, paymentMode } 
    });

    const transactionId = txDoc._id;

    // 2. If entered directly by Owner, generate Double-Entry Ledger rows immediately
    // If entered by Employee, stays in PENDING_OWNER_APPROVAL until Owner approval
    if (!isEmployee) {
      const ledgerEntries = [
        { transactionId, companyId: decoded.companyId, accountName: `${category || 'Operating'} Expense A/C`, type: 'DEBIT', amount: totalAmount },
        { transactionId, companyId: decoded.companyId, accountName: `${paymentMode} A/C`, type: 'CREDIT', amount: totalAmount }
      ];
      await LedgerEntry.insertMany(ledgerEntries);
    }

    return NextResponse.json({ 
      success: true, 
      transactionId,
      status,
      message: isEmployee ? "Expense logged and queued for Owner review" : "Expense recorded in general ledger"
    }, { status: 201 });

  } catch (error) {
    console.error('Expense Entry Error:', error);
    return NextResponse.json({ error: 'Failed to process expense' }, { status: 500 });
  }
}