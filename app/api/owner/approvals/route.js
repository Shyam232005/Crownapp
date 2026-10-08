import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import Transaction from '@/models/Transaction';
import Leave from '@/models/Leave';
import LedgerEntry from '@/models/LedgerEntry';

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
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    if (decoded.role !== "Owner") {
      return NextResponse.json({ error: "Forbidden: Owner access only" }, { status: 403 });
    }

    await connectDB();

    const companyId = decoded.companyId || decoded.userId;
    const targetId = new mongoose.Types.ObjectId(companyId);

    // 1. Fetch pending vouchers
    const transactions = await Transaction.find({
      companyId: targetId,
      status: { $in: ['PENDING_OWNER_APPROVAL', 'PENDING'] }
    }).sort({ createdAt: -1 });

    // 2. Fetch pending leaves actively
    const leaves = await Leave.find({
      companyId: targetId,
      status: { $in: ['PENDING', 'Pending'] }
    }).sort({ createdAt: -1 });

    // 3. Format leaves into unified queue structure
    const formattedLeaves = leaves.map(l => ({
      _id: l._id.toString(),
      itemType: 'LEAVE',
      type: 'LEAVE',
      leaveType: l.leaveType,
      totalAmount: 0,
      amount: 0,
      transactionDate: l.createdAt,
      createdAt: l.createdAt,
      status: 'PENDING_OWNER_APPROVAL',
      metadata: {
        vendorName: `${l.employeeName || 'Staff Member'} - ${l.leaveType}`,
        customerName: l.employeeName || 'Staff',
        description: `${l.fromDate} to ${l.toDate}: ${l.reason}`,
        leaveDetails: {
          fromDate: l.fromDate,
          toDate: l.toDate,
          reason: l.reason,
          leaveType: l.leaveType
        }
      }
    }));

    // 4. Merge into unified queue
    const unifiedQueue = [...transactions, ...formattedLeaves];

    return NextResponse.json({ 
      success: true, 
      data: unifiedQueue,
      transactions,
      leaves: formattedLeaves 
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Owner GET Approvals Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch approvals' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "Owner") {
      return NextResponse.json({ error: "Forbidden: Owner access only" }, { status: 403 });
    }

    await connectDB();
    const body = await request.json();
    const { transactionId, id, action } = body;
    const targetId = transactionId || id;

    if (!targetId || !action) {
      return NextResponse.json({ error: "Target ID and action are required." }, { status: 400 });
    }

    const companyId = new mongoose.Types.ObjectId(decoded.companyId || decoded.userId);

    // 1. Check if target is a Leave request
    const leaveDoc = await Leave.findOne({ _id: targetId, companyId });
    if (leaveDoc) {
      leaveDoc.status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
      await leaveDoc.save();
      return NextResponse.json({ 
        success: true, 
        message: `Leave request ${leaveDoc.status.toLowerCase()} successfully.`,
        data: leaveDoc 
      }, { status: 200 });
    }

    // 2. Otherwise update Transaction
    const newStatus = action === 'APPROVE' ? 'PENDING_CA_REVIEW' : 'REJECTED';
    const updatedTx = await Transaction.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(targetId), companyId },
      { $set: { status: newStatus } },
      { new: true }
    );

    if (!updatedTx) {
      return NextResponse.json({ error: "Approval item not found." }, { status: 404 });
    }

    if (action === 'APPROVE' && updatedTx.type === 'EXPENSE') {
      const amount = updatedTx.totalAmount || updatedTx.amount || 0;
      await LedgerEntry.insertMany([
        { transactionId: updatedTx._id, companyId, accountName: "Operational Expense A/C", type: "DEBIT", amount },
        { transactionId: updatedTx._id, companyId, accountName: "Cash / Bank A/C", type: "CREDIT", amount }
      ]).catch(e => console.error("Ledger creation error:", e));
    }

    return NextResponse.json({ 
      success: true, 
      message: `Transaction ${action === 'APPROVE' ? 'approved' : 'rejected'}.`,
      data: updatedTx 
    }, { status: 200 });

  } catch (error) {
    console.error('Owner PATCH Approvals Error:', error);
    return NextResponse.json({ error: error.message || 'Action failed' }, { status: 500 });
  }
}
