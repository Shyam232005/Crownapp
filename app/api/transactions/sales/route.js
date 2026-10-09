import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import LedgerEntry from '@/models/LedgerEntry';
import Customer from '@/models/Customer';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    
    const amountVal = body.totalAmount ?? body.baseAmount ?? body.amount;
    const customerName = body.customerName || body.partyName;
    const invoiceNumber = body.invoiceNumber || `INV-${Date.now()}`;
    const hsnCode = body.hsnCode || '0000';
    const totalTax = Number(body.totalTax || body.taxAmount || 0);

    if (!amountVal || !customerName) {
      return NextResponse.json({ error: 'Missing required fields: customerName and amount' }, { status: 400 });
    }

    const totalAmount = Number(amountVal);
    const companyId = decoded.companyId || decoded.userId;
    const targetCompanyId = new mongoose.Types.ObjectId(companyId);

    const isEmployee = decoded.role === 'Employee';
    const status = isEmployee ? 'PENDING_OWNER_APPROVAL' : 'PENDING_CA_REVIEW';

    const rawType = (body.type || "SALES").toString().trim();
    const isAdvance = ["ADVANCE_RECEIVED", "COLLECTION", "Customer Received", "PAYMENT_IN"].includes(rawType);
    const txnType = isAdvance ? "ADVANCE_RECEIVED" : "SALES";
    const paymentMode = body.paymentMode || body.paymentMethod || "UPI";

    // 1. Create Transaction Record
    const txDoc = await Transaction.create({
      companyId: targetCompanyId,
      createdBy: new mongoose.Types.ObjectId(decoded.userId),
      type: txnType,
      status,
      amount: totalAmount,
      totalAmount,
      taxAmount: totalTax, 
      paymentMethod: paymentMode,
      receiptNumber: body.receiptNumber || invoiceNumber,
      metadata: { 
        invoiceNumber, 
        receiptNumber: body.receiptNumber || invoiceNumber,
        customerName: customerName.trim(), 
        vendorName: customerName.trim(), 
        paymentMode,
        paymentMethod: paymentMode,
        hsnCode,
        description: body.description || '' 
      } 
    });

    const transactionId = txDoc._id;

    // 2. Upsert customer in Customer Khata
    // If advance: subtract from balance (-totalAmount)
    // If sales: add to balance (+totalAmount)
    try {
      const balanceDelta = isAdvance ? -totalAmount : totalAmount;
      await Customer.findOneAndUpdate(
        { companyId: targetCompanyId, name: customerName.trim() },
        { 
          $setOnInsert: { companyId: targetCompanyId, name: customerName.trim() },
          $inc: { balance: balanceDelta }
        },
        { upsert: true, new: true }
      );
    } catch (custErr) {
      console.warn("Non-fatal: could not update customer khata balance:", custErr.message);
    }

    // 3. If entered directly by Owner, immediately generate double-entry ledger rows
    if (!isEmployee) {
      const ledgerEntries = isAdvance ? [
        { transactionId, companyId: targetCompanyId, accountName: `${paymentMode} A/C`, type: 'DEBIT', amount: totalAmount },
        { transactionId, companyId: targetCompanyId, accountName: `${customerName.trim()} Advances A/C`, type: 'CREDIT', amount: totalAmount }
      ] : [
        { transactionId, companyId: targetCompanyId, accountName: `${customerName.trim()} (Debtor) A/C`, type: 'DEBIT', amount: totalAmount },
        { transactionId, companyId: targetCompanyId, accountName: 'Sales Revenue A/C', type: 'CREDIT', amount: totalAmount }
      ];
      await LedgerEntry.insertMany(ledgerEntries);
    }

    return NextResponse.json({ 
      success: true, 
      transactionId,
      status,
      data: txDoc,
      message: isEmployee ? "Sale logged and sent to Owner Approval Queue" : "Sale recorded and posted to ledger"
    }, { status: 201 });

  } catch (error) {
    console.error('Sales Entry Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process sale' }, { status: 500 });
  }
}