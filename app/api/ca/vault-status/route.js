import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import connectDB from "@/lib/mongodb";
import Owner from "@/models/Owner";
import AuditLog from "@/models/AuditLog";
import CompanyLink from "@/models/CompanyLink";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");
    if (!clientId) return NextResponse.json({ success: false, error: "Client ID required" }, { status: 400 });

    await connectDB();

    const clientObjectId = mongoose.isValidObjectId(clientId)
      ? new mongoose.Types.ObjectId(clientId)
      : null;

    if (!clientObjectId) {
      return NextResponse.json({ success: false, error: "Invalid client ID format" }, { status: 400 });
    }
    
    // Check Owner record first
    const ownerDoc = await Owner.findById(clientObjectId).select("vaultStatus dataSharingStatus");
    if (ownerDoc && (ownerDoc.vaultStatus === "Unlocked" || ownerDoc.dataSharingStatus === "CONNECTED")) {
      return NextResponse.json({ success: true, status: "Unlocked" }, { status: 200 });
    }

    // Check CompanyLink status
    const link = await CompanyLink.findOne({ companyId: clientObjectId });
    if (link && link.status === "CONNECTED") {
      return NextResponse.json({ success: true, status: "Unlocked" }, { status: 200 });
    } else if (link && link.status === "PENDING") {
      return NextResponse.json({ success: true, status: "Requested" }, { status: 200 });
    }

    // Check the latest AuditLog for this client
    const latestLog = await AuditLog.findOne({ entityId: clientId }).sort({ createdAt: -1 });
    
    if (latestLog && latestLog.action === "VAULT_UNLOCKED") {
      return NextResponse.json({ success: true, status: "Unlocked" }, { status: 200 });
    }
    
    if (latestLog && latestLog.action === "ACCESS_REQUESTED") {
      return NextResponse.json({ success: true, status: "Requested" }, { status: 200 });
    }

    return NextResponse.json({ success: true, status: ownerDoc?.vaultStatus || "Locked" }, { status: 200 });
  } catch (error) {
    console.error("GET Vault Status Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { clientId } = body;
    if (!clientId) {
      return NextResponse.json({ success: false, error: "Client ID required" }, { status: 400 });
    }

    await connectDB();
    
    // Log the request so the Owner's CA-Hub sees it
    await AuditLog.create({
      entityId: clientId,
      entityName: "DataVault",
      action: "ACCESS_REQUESTED",
      performedBy: "CA_FIRM",
      changes: { requestedAt: new Date() }
    });

    // Update CompanyLink to PENDING if exists
    if (mongoose.isValidObjectId(clientId)) {
      await CompanyLink.updateMany(
        { companyId: new mongoose.Types.ObjectId(clientId), status: { $ne: "CONNECTED" } },
        { $set: { status: "PENDING" } }
      );
    }

    return NextResponse.json({ success: true, status: "Requested" }, { status: 200 });
  } catch (error) {
    console.error("POST Vault Status Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}