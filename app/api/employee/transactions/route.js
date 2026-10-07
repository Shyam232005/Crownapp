import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import Transaction from '@/models/Transaction';

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
    
    if (decoded.role !== "Employee") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const query = { 
      companyId: decoded.companyId,
      createdBy: decoded.userId // Strict filtering: Only their own submissions
    };
    
    if (type) query.type = type;

    const transactions = await Transaction.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: transactions }, { status: 200 });
  } catch (error) {
    console.error('Employee GET Transactions Error:', error);
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}