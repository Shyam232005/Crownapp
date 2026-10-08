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
    const { totalAmount, totalTax = 0, customerName, invoiceNumber, hsnCode } = body;

    if (!totalAmount || !customerName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const isEmployee = decoded.role === 'Employee';
    const status = isEmployee ? 'PENDING_OWNER_APPROVAL' : 'PENDING_CA_REVIEW';

    // 1. Create Transaction Record
    const txDoc = await Transaction.create({
      companyId: decoded.companyId,
      createdBy: decoded.userId,
      type: 'SALES',
      status,
      totalAmount,
      taxAmount: totalTax, 
      metadata: { invoiceNumber, customerName, vendorName: customerName, hsnCode } 
    });

    const transactionId = txDoc._id;

    // 2. If entered directly by Owner, immediately generate double-entry ledger rows
    // (If entered by Employee, it remains in PENDING_OWNER_APPROVAL until Owner approves)
    if (!isEmployee) {
      const ledgerEntries = [
        { transactionId, companyId: decoded.companyId, accountName: `${customerName} (Debtor) A/C`, type: 'DEBIT', amount: totalAmount },
        { transactionId, companyId: decoded.companyId, accountName: 'Sales Revenue A/C', type: 'CREDIT', amount: totalAmount }
      ];
      await LedgerEntry.insertMany(ledgerEntries);
    }

    return NextResponse.json({ 
      success: true, 
      transactionId,
      status,
      message: isEmployee ? "Sale logged and sent to Owner Approval Queue" : "Sale recorded and posted to ledger"
    }, { status: 201 });

  } catch (error) {
    console.error('Sales Entry Error:', error);
    return NextResponse.json({ error: 'Failed to process sale' }, { status: 500 });
  }
}