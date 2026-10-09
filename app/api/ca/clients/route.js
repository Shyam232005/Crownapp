import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import CA from "@/models/CA";
import Owner from "@/models/Owner";
import Transaction from "@/models/Transaction";

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
    
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const isCA = decoded.role === "CA";
    const isStaff = decoded.role === "CA-Employee" || decoded.role === "CA_STAFF" || decoded.role === "CAStaff";
    
    if (!isCA && !isStaff) {
      return NextResponse.json({ success: false, error: "Forbidden: CA Firm access only" }, { status: 403 });
    }

    await connectDB();
    
    // Determine the CA firm ID
    let caFirmId = decoded.caFirmId || decoded.companyId || decoded.userId;
    if (isStaff) {
      const staffMember = await mongoose.model("CAStaff").findById(decoded.userId);
      if (staffMember?.caFirmId) {
        caFirmId = staffMember.caFirmId;
      }
    }

    const caFirm = await CA.findById(caFirmId);
    if (!caFirm) {
      return NextResponse.json({ success: false, error: "CA Firm not found" }, { status: 404 });
    }

    // Query all Owner records where linkedCA === caFirm._id && dataSharingStatus === 'CONNECTED'
    // Or in caFirm.clientCompanies / caFirm.clients
    const linkedOwners = await Owner.find({
      $or: [
        { linkedCA: caFirm._id, dataSharingStatus: "CONNECTED" },
        { _id: { $in: [...(caFirm.clientCompanies || []), ...(caFirm.clients || [])] } }
      ]
    }).select("name companyName gstin location Category email phoneNumber lastDataSyncAt dataSharingStatus updatedAt");

    const clientDataPromises = linkedOwners.map(async (client) => {
      const [pendingCount, readyCount, totalTransactions] = await Promise.all([
        Transaction.countDocuments({ companyId: client._id, status: "PENDING_CA_REVIEW" }),
        Transaction.countDocuments({ companyId: client._id, status: "APPROVED" }),
        Transaction.countDocuments({ companyId: client._id })
      ]);

      return {
        id: client._id.toString(),
        _id: client._id.toString(),
        companyName: client.companyName,
        ownerName: client.name,
        gstin: client.gstin || "N/A",
        location: client.location || "",
        category: client.Category || "General",
        email: client.email,
        phone: client.phoneNumber,
        lastSyncTime: client.lastDataSyncAt || client.updatedAt,
        lastDataSyncAt: client.lastDataSyncAt || client.updatedAt,
        dataSharingStatus: client.dataSharingStatus || "CONNECTED",
        pendingVouchers: pendingCount,
        pendingAudits: pendingCount,
        readyForSync: readyCount,
        totalTransactions
      };
    });

    const clientsArray = await Promise.all(clientDataPromises);

    return NextResponse.json({
      success: true,
      data: {
        caInviteCode: caFirm.caInviteCode || caFirm.inviteCode || "PENDING",
        staffInviteCode: caFirm.staffInviteCode || "PENDING",
        inviteCode: caFirm.caInviteCode || caFirm.inviteCode || "PENDING",
        clients: clientsArray
      }
    }, { status: 200 });

  } catch (error) {
    console.error("GET CA Clients Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}