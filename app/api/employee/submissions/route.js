import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import Transaction from "@/models/Transaction";

export const dynamic = "force-dynamic";

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
      return NextResponse.json({ error: "Forbidden: Only employees can log submissions" }, { status: 403 });
    }

    await connectDB();
    const body = await request.json();
    const { 
      type, partyName, amount, paymentMode, paymentMethod, 
      description, billNumber, invoiceNumber, receiptNumber, 
      billDate, gstin, category 
    } = body;

    const amountNum = Number(amount || body.totalAmount || 0);
    if (!amountNum || amountNum <= 0) {
      return NextResponse.json({ error: "Valid positive amount is required" }, { status: 400 });
    }

    // Map UI types to GAAP system constants
    let mappedType = "EXPENSE";
    if (type === "Sales Invoice" || type === "Sales") {
      mappedType = "SALES";
    } else if (type === "Customer Received" || type === "Advance Received") {
      mappedType = "ADVANCE_RECEIVED";
    } else if (type === "Vendor Payment" || type === "Purchase") {
      mappedType = "PURCHASE";
    }

    const finalInvoiceNumber = invoiceNumber || billNumber || "";
    const finalReceiptNumber = receiptNumber || "";
    const finalPaymentMethod = paymentMethod || paymentMode || "Cash";
    const companyId = decoded.companyId || decoded.userId;

    // 1. Create the Transaction Record with PENDING_OWNER_APPROVAL status
    const txDoc = await Transaction.create({
      companyId: new mongoose.Types.ObjectId(companyId),
      createdBy: decoded.userId.toString(),
      type: mappedType,
      status: "PENDING_OWNER_APPROVAL",
      amount: amountNum,
      totalAmount: amountNum,
      receiptNumber: finalReceiptNumber,
      paymentMethod: finalPaymentMethod,
      transactionDate: billDate ? new Date(billDate) : new Date(),
      metadata: { 
        vendorName: partyName || "General", 
        customerName: partyName || "General", 
        payeeName: partyName || "General", 
        paymentMode: finalPaymentMethod,
        paymentMethod: finalPaymentMethod,
        description: description || "", 
        invoiceNumber: finalInvoiceNumber,
        receiptNumber: finalReceiptNumber,
        category: category || mappedType,
        gstin: gstin || ""
      } 
    });

    return NextResponse.json({ 
      success: true, 
      transactionId: txDoc._id,
      data: txDoc,
      message: "Submission logged successfully and queued for Owner approval." 
    }, { status: 201 });

  } catch (error) {
    console.error("Employee Submission Route Error:", error);
    return NextResponse.json({ error: error.message || "Failed to log submission" }, { status: 500 });
  }
}