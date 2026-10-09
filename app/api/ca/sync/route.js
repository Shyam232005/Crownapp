import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import connectDB from "@/lib/mongodb";
import CompanyLink from "@/models/CompanyLink";
import Owner from "@/models/Owner";
import JournalEntry from "@/models/JournalEntry";
import Ledger from "@/models/Ledger";
import Transaction from "@/models/Transaction";
import AuditLog from "@/models/AuditLog";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * CA Sync Route
 * Syncs double-entry accounting and approved transactions for a client company.
 * Zero-Leak Gate: Strictly enforces if (link.status !== 'CONNECTED') throw new Error('Unauthorized');
 */
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const isCA =
      decoded.role === "CA" ||
      decoded.role === "CA-Employee" ||
      decoded.role === "CA_STAFF" ||
      decoded.role === "CAStaff";

    if (!isCA && !decoded.isSuperAdmin && decoded.role !== "Admin") {
      return NextResponse.json({ success: false, error: "Forbidden: CA portal access only." }, { status: 403 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId") || searchParams.get("companyId");

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: clientId" },
        { status: 400 }
      );
    }

    const clientObjectId = new mongoose.Types.ObjectId(clientId);
    const caFirmId = decoded.caFirmId || decoded.userId;

    // --- ZERO-LEAK GATE ---
    const link = await CompanyLink.findOne({
      companyId: clientObjectId,
      caFirmId: new mongoose.Types.ObjectId(caFirmId)
    });

    if (!link || link.status !== "CONNECTED") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Company access has not been approved by Owner. Status is " + (link?.status || "NONE")
        },
        { status: 403 }
      );
    }

    // Double check Owner profile
    const ownerDoc = await Owner.findById(clientObjectId).select(
      "companyName name email gstin location dataSharingStatus vaultStatus"
    );

    if (!ownerDoc) {
      return NextResponse.json({ success: false, error: "Client company not found" }, { status: 404 });
    }

    // Fetch double-entry journal entries
    const journalEntries = await JournalEntry.find({
      companyId: clientObjectId,
      status: "POSTED"
    })
      .sort({ date: -1 })
      .lean();

    // Fetch approved transactions ready for audit
    const approvedTransactions = await Transaction.find({
      companyId: clientObjectId,
      status: { $in: ["APPROVED", "EXPORTED"] }
    })
      .sort({ transactionDate: -1 })
      .lean();

    // Update last sync timestamp
    link.lastDataSyncAt = new Date();
    await link.save();

    await Owner.findByIdAndUpdate(clientObjectId, {
      lastDataSyncAt: new Date()
    });

    return NextResponse.json({
      success: true,
      data: {
        company: {
          id: ownerDoc._id,
          name: ownerDoc.companyName || ownerDoc.name,
          gstin: ownerDoc.gstin,
          location: ownerDoc.location
        },
        lastDataSyncAt: link.lastDataSyncAt,
        journalEntries,
        transactions: approvedTransactions,
        summary: {
          totalJournalEntries: journalEntries.length,
          totalTransactions: approvedTransactions.length
        }
      }
    });
  } catch (error) {
    console.error("GET CA Sync Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to synchronize client data." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const isCA =
      decoded.role === "CA" ||
      decoded.role === "CA-Employee" ||
      decoded.role === "CA_STAFF" ||
      decoded.role === "CAStaff";

    if (!isCA && !decoded.isSuperAdmin) {
      return NextResponse.json({ success: false, error: "Forbidden: CA portal access only." }, { status: 403 });
    }

    await connectDB();
    const body = await request.json();
    const clientId = body.clientId || body.companyId;

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: "Missing required parameter: clientId" },
        { status: 400 }
      );
    }

    const clientObjectId = new mongoose.Types.ObjectId(clientId);
    const caFirmId = decoded.caFirmId || decoded.userId;

    // --- ZERO-LEAK GATE ---
    const link = await CompanyLink.findOne({
      companyId: clientObjectId,
      caFirmId: new mongoose.Types.ObjectId(caFirmId)
    });

    if (!link || link.status !== "CONNECTED") {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized: Company access has not been approved by Owner."
        },
        { status: 403 }
      );
    }

    link.lastDataSyncAt = new Date();
    await link.save();

    await AuditLog.create({
      entityId: clientId.toString(),
      entityName: "CompanyLink",
      action: "DATA_SYNC_DISPATCHED",
      performedBy: decoded.role,
      changes: { syncedAt: new Date() }
    });

    return NextResponse.json({
      success: true,
      message: "Data sync dispatched and updated successfully."
    });
  } catch (error) {
    console.error("POST CA Sync Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Sync operation failed." },
      { status: 500 }
    );
  }
}
