import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import Transaction from "@/models/Transaction";
import LedgerEntry from "@/models/LedgerEntry";
import AuditLog from "@/models/AuditLog";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

export const dynamic = "force-dynamic";

export async function PATCH(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Security check: Only the Owner can approve entries out of this specific queue
    if (decoded.role !== "Owner") {
      return NextResponse.json({ error: "Forbidden: Only Owners can approve transactions." }, { status: 403 });
    }

    const companyId = decoded.companyId || decoded.userId;
    if (!companyId) {
      return NextResponse.json({ error: "Company not linked" }, { status: 403 });
    }

    await connectDB();
    
    const body = await request.json();
    const { transactionId, action } = body;

    if (!transactionId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const objectId = new mongoose.Types.ObjectId(transactionId);
    const targetCompanyId = new mongoose.Types.ObjectId(companyId);
    
    // Determine new status based on Owner's action
    let newStatus = "";
    if (action === "APPROVE") {
      newStatus = "APPROVED";
    } else if (action === "REJECT") {
      newStatus = "REJECTED"; // Flags and disables the transaction
    } else {
      return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
    }

    // Update the transaction
    const updatedTx = await Transaction.findOneAndUpdate(
      { _id: objectId, companyId: targetCompanyId },
      { $set: { status: newStatus } },
      { new: true }
    );

    if (!updatedTx) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Strict Double-Entry Engine: Trigger balanced Debit/Credit ledger entries upon Approval
    if (action === "APPROVE") {
      await LedgerEntry.deleteMany({ transactionId: updatedTx._id });

      const ledgerEntries = [];
      const amount = updatedTx.totalAmount;
      const meta = updatedTx.metadata || {};

      if (updatedTx.type === "SALES") {
        const customerName = meta.customerName || meta.vendorName || "Customer";
        ledgerEntries.push(
          { transactionId: updatedTx._id, companyId: targetCompanyId, accountName: `${customerName} (Debtor) A/C`, type: "DEBIT", amount },
          { transactionId: updatedTx._id, companyId: targetCompanyId, accountName: "Sales Revenue A/C", type: "CREDIT", amount }
        );
      } else if (updatedTx.type === "PURCHASE") {
        const vendorName = meta.vendorName || meta.payeeName || "Vendor";
        ledgerEntries.push(
          { transactionId: updatedTx._id, companyId: targetCompanyId, accountName: "Purchases / Inventory A/C", type: "DEBIT", amount },
          { transactionId: updatedTx._id, companyId: targetCompanyId, accountName: `${vendorName} (Creditor) A/C`, type: "CREDIT", amount }
        );
      } else if (updatedTx.type === "EXPENSE") {
        const expCategory = meta.category || "Operating";
        const paymentMode = meta.paymentMode || "Cash/Bank";
        ledgerEntries.push(
          { transactionId: updatedTx._id, companyId: targetCompanyId, accountName: `${expCategory} Expense A/C`, type: "DEBIT", amount },
          { transactionId: updatedTx._id, companyId: targetCompanyId, accountName: `${paymentMode} A/C`, type: "CREDIT", amount }
        );
      } else if (updatedTx.type === "COLLECTION") {
        const customerName = meta.customerName || "Customer";
        const paymentMode = meta.paymentMode || "Bank/Cash";
        ledgerEntries.push(
          { transactionId: updatedTx._id, companyId: targetCompanyId, accountName: `${paymentMode} A/C`, type: "DEBIT", amount },
          { transactionId: updatedTx._id, companyId: targetCompanyId, accountName: `${customerName} (Debtor) A/C`, type: "CREDIT", amount }
        );
      }

      if (ledgerEntries.length > 0) {
        await LedgerEntry.insertMany(ledgerEntries);
      }
    } else if (action === "REJECT") {
      // Clean up any ledger entries if rejected
      await LedgerEntry.deleteMany({ transactionId: updatedTx._id });
    }

    // Log the action for compliance audit trail
    await AuditLog.create({
      entityId: updatedTx._id,
      entityName: 'Transaction',
      action: `OWNER_${action}`,
      performedBy: decoded.userId,
      changes: { statusChangedTo: newStatus }
    });

    return NextResponse.json({ success: true, status: newStatus }, { status: 200 });

  } catch (error) {
    console.error("Transaction Action Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}