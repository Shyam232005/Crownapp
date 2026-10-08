import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import Transaction from '@/models/Transaction';
import LedgerEntry from '@/models/LedgerEntry';
import Customer from '@/models/Customer';

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

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const query = { companyId: targetCompanyId };
    if (type) query.type = type;
    if (status) query.status = status;

    const transactions = await Transaction.find(query).sort({ transactionDate: -1, createdAt: -1 });

    return NextResponse.json({ success: true, data: transactions }, {
      status: 200,
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
    });
  } catch (error) {
    console.error("GET Transactions Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) return NextResponse.json({ error: "Invalid session" }, { status: 401 });

    await connectDB();
    const body = await request.json();

    const amountNum = Number(body.totalAmount ?? body.amount ?? body.baseAmount ?? 0);
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json({ error: "A valid positive amount is required." }, { status: 400 });
    }

    // Normalize transaction type
    let rawType = (body.type || "EXPENSE").toString().trim();
    let normalizedType = "EXPENSE";

    if (rawType === "Customer Received" || rawType === "Advance Received" || rawType === "ADVANCE_RECEIVED" || rawType === "PAYMENT_IN" || rawType === "Collection" || rawType === "COLLECTION") {
      normalizedType = "ADVANCE_RECEIVED";
    } else if (rawType === "Sales Invoice" || rawType === "Sales" || rawType === "SALES") {
      normalizedType = "SALES";
    } else if (rawType === "Vendor Payment" || rawType === "Purchase" || rawType === "PURCHASE") {
      normalizedType = "PURCHASE";
    } else if (rawType === "Income" || rawType === "INCOME") {
      normalizedType = "INCOME";
    } else {
      normalizedType = "EXPENSE";
    }

    const companyId = decoded.companyId || decoded.userId;
    const targetCompanyId = new mongoose.Types.ObjectId(companyId);
    const isEmployee = decoded.role === 'Employee';
    const status = isEmployee ? 'PENDING_OWNER_APPROVAL' : 'APPROVED';

    const party = (body.customerName || body.partyName || body.vendorName || body.payeeName || "General").trim();
    const mode = body.paymentMethod || body.paymentMode || "Cash";
    const receiptNumber = body.receiptNumber || body.invoiceNumber || body.billNumber || "";

    // 1. Create Transaction Doc
    const txDoc = await Transaction.create({
      companyId: targetCompanyId,
      createdBy: decoded.userId.toString(),
      type: normalizedType,
      status,
      amount: amountNum,
      totalAmount: amountNum,
      receiptNumber,
      paymentMethod: mode,
      transactionDate: body.transactionDate ? new Date(body.transactionDate) : (body.billDate ? new Date(body.billDate) : new Date()),
      metadata: {
        vendorName: party,
        customerName: party,
        payeeName: party,
        paymentMode: mode,
        paymentMethod: mode,
        receiptNumber,
        invoiceNumber: body.invoiceNumber || receiptNumber,
        description: body.description || "",
        category: body.category || normalizedType,
        gstin: body.gstin || ""
      }
    });

    // 2. Customer Khata Update Logic:
    // ADVANCE_RECEIVED or PAYMENT_IN must subtract from customer due (-$)
    // SALES adds to customer due (+$)
    if (party && party !== "General" && ["ADVANCE_RECEIVED", "SALES", "COLLECTION"].includes(normalizedType)) {
      try {
        const isDeduction = ["ADVANCE_RECEIVED", "COLLECTION"].includes(normalizedType);
        const delta = isDeduction ? -amountNum : amountNum;

        await Customer.findOneAndUpdate(
          { companyId: targetCompanyId, name: party },
          { 
            $setOnInsert: { companyId: targetCompanyId, name: party },
            $inc: { balance: delta }
          },
          { upsert: true, new: true }
        );
      } catch (err) {
        console.warn("Could not update customer khata balance:", err.message);
      }
    }

    // 3. Double-entry ledger insertion (if status is APPROVED)
    if (status === 'APPROVED') {
      try {
        const ledgerEntries = [];
        if (normalizedType === 'ADVANCE_RECEIVED' || normalizedType === 'COLLECTION') {
          // Debit Cash/Bank, Credit Customer Advances
          ledgerEntries.push(
            { transactionId: txDoc._id, companyId: targetCompanyId, accountName: `${mode} A/C`, type: 'DEBIT', amount: amountNum },
            { transactionId: txDoc._id, companyId: targetCompanyId, accountName: `${party} Advances A/C`, type: 'CREDIT', amount: amountNum }
          );
        } else if (normalizedType === 'SALES') {
          // Debit Customer (Debtor), Credit Sales Revenue
          ledgerEntries.push(
            { transactionId: txDoc._id, companyId: targetCompanyId, accountName: `${party} (Debtor) A/C`, type: 'DEBIT', amount: amountNum },
            { transactionId: txDoc._id, companyId: targetCompanyId, accountName: 'Sales Revenue A/C', type: 'CREDIT', amount: amountNum }
          );
        } else if (normalizedType === 'EXPENSE') {
          // Debit Expense, Credit Cash/Bank
          ledgerEntries.push(
            { transactionId: txDoc._id, companyId: targetCompanyId, accountName: `${body.category || 'General'} Expense A/C`, type: 'DEBIT', amount: amountNum },
            { transactionId: txDoc._id, companyId: targetCompanyId, accountName: `${mode} A/C`, type: 'CREDIT', amount: amountNum }
          );
        } else if (normalizedType === 'PURCHASE') {
          // Debit Purchases, Credit Vendor
          ledgerEntries.push(
            { transactionId: txDoc._id, companyId: targetCompanyId, accountName: 'Purchases / Inventory A/C', type: 'DEBIT', amount: amountNum },
            { transactionId: txDoc._id, companyId: targetCompanyId, accountName: `${party} (Creditor) A/C`, type: 'CREDIT', amount: amountNum }
          );
        }
        if (ledgerEntries.length > 0) {
          await LedgerEntry.insertMany(ledgerEntries);
        }
      } catch (ledgerErr) {
        console.error("Ledger posting error:", ledgerErr);
      }
    }

    return NextResponse.json({
      success: true,
      transactionId: txDoc._id,
      data: txDoc,
      status,
      message: isEmployee ? "Entry queued for owner review." : "Transaction recorded and posted."
    }, { status: 201 });

  } catch (error) {
    console.error("POST Transactions Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process transaction" }, { status: 500 });
  }
}
