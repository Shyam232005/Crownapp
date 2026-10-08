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
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "Employee") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const body = await request.json();
    const { type, partyName, amount, paymentMode, description, billNumber, billDate, gstin } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
    }

    // Map UI types to Double-Entry system constants
    let mappedType = "EXPENSE";
    let debitAccount = "Expense A/C";
    let creditAccount = "Cash/Bank A/C";

    if (type === "Sales Invoice") {
        mappedType = "SALES";
        debitAccount = "Accounts Receivable";
        creditAccount = "Sales A/C";
    } else if (type === "Customer Received") {
        mappedType = "COLLECTION";
        debitAccount = "Cash/Bank A/C";
        creditAccount = "Accounts Receivable";
    } else if (type === "Vendor Payment") {
        mappedType = "PURCHASE";
        debitAccount = "Purchases A/C";
        creditAccount = "Accounts Payable";
    }

    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    try {
      // 1. Create the Transaction Record (Pending Owner Approval)
      const txArray = await Transaction.create([{
        companyId: decoded.companyId,
        createdBy: decoded.userId,
        type: mappedType,
        status: "PENDING_OWNER_APPROVAL",
        totalAmount: amount,
        transactionDate: billDate ? new Date(billDate) : new Date(),
        metadata: { 
            vendorName: partyName, 
            customerName: partyName,
            payeeName: partyName,
            paymentMode, 
            description, 
            invoiceNumber: billNumber,
            gstin
        } 
      }], { session: dbSession });

      const transactionId = txArray[0]._id;

      // 2. Build the Double-Entry Ledger mapping
      const ledgerEntries = [
        { transactionId, companyId: decoded.companyId, accountName: debitAccount, type: 'DEBIT', amount },
        { transactionId, companyId: decoded.companyId, accountName: creditAccount, type: 'CREDIT', amount }
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
    console.error("Employee Submission Error:", error);
    return NextResponse.json({ error: "Failed to process entry" }, { status: 500 });
  }
}