import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import Transaction from "@/models/Transaction";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const companyId = decoded.companyId || decoded.userId;
    if (!companyId) return NextResponse.json({ error: "Company not linked" }, { status: 403 });

    await connectDB();
    const objectId = new mongoose.Types.ObjectId(companyId);

    // Extract the transaction type (e.g., PURCHASE or SALES) from the URL query
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    const query = { companyId: objectId };
    if (type) query.type = type;

    // Fetch all matching transactions, sorted by newest
    const transactions = await Transaction.find(query).sort({ transactionDate: -1, createdAt: -1 });

    return NextResponse.json({ success: true, data: transactions }, { status: 200 });
  } catch (error) {
    console.error("GET Owner Transactions Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch transactions" }, { status: 500 });
  }
}