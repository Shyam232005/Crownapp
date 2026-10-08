import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import Transaction from '@/models/Transaction';

export const dynamic = 'force-dynamic';

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
    if (!decoded || !decoded.userId) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    await connectDB();

    const companyId = decoded.companyId || decoded.userId;
    const targetCompanyId = new mongoose.Types.ObjectId(companyId);

    // Fetch finalized transactions that affect cash flow
    const transactions = await Transaction.find({
      companyId: targetCompanyId,
      status: { $in: ["APPROVED", "EXPORTED"] }
    }).sort({ transactionDate: -1, createdAt: -1 });

    let totalCashIn = 0;
    let totalCashOut = 0;
    let cashBalance = 0;
    let bankBalance = 0;

    transactions.forEach((txn) => {
      const isMoneyIn = ["ADVANCE_RECEIVED", "SALES", "INCOME", "COLLECTION", "PAYMENT_IN"].includes(txn.type);
      const isMoneyOut = ["PURCHASE", "EXPENSE", "PAYMENT_OUT"].includes(txn.type);
      const amount = Number(txn.totalAmount || txn.amount || 0);

      const mode = (txn.paymentMethod || txn.metadata?.paymentMode || "UPI").toLowerCase();
      const isCash = mode.includes("cash");

      if (isMoneyIn) {
        totalCashIn += amount;
        if (isCash) cashBalance += amount;
        else bankBalance += amount;
      } else if (isMoneyOut) {
        totalCashOut += amount;
        if (isCash) cashBalance -= amount;
        else bankBalance -= amount;
      }
    });

    return NextResponse.json({
      success: true,
      totalCashIn,
      totalCashOut,
      cashBalance,
      bankBalance,
      netBalance: cashBalance + bankBalance,
      transactions,
      data: transactions
    }, {
      status: 200,
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
    });

  } catch (error) {
    console.error("GET Banking Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch banking data" }, { status: 500 });
  }
}
