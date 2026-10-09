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

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const isOwner = decoded.role === "Owner" || decoded.role === "OWNER" || decoded.normalizedRole === "OWNER";
    if (!isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const ownerId = decoded.companyId || decoded.userId;
    const owner = await Owner.findById(ownerId);
    
    // 1. Check if the Owner is linked to a CA firm
    let caFirm = null;
    if (owner?.linkedCA) {
      caFirm = await CA.findById(owner.linkedCA);
    }
    if (!caFirm) {
      caFirm = await CA.findOne({
        $or: [
          { clientCompanies: ownerId },
          { clients: ownerId }
        ]
      });
    }
    
    // 2. Count how many items are APPROVED but not yet unlocked/exported
    const pendingExportCount = await Transaction.countDocuments({
      companyId: ownerId,
      status: "APPROVED" 
    });

    // 3. Fetch past unlocks from the Audit Log
    const unlockHistoryLogs = await AuditLog.find({
      entityId: ownerId.toString(),
      action: { $in: ['VAULT_UNLOCKED', 'DATA_SYNC_DISPATCHED'] }
    }).sort({ createdAt: -1 }).limit(10);

    const history = unlockHistoryLogs.map(log => ({
      month: log.changes?.month || new Date(log.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' }),
      sentAt: new Date(log.createdAt).toLocaleTimeString('en-IN')
    }));

    const firmName = caFirm ? (caFirm.firmName || caFirm.name || caFirm.companyName) : null;

    return NextResponse.json({
      success: true,
      linkedFirm: firmName,
      caInviteCode: caFirm?.caInviteCode || null,
      dataSharingStatus: owner?.dataSharingStatus || "NONE",
      lastDataSyncAt: owner?.lastDataSyncAt || null,
      pendingExportCount,
      history
    }, { status: 200 });

  } catch (error) {
    console.error("GET CA-Hub Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}