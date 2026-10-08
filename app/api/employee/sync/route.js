import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import Transaction from "@/models/Transaction";
import Attendance from "@/models/Attendance";
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
    if (decoded.role !== "Employee") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await connectDB();
    const { queue } = await request.json();

    if (!queue || !Array.isArray(queue)) {
      return NextResponse.json({ error: "Invalid queue data format" }, { status: 400 });
    }

    // Process the queue array in a single database session to ensure atomicity
    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    let processedCount = 0;

    try {
      for (const item of queue) {
        
        // Handle Offline Submissions (Expenses/Sales)
        if (item.module === "SUBMISSION") {
            const { type, amount, partyName, paymentMode, description, billNumber, gstin } = item.payload;
            
            let mappedType = "EXPENSE";
            let debitAccount = "Expense A/C";
            let creditAccount = "Cash/Bank A/C";

            if (type === "Sales Invoice") {
                mappedType = "SALES";
                debitAccount = "Accounts Receivable";
                creditAccount = "Sales A/C";
            }

            const txArray = await Transaction.create([{
                companyId: decoded.companyId,
                createdBy: decoded.userId,
                type: mappedType,
                status: "PENDING_OWNER_APPROVAL",
                totalAmount: amount,
                metadata: { vendorName: partyName, customerName: partyName, paymentMode, description, invoiceNumber: billNumber, gstin }
            }], { session: dbSession });

            await LedgerEntry.insertMany([
                { transactionId: txArray[0]._id, companyId: decoded.companyId, accountName: debitAccount, type: 'DEBIT', amount },
                { transactionId: txArray[0]._id, companyId: decoded.companyId, accountName: creditAccount, type: 'CREDIT', amount }
            ], { session: dbSession });
        }

        // Handle Offline Attendance Punches
        if (item.module === "ATTENDANCE") {
            const { actionType } = item.payload;
            const today = new Date();
            today.setHours(0,0,0,0);

            if (actionType === "Punch In") {
                await Attendance.create([{
                    employeeId: decoded.userId,
                    companyId: decoded.companyId,
                    status: "punched-in",
                    punchInTime: item.timestamp || new Date()
                }], { session: dbSession });
            } else {
                await Attendance.findOneAndUpdate(
                    { employeeId: decoded.userId, createdAt: { $gte: today } },
                    { $set: { status: "completed", punchOutTime: item.timestamp || new Date() } },
                    { session: dbSession }
                );
            }
        }
        
        processedCount++;
      }

      await dbSession.commitTransaction();
      dbSession.endSession();

      return NextResponse.json({ success: true, processed: processedCount }, { status: 200 });
      
    } catch (dbError) {
      await dbSession.abortTransaction();
      dbSession.endSession();
      throw dbError;
    }
  } catch (error) {
    console.error("Bulk Sync Error:", error);
    return NextResponse.json({ error: "Failed to sync offline queue" }, { status: 500 });
  }
}