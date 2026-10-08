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

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "CA" && decoded.role !== "CA-Employee") {
      return NextResponse.json({ error: "Forbidden: CA Firm access only" }, { status: 403 });
    }

    await connectDB();
    
    // 1. Fetch the CA Firm and ensure we populate the SME Owner data
    const caFirmId = decoded.companyId || decoded.userId;
    const caFirm = await CA.findById(caFirmId).populate({
      path: 'clients',
      model: Owner,
      select: 'name companyName email phoneNumber'
    });
    
    if (!caFirm) {
      return NextResponse.json({ error: "CA Firm not found" }, { status: 404 });
    }

    // 2. Resolve pending transaction counts per client concurrently
    const populatedClients = caFirm.clients || [];
    
    const clientDataPromises = populatedClients.map(async (client) => {
      const [pendingCount, readyCount] = await Promise.all([
        Transaction.countDocuments({ companyId: client._id, status: "PENDING_CA_REVIEW" }),
        Transaction.countDocuments({ companyId: client._id, status: "APPROVED" })
      ]);

      return {
        id: client._id,
        companyName: client.companyName,
        ownerName: client.name,
        email: client.email,
        phone: client.phoneNumber,
        pendingAudits: pendingCount,
        readyForSync: readyCount
      };
    });

    const clientsArray = await Promise.all(clientDataPromises);

    // 3. Return the array alongside the Firm's unique invite code
    return NextResponse.json({
      success: true,
      data: {
        inviteCode: caFirm.inviteCode || "PENDING",
        clients: clientsArray
      }
    }, { status: 200 });

  } catch (error) {
    console.error("GET CA Clients Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}