import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import connectDB from "@/lib/mongodb";
import Owner from "@/models/Owner";
import CA from "@/models/CA";
import CompanyLink from "@/models/CompanyLink";
import AuditLog from "@/models/AuditLog";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * Owner CA Approvals API
 * Allows SME Business Owner to review, approve, or reject CA access requests.
 */
export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const isOwner =
      decoded.role === "Owner" ||
      decoded.role === "OWNER" ||
      decoded.normalizedRole === "OWNER";

    if (!isOwner) {
      return NextResponse.json({ success: false, error: "Forbidden: Owner access only." }, { status: 403 });
    }

    await connectDB();
    const ownerId = decoded.companyId || decoded.userId;

    // Fetch pending links
    const pendingLinks = await CompanyLink.find({
      companyId: new mongoose.Types.ObjectId(ownerId),
      status: "PENDING"
    })
      .populate({
        path: "caFirmId",
        select: "name firmName email phoneNumber caInviteCode"
      })
      .sort({ updatedAt: -1 })
      .lean();

    const formattedRequests = pendingLinks.map((link) => ({
      linkId: link._id,
      status: link.status,
      caFirmId: link.caFirmId?._id,
      caName: link.caFirmId?.name || "CA Practitioner",
      firmName: link.caFirmId?.firmName || link.caFirmId?.name || "Chartered Accountant Firm",
      email: link.caFirmId?.email || "",
      phoneNumber: link.caFirmId?.phoneNumber || "",
      requestedAt: link.updatedAt || link.createdAt
    }));

    return NextResponse.json({
      success: true,
      data: formattedRequests
    });
  } catch (error) {
    console.error("GET Owner CA Approvals Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch CA access requests." },
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
    const isOwner =
      decoded.role === "Owner" ||
      decoded.role === "OWNER" ||
      decoded.normalizedRole === "OWNER";

    if (!isOwner) {
      return NextResponse.json({ success: false, error: "Forbidden: Owner access only." }, { status: 403 });
    }

    await connectDB();
    const ownerId = decoded.companyId || decoded.userId;
    const body = await request.json();
    const { linkId, caFirmId, action } = body; // action: "APPROVE" | "REJECT"

    if (!action || !["APPROVE", "REJECT"].includes(action.toUpperCase())) {
      return NextResponse.json(
        { success: false, error: "Valid action ('APPROVE' or 'REJECT') is required." },
        { status: 400 }
      );
    }

    let linkQuery = { companyId: new mongoose.Types.ObjectId(ownerId) };
    if (linkId) {
      linkQuery._id = new mongoose.Types.ObjectId(linkId);
    } else if (caFirmId) {
      linkQuery.caFirmId = new mongoose.Types.ObjectId(caFirmId);
    } else {
      return NextResponse.json(
        { success: false, error: "Either linkId or caFirmId is required." },
        { status: 400 }
      );
    }

    const companyLink = await CompanyLink.findOne(linkQuery);
    if (!companyLink) {
      return NextResponse.json(
        { success: false, error: "Access request link not found." },
        { status: 404 }
      );
    }

    const targetCaId = companyLink.caFirmId;

    if (action.toUpperCase() === "APPROVE") {
      // 1. Mark Link as CONNECTED
      companyLink.status = "CONNECTED";
      companyLink.lastDataSyncAt = new Date();
      await companyLink.save();

      // 2. Update Owner record
      await Owner.findByIdAndUpdate(ownerId, {
        $set: {
          linkedCA: targetCaId,
          dataSharingStatus: "CONNECTED",
          vaultStatus: "Unlocked",
          lastDataSyncAt: new Date()
        },
        $addToSet: {
          linkedCAs: targetCaId,
          linkedCaFirm: targetCaId
        }
      });

      // 3. Update CA Firm's client array
      await CA.findByIdAndUpdate(targetCaId, {
        $addToSet: {
          clientCompanies: new mongoose.Types.ObjectId(ownerId),
          clients: new mongoose.Types.ObjectId(ownerId)
        }
      });

      // 4. Record Audit Log
      try {
        await AuditLog.create({
          entityId: ownerId.toString(),
          entityName: "CompanyLink",
          action: "VAULT_UNLOCKED",
          performedBy: "OWNER",
          changes: {
            caFirmId: targetCaId.toString(),
            status: "CONNECTED",
            approvedAt: new Date()
          }
        });
      } catch (e) {}

      return NextResponse.json({
        success: true,
        status: "CONNECTED",
        message: "CA access approved! Your verified ledger and data vault are now securely connected."
      });
    } else {
      // REJECT
      companyLink.status = "REVOKED";
      await companyLink.save();

      await Owner.findByIdAndUpdate(ownerId, {
        $set: {
          dataSharingStatus: "NONE",
          vaultStatus: "Locked"
        }
      });

      try {
        await AuditLog.create({
          entityId: ownerId.toString(),
          entityName: "CompanyLink",
          action: "ACCESS_REVOKED",
          performedBy: "OWNER",
          changes: {
            caFirmId: targetCaId.toString(),
            status: "REVOKED",
            rejectedAt: new Date()
          }
        });
      } catch (e) {}

      return NextResponse.json({
        success: true,
        status: "REVOKED",
        message: "CA access request was rejected."
      });
    }
  } catch (error) {
    console.error("POST Owner CA Approvals Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update CA approval." },
      { status: 500 }
    );
  }
}
