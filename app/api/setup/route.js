import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import Transaction from "@/models/Transaction";
import LedgerEntry from "@/models/LedgerEntry";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

export async function POST(request) {
  // We use a MongoDB session to ensure atomic writes. 
  // If the ledger entry fails, the transaction is rolled back.
  let session;
  try {
    await connectDB();
    session = await mongoose.startSession();
    session.startTransaction();

    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    
    if (!token) return NextResponse.json({ error: "Unauthorized. Please complete signup first." }, { status: 401 });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const body = await request.json();
    const { role, cashInHand, bankBalance, asOfDate } = body;

    const companyId = decoded.companyId || decoded.userId;
    const totalAmount = cashInHand + (bankBalance || 0);

    if (totalAmount <= 0) {
        // If balances are 0, just return success without writing dead ledger entries
        return NextResponse.json({ success: true, message: "No opening balances to record." }, { status: 200 });
    }

    // 1. Create the Master Transaction Record
    // Set to APPROVED immediately so it factors into live balances
    const newTransaction = await Transaction.create([{
      companyId,
      createdBy: decoded.userId,
      type: 'OPENING_BALANCE',
      status: 'APPROVED', 
      totalAmount: totalAmount,
      transactionDate: new Date(asOfDate),
      metadata: {
        description: `Initial Account Setup by ${decoded.role}`,
        isOpeningBalance: true
      }
    }], { session });

    const transactionId = newTransaction[0]._id;

    // 2. Double-Entry Physics: Debit the Assets (Cash/Bank)
    const ledgerEntries = [];
    
    if (cashInHand > 0) {
        ledgerEntries.push({
            transactionId,
            companyId,
            accountName: role === "Employee" ? `Petty Cash - ${decoded.name}` : "Cash A/C",
            type: 'DEBIT',
            amount: cashInHand
        });
    }

    if (bankBalance > 0 && role === "Owner") {
        ledgerEntries.push({
            transactionId,
            companyId,
            accountName: "Bank A/C",
            type: 'DEBIT',
            amount: bankBalance
        });
    }

    // 3. Double-Entry Physics: Credit the Equity/Capital Account
    // This balances the equation: Assets = Liabilities + Equity
    ledgerEntries.push({
        transactionId,
        companyId,
        accountName: "Opening Balance Equity",
        type: 'CREDIT',
        amount: totalAmount
    });

    // Write all ledger entries atomically
    await LedgerEntry.insertMany(ledgerEntries, { session });

    await session.commitTransaction();
    session.endSession();

    return NextResponse.json({ success: true }, { status: 201 });

  } catch (error) {
    if (session) {
        await session.abortTransaction();
        session.endSession();
    }
    console.error("POST Data Setup Error:", error);
    return NextResponse.json({ error: "Failed to securely initialize opening balances." }, { status: 500 });
  }
}