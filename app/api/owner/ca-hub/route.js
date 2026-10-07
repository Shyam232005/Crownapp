import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import CA from "@/models/CA";
import Owner from "@/models/Owner"; // Assuming you have an Owner model
import Transaction from "@/models/Transaction";
import AuditLog from "@/models/AuditLog";

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
    if (decoded.role !== "Owner") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    
    // 1. Check if the Owner is linked to a CA firm
    // We check the CA collection to see if any firm has this companyId in their clients array
    const caFirm = await CA.findOne({ clients: decoded.companyId });
    
    // 2. Count how many items are APPROVED but not yet unlocked/exported
    const pendingExportCount = await Transaction.countDocuments({
      companyId: decoded.companyId,
      status: "APPROVED" 
    });

    // 3. Fetch past unlocks from the Audit Log
    const unlockHistoryLogs = await AuditLog.find({
      entityId: decoded.companyId,
      action: 'VAULT_UNLOCKED'
    }).sort({ createdAt: -1 }).limit(5);

    const history = unlockHistoryLogs.map(log => ({
      month: new Date(log.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' }),
      sentAt: new Date(log.createdAt).toLocaleTimeString('en-IN')
    }));

    return NextResponse.json({
      linkedFirm: caFirm ? caFirm.companyName : null,
      pendingExportCount,
      history
    }, { status: 200 });

  } catch (error) {
    console.error("GET CA-Hub Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}