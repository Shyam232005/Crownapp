import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import Transaction from "@/models/Transaction";

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
    const { type, partyName, amount, paymentMode, description, billNumber, billDate, gstin } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
    }

    // Map UI types to GAAP system constants
    let mappedType = "EXPENSE";
    if (type === "Sales Invoice") {
      mappedType = "SALES";
    } else if (type === "Customer Received") {
      mappedType = "COLLECTION";
    } else if (type === "Vendor Payment") {
      mappedType = "PURCHASE";
    }

    // 1. Create the Transaction Record with PENDING_OWNER_APPROVAL status
    // Double-entry ledger entries will be generated when Owner approves this voucher
    const txDoc = await Transaction.create({
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
    });

    return NextResponse.json({ 
      success: true, 
      transactionId: txDoc._id,
      message: "Submission logged successfully and queued for Owner approval." 
    }, { status: 201 });

  } catch (error) {
    console.error("Employee Submission Error:", error);
    return NextResponse.json({ error: "Failed to process entry" }, { status: 500 });
  }
}