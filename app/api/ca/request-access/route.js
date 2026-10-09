import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import connectDB from "@/lib/mongodb";
import CA from "@/models/CA";
import Owner from "@/models/Owner";
import CompanyLink from "@/models/CompanyLink";
import AuditLog from "@/models/AuditLog";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * CA Request Access Endpoint
 * Allows a CA firm to request audit access to an SME Owner's company by invite code.
 * The request MUST set CompanyLink.status = 'PENDING'.
 */
export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const isCA = decoded.role === "CA" || decoded.role === "CA-Employee" || decoded.role === "CA_STAFF" || decoded.role === "CAStaff";
    if (!isCA) {
      return NextResponse.json({ success: false, error: "Forbidden: CA portal access only." }, { status: 403 });
    }

    await connectDB();
    const body = await request.json().catch(() => ({}));
    const inviteCode = (body.inviteCode || body.ownerInviteCode || body.code || "").trim().toUpperCase();
    const companyId = body.companyId || body.clientId;

    if (!inviteCode && !companyId) {
      return NextResponse.json(
        { success: false, error: "Company invite code or company ID is required." },
        { status: 400 }
      );
    }

    // 1. Find Owner
    let owner = null;
    if (inviteCode) {
      owner = await Owner.findOne({
        $or: [
          { inviteCode: inviteCode },
          { _id: mongoose.isValidObjectId(inviteCode) ? inviteCode : null }
        ]
      });
    } else if (companyId) {
      owner = await Owner.findById(companyId);
    }

    if (!owner) {
      return NextResponse.json(
        { success: false, error: "Invalid invite code. SME Company not found." },
        { status: 404 }
      );
    }

    // 2. Identify CA Firm ID
    const caFirmId = decoded.caFirmId || decoded.userId;
    const caFirm = await CA.findById(caFirmId);
    if (!caFirm) {
      return NextResponse.json({ success: false, error: "CA Firm profile not found." }, { status: 404 });
    }

    // 3. Upsert CompanyLink with strict PENDING status
    const existingLink = await CompanyLink.findOne({
      companyId: owner._id,
      caFirmId: caFirm._id
    });

    if (existingLink && existingLink.status === "CONNECTED") {
      return NextResponse.json(
        {
          success: true,
          status: "CONNECTED",
          message: "You are already connected to this company."
        },
        { status: 200 }
      );
    }

    const companyLink = await CompanyLink.findOneAndUpdate(
      { companyId: owner._id, caFirmId: caFirm._id },
      {
        $set: {
          status: "PENDING",
          updatedAt: new Date()
        }
      },
      { upsert: true, new: true }
    );

    // Update Owner data sharing status to PENDING
    await Owner.findByIdAndUpdate(owner._id, {
      $set: { dataSharingStatus: "PENDING" }
    });

    // 4. Record Audit Log safely
    try {
      await AuditLog.create({
        entityId: owner._id.toString(),
        entityName: "CompanyLink",
        action: "ACCESS_REQUESTED",
        performedBy: caFirm.firmName || caFirm.name || "CA Firm",
        changes: {
          caFirmId: caFirm._id.toString(),
          caFirmName: caFirm.firmName || caFirm.name,
          requestedAt: new Date()
        }
      });
    } catch (auditErr) {
      console.warn("AuditLog warning:", auditErr.message);
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          linkId: companyLink._id,
          companyId: owner._id,
          companyName: owner.companyName || owner.name,
          status: "PENDING"
        },
        message: "Access request sent successfully. Pending Owner approval."
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("CA Request Access Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process access request." },
      { status: 500 }
    );
  }
}
