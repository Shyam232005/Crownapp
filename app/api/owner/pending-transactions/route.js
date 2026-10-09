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
    // 1. Authenticate Session & Extract Company ID
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const companyId = decoded.companyId || decoded.userId;

    if (!companyId) {
      return NextResponse.json({ error: "Company profile not linked" }, { status: 403 });
    }

    await connectDB();
    const objectId = new mongoose.Types.ObjectId(companyId);

    // 2. Map old status queries to the new strict schema
    const { searchParams } = new URL(request.url);
    const rawStatus = searchParams.get("status");
    
    // Default to PENDING_CA_REVIEW if no status is passed, or match rawStatus
    let queryStatus = "PENDING_CA_REVIEW"; 
    if (rawStatus === "Approved") queryStatus = "APPROVED";
    else if (rawStatus === "Exported") queryStatus = "EXPORTED";
    else if (rawStatus === "PENDING_OWNER_APPROVAL" || rawStatus === "PENDING" || rawStatus === "Pending") queryStatus = "PENDING_OWNER_APPROVAL";

    // 3. Fetch Transactions securely isolated to THIS specific company
    const transactions = await Transaction.find({
      companyId: objectId,
      status: queryStatus
    })
    .sort({ transactionDate: -1 })
    .limit(15); // Limit to 15 to keep the dashboard snappy

    return NextResponse.json({ success: true, data: transactions }, { 
      status: 200,
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
    });
  } catch (error) {
    console.error("GET Pending Transactions Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch transactions" },
      { status: 500 }
    );
  }
}