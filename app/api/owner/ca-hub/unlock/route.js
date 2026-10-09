import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import Owner from "@/models/Owner";
import AuditLog from "@/models/AuditLog";

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
    if (decoded.role !== "Owner") {
      return NextResponse.json({ error: "Forbidden: Only SME Owners can unlock the Data Vault." }, { status: 403 });
    }

    await connectDB();

    let month = new Date().toLocaleString("default", { month: "long", year: "numeric" });
    try {
      const body = await request.json();
      if (body?.month) month = body.month;
    } catch (_) {}

    const now = new Date();
    // 1. Update Owner vaultStatus to Unlocked & record lastDataSyncAt
    await Owner.findByIdAndUpdate(decoded.companyId, {
      $set: { 
        vaultStatus: "Unlocked",
        lastDataSyncAt: now,
        dataSharingStatus: "CONNECTED"
      }
    });

    // 2. Write immutable AuditLog for the unlock action
    await AuditLog.create({
      entityId: decoded.companyId,
      entityName: "DataVault",
      action: "VAULT_UNLOCKED",
      performedBy: decoded.userId,
      changes: { status: "Unlocked", month, unlockedAt: now }
    });

    return NextResponse.json({ 
      success: true, 
      message: `Zero-Trust Data Vault unlocked for ${month}. CA access granted.`,
      month,
      lastDataSyncAt: now
    }, { status: 200 });

  } catch (error) {
    console.error("Vault Unlock Error:", error);
    return NextResponse.json({ error: "Failed to unlock data vault." }, { status: 500 });
  }
}
