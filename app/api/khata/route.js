import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import Customer from '@/models/Customer';
import Transaction from '@/models/Transaction';
import LedgerEntry from '@/models/LedgerEntry';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    const [customers, transactions] = await Promise.all([
      Customer.find({ companyId: targetCompanyId }).sort({ name: 1 }),
      Transaction.find({
        companyId: targetCompanyId,
        type: { $in: ["SALES", "ADVANCE_RECEIVED", "COLLECTION", "PAYMENT_IN"] }
      }).sort({ transactionDate: -1, createdAt: -1 }).limit(100)
    ]);

    return NextResponse.json({
      success: true,
      customers,
      transactions,
      data: { customers, transactions }
    }, {
      status: 200,
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
    });

  } catch (error) {
    console.error("GET Khata Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch khata data" }, { status: 500 });
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

    const { customerName, partyName, type, amount, paymentMode, paymentMethod, invoiceNumber, receiptNumber, description } = body;
    const name = (customerName || partyName || "").trim();
    const amountNum = Number(amount || body.totalAmount || body.baseAmount || 0);

    if (!name || isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json({ error: "Customer name and positive amount are required." }, { status: 400 });
    }

    const companyId = decoded.companyId || decoded.userId;
    const targetCompanyId = new mongoose.Types.ObjectId(companyId);

    const rawType = (type || "SALES").toString().trim();
    const isAdvanceOrPayment = [
      "ADVANCE_RECEIVED", "PAYMENT_IN", "COLLECTION", "Customer Received", "Advance Received"
    ].includes(rawType);

    const normalizedType = isAdvanceOrPayment ? "ADVANCE_RECEIVED" : "SALES";

    // Khata update logic: ADVANCE_RECEIVED or PAYMENT_IN subtracts (-$) from customer's total due
    const delta = isAdvanceOrPayment ? -amountNum : amountNum;

    let customer = await Customer.findOne({ companyId: targetCompanyId, name });
    if (!customer) {
      if (decoded.role === 'Employee') {
        return NextResponse.json({
          error: "Selected customer does not exist in the Owner's unified directory. Employees may only transact with registered customers."
        }, { status: 400 });
      }
      customer = await Customer.create({
        companyId: targetCompanyId,
        name,
        balance: delta
      });
    } else {
      customer.balance = (customer.balance || 0) + delta;
      await customer.save();
    }

    const isEmployee = decoded.role === 'Employee';
    const status = isEmployee ? 'PENDING_OWNER_APPROVAL' : 'APPROVED';
    const mode = paymentMethod || paymentMode || "UPI";

    const newTx = await Transaction.create({
      companyId: targetCompanyId,
      createdBy: decoded.userId.toString(),
      type: normalizedType,
      status,
      amount: amountNum,
      totalAmount: amountNum,
      receiptNumber: receiptNumber || invoiceNumber || "",
      paymentMethod: mode,
      metadata: {
        customerName: name,
        vendorName: name,
        paymentMode: mode,
        paymentMethod: mode,
        invoiceNumber: invoiceNumber || "",
        receiptNumber: receiptNumber || "",
        description: description || (isAdvanceOrPayment ? "Advance / Payment Received" : "Sales Invoice Entry")
      }
    });

    if (status === 'APPROVED') {
      try {
        const ledgerEntries = [];
        if (isAdvanceOrPayment) {
          ledgerEntries.push(
            { transactionId: newTx._id, companyId: targetCompanyId, accountName: `${mode} A/C`, type: 'DEBIT', amount: amountNum },
            { transactionId: newTx._id, companyId: targetCompanyId, accountName: `${name} Advances A/C`, type: 'CREDIT', amount: amountNum }
          );
        } else {
          ledgerEntries.push(
            { transactionId: newTx._id, companyId: targetCompanyId, accountName: `${name} (Debtor) A/C`, type: 'DEBIT', amount: amountNum },
            { transactionId: newTx._id, companyId: targetCompanyId, accountName: 'Sales Revenue A/C', type: 'CREDIT', amount: amountNum }
          );
        }
        await LedgerEntry.insertMany(ledgerEntries);
      } catch (ledgerErr) {
        console.error("Ledger creation error:", ledgerErr);
      }
    }

    return NextResponse.json({
      success: true,
      customer,
      transaction: newTx,
      balance: customer.balance,
      message: isAdvanceOrPayment ? "Advance payment credited to customer ledger." : "Sale added to customer ledger."
    }, { status: 201 });

  } catch (error) {
    console.error("POST Khata Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update khata entry" }, { status: 500 });
  }
}
