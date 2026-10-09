import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import Owner from "@/models/Owner";
import AuditLog from "@/models/AuditLog";
import CompanyLink from "@/models/CompanyLink";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const isOwner = decoded.role === "Owner" || decoded.role === "OWNER" || decoded.normalizedRole === "OWNER";
    if (!isOwner) return NextResponse.json({ success: false, error: "Forbidden: Owner access only" }, { status: 403 });

    await connectDB();
    const ownerCompanyId = decoded.companyId || decoded.userId;

    const owner = await Owner.findById(ownerCompanyId);
    if (!owner) return NextResponse.json({ success: false, error: "Owner not found" }, { status: 404 });

    const now = new Date();
    owner.lastDataSyncAt = now;
    owner.vaultStatus = "Unlocked";
    if (owner.dataSharingStatus === "NONE" && owner.linkedCA) {
      owner.dataSharingStatus = "CONNECTED";
    }
    await owner.save();

    // Update CompanyLink if linked
    if (owner.linkedCA) {
      await CompanyLink.findOneAndUpdate(
        { companyId: owner._id, caFirmId: owner.linkedCA },
        { $set: { lastDataSyncAt: now, status: "CONNECTED" } },
        { upsert: true }
      );
    }

    // Activity ledger audit log record
    await AuditLog.create({
      entityId: ownerCompanyId.toString(),
      entityName: "OwnerDataSync",
      action: "DATA_SYNC_DISPATCHED",
      performedBy: decoded.userId.toString(),
      changes: {
        syncedAt: now,
        dataSharingStatus: owner.dataSharingStatus,
        linkedCA: owner.linkedCA
      }
    });

    return NextResponse.json({
      success: true,
      message: "Data securely synchronized with CA Firm.",
      data: {
        lastDataSyncAt: now,
        dataSharingStatus: owner.dataSharingStatus
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Owner CA-Link Sync Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to sync data with CA" }, { status: 500 });
  }
}
