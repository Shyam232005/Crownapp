import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import Transaction from "@/models/Transaction";
import AuditLog from "@/models/AuditLog";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

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

    await connectDB();
    
    const body = await request.json();
    const { transactionId, action } = body;

    if (!transactionId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const objectId = new mongoose.Types.ObjectId(transactionId);
    
    // Determine the new status based on the Owner's action
    let newStatus = "";
    if (action === "APPROVE") {
      newStatus = "PENDING_CA_REVIEW"; // Pushes to the CA dashboard
    } else if (action === "REJECT") {
      newStatus = "REJECTED"; // Kills the transaction
    } else {
      return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
    }

    // Update the transaction
    const updatedTx = await Transaction.findOneAndUpdate(
      { _id: objectId, companyId: decoded.companyId }, // Ensure they only approve their own company's tx
      { $set: { status: newStatus } },
      { new: true }
    );

    if (!updatedTx) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Log the action for compliance
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