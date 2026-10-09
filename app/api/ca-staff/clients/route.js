import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import CA from "@/models/CA";
import CAStaff from "@/models/CAStaff";
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
    const isCA = decoded.role === "CA" || decoded.normalizedRole === "CA";
    const isStaff = decoded.role === "CAStaff" || decoded.role === "CA-Employee" || decoded.role === "CA_STAFF" || decoded.normalizedRole === "CA_STAFF";

    if (!isCA && !isStaff) {
      return NextResponse.json({ success: false, error: "Forbidden: CA staff access only" }, { status: 403 });
    }

    await connectDB();

    let clientDocs = [];

    if (isStaff) {
      const staffMember = await CAStaff.findById(decoded.userId);
      if (!staffMember) {
        return NextResponse.json({ success: false, error: "Staff member not found" }, { status: 404 });
      }

      const assignedIds = staffMember.assignedCompanies?.length 
        ? staffMember.assignedCompanies 
        : (staffMember.assignedClients || []);

      if (!assignedIds || assignedIds.length === 0) {
        return NextResponse.json({ success: true, data: [] }, { status: 200 });
      }

      clientDocs = await Owner.find({ _id: { $in: assignedIds } }).select("companyName gstin name location email phoneNumber lastDataSyncAt");
    } else {
      const caFirmId = decoded.caFirmId || decoded.companyId || decoded.userId;
      const caFirm = await CA.findById(caFirmId);
      const allClientIds = caFirm ? [...(caFirm.clientCompanies || []), ...(caFirm.clients || [])] : [];
      if (allClientIds.length === 0) {
        return NextResponse.json({ success: true, data: [] }, { status: 200 });
      }
      clientDocs = await Owner.find({ _id: { $in: allClientIds } }).select("companyName gstin name location email phoneNumber lastDataSyncAt");
    }

    // 3. For each client, calculate pending scrutiny vouchers count
    const clientPromises = clientDocs.map(async (client) => {
      const pendingVouchersCount = await Transaction.countDocuments({
        companyId: client._id,
        status: "PENDING_CA_REVIEW"
      });

      return {
        id: client._id.toString(),
        _id: client._id.toString(),
        name: client.companyName,
        companyName: client.companyName,
        gstin: client.gstin || "Not Provided",
        auditStatus: pendingVouchersCount > 0 ? "In Progress" : "Clean (Verified)",
        pendingVouchers: pendingVouchersCount,
        lastDataSyncAt: client.lastDataSyncAt || null
      };
    });

    const assignedClients = await Promise.all(clientPromises);

    return NextResponse.json({ success: true, data: assignedClients }, { status: 200 });

  } catch (error) {
    console.error("GET CA Staff Clients Error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}