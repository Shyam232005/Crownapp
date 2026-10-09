import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import CA from "@/models/CA";
import Owner from "@/models/Owner";
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
    if (!decoded || !decoded.userId) return NextResponse.json({ success: false, error: "Invalid session" }, { status: 401 });

    const isOwner = decoded.role === "Owner" || decoded.role === "OWNER" || decoded.normalizedRole === "OWNER";
    if (!isOwner) return NextResponse.json({ success: false, error: "Forbidden: Owner access only" }, { status: 403 });

    await connectDB();
    const body = await request.json().catch(() => ({}));
    const inviteCode = (body.inviteCode || body.caInviteCode || "").trim().toUpperCase();

    if (!inviteCode) {
      return NextResponse.json({ success: false, error: "CA Invite Code is required." }, { status: 400 });
    }

    // 1. Verify CA exists by caInviteCode or inviteCode
    const caFirm = await CA.findOne({
      $or: [
        { caInviteCode: inviteCode },
        { inviteCode: inviteCode },
        { staffInviteCode: inviteCode }
      ]
    });

    if (!caFirm) {
      return NextResponse.json({ success: false, error: "Invalid CA Invite Code. CA Firm not found." }, { status: 404 });
    }

    const ownerCompanyId = decoded.companyId || decoded.userId;

    // 2. Update Owner record
    const updatedOwner = await Owner.findByIdAndUpdate(
      ownerCompanyId,
      {
        $set: {
          linkedCA: caFirm._id,
          dataSharingStatus: "CONNECTED"
        },
        $addToSet: {
          linkedCaFirm: caFirm._id,
          linkedCAs: caFirm._id
        }
      },
      { new: true }
    );

    // 3. Push Owner into CA's clientCompanies and clients arrays
    await CA.findByIdAndUpdate(caFirm._id, {
      $addToSet: {
        clientCompanies: updatedOwner._id,
        clients: updatedOwner._id
      }
    });

    // 4. Update or create CompanyLink record
    await CompanyLink.findOneAndUpdate(
      { companyId: updatedOwner._id, caFirmId: caFirm._id },
      { $set: { status: "CONNECTED", lastDataSyncAt: new Date() } },
      { upsert: true, new: true }
    );

    const firmDisplayName = caFirm.firmName || caFirm.name || "CA Firm";

    return NextResponse.json({
      success: true,
      data: {
        firmName: firmDisplayName,
        caInviteCode: caFirm.caInviteCode,
        dataSharingStatus: "CONNECTED",
        linkedCA: caFirm._id
      },
      message: `Successfully linked with ${firmDisplayName}!`
    }, { status: 200 });

  } catch (error) {
    console.error("Owner CA-Link Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to link CA Firm" }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await connectDB();

    const ownerCompanyId = decoded.companyId || decoded.userId;
    const owner = await Owner.findById(ownerCompanyId).populate({
      path: "linkedCA",
      select: "firmName name caInviteCode email phoneNumber"
    });

    if (!owner) {
      return NextResponse.json({ success: false, error: "Owner not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        linkedCA: owner.linkedCA,
        dataSharingStatus: owner.dataSharingStatus || "NONE",
        lastDataSyncAt: owner.lastDataSyncAt || null
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Owner GET CA-Link Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to get linked CA status" }, { status: 500 });
  }
}
