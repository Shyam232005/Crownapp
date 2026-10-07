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
    const { category, totalAmount, payeeName, description } = body;

    if (!totalAmount || !payeeName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    try {
      // 1. Create the Transaction Record
      const txArray = await Transaction.create([{
        companyId: decoded.companyId,
        createdBy: decoded.userId,
        type: 'EXPENSE',
        // Employees require owner approval. Owners bypass straight to CA.
        status: decoded.role === 'Employee' ? 'PENDING_OWNER_APPROVAL' : 'PENDING_CA_REVIEW',
        totalAmount,
        metadata: { payeeName, category, description } 
      }], { session: dbSession });

      const transactionId = txArray[0]._id;

      // 2. Build the Double-Entry Ledger mapping
      const ledgerEntries = [
        { transactionId, companyId: decoded.companyId, accountName: `${category} A/C`, type: 'DEBIT', amount: totalAmount },
        { transactionId, companyId: decoded.companyId, accountName: 'Cash/Bank A/C', type: 'CREDIT', amount: totalAmount }
      ];

      await LedgerEntry.insertMany(ledgerEntries, { session: dbSession });

      await dbSession.commitTransaction();
      dbSession.endSession();

      return NextResponse.json({ success: true, transactionId }, { status: 201 });
    } catch (dbError) {
      await dbSession.abortTransaction();
      dbSession.endSession();
      throw dbError;
    }
  } catch (error) {
    console.error('Expense Entry Error:', error);
    return NextResponse.json({ error: 'Failed to process expense' }, { status: 500 });
  }
}