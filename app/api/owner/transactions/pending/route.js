import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import Transaction from '@/models/Transaction';

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

export const dynamic = "force-dynamic";

// Owner GET: View Pending Approvals for their company
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    await connectDB();

    // Query strictly for vouchers belonging to this company pending owner approval
    const ownerCompanyId = decoded.companyId || decoded.userId;
    const targetId = new mongoose.Types.ObjectId(ownerCompanyId);

    const data = await Transaction.find({
      companyId: targetId,
      status: 'PENDING_OWNER_APPROVAL'
    }).sort({ createdAt: -1 });

    return NextResponse.json(data, {
      status: 200,
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
    });

  } catch (error) {
    console.error('Owner GET Pending Transactions Error:', error);
    return NextResponse.json({ error: 'Failed to fetch pending approvals' }, { status: 500 });
  }
}
