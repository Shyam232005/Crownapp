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

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ensure only CA or CA-Staff can access this
    const allowedRoles = ["CA", "CAStaff", "CA-Employee"];
    if (!allowedRoles.includes(decoded.role)) {
      return NextResponse.json({ error: "Forbidden: CA staff access only" }, { status: 403 });
    }

    await connectDB();

    // 1. Determine the parent CA Firm ID based on the user's role
    let caFirmId = decoded.companyId || decoded.userId;

    if (decoded.role === "CAStaff" || decoded.role === "CA-Employee") {
      const staffMember = await CAStaff.findById(decoded.userId);
      if (staffMember) {
        caFirmId = staffMember.caFirmId;
      }
    }

    // 2. Fetch the CA Firm to retrieve their connected clients array
    const caFirm = await CA.findById(caFirmId).populate({
      path: 'clients',
      model: Owner,
      select: 'companyName gstin'
    });

    if (!caFirm || !caFirm.clients || caFirm.clients.length === 0) {
      return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }

    // 3. For each client, check the count of pending scrutiny vouchers
    const clientPromises = caFirm.clients.map(async (client) => {
      const pendingVouchersCount = await Transaction.countDocuments({
        companyId: client._id,
        status: "PENDING_CA_REVIEW"
      });

      return {
        id: client._id,
        name: client.companyName,
        gstin: client.gstin || "Not Provided",
        auditStatus: pendingVouchersCount > 0 ? "In Progress" : "Clean (Verified)",
        pendingVouchers: pendingVouchersCount
      };
    });

    const assignedClients = await Promise.all(clientPromises);

    return NextResponse.json({ success: true, data: assignedClients }, { status: 200 });

  } catch (error) {
    console.error("GET CA Staff Clients Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}