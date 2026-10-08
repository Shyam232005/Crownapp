import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import CA from "@/models/CA";
import Transaction from "@/models/Transaction";
import Owner from "@/models/Owner"; // Ensures the ref works properly

export const dynamic = "force-dynamic";

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
    // Note: Staff can also view this if you expand roles later
    if (decoded.role !== "CA" && decoded.role !== "CA-Employee") {
      return NextResponse.json({ error: "Forbidden: CA Firm access only" }, { status: 403 });
    }

    await connectDB();
    
    // Fetch the CA Firm's data to get their connected clients array
    const caFirmId = decoded.companyId || decoded.userId;
    const caFirm = await CA.findById(caFirmId);
    
    if (!caFirm || !caFirm.clients || caFirm.clients.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
            stats: { activeClients: 0, pendingAudits: 0, readyForSync: 0 },
            clientAlerts: []
        }
      }, { status: 200 });
    }

    const clientIds = caFirm.clients;

    // Calculate Dashboard Metrics
    const activeClients = clientIds.length;
    
    const pendingAudits = await Transaction.countDocuments({
      companyId: { $in: clientIds },
      status: "PENDING_CA_REVIEW"
    });

    // Find distinct clients who have at least one APPROVED transaction waiting to be exported
    const clientsReadyForSync = await Transaction.distinct("companyId", {
      companyId: { $in: clientIds },
      status: "APPROVED"
    });
    
    const readyForSync = clientsReadyForSync.length;

    // Fetch the latest 10 transactions across all clients to populate the Activity Feed
    const recentActivity = await Transaction.find({
      companyId: { $in: clientIds },
      status: { $in: ["PENDING_CA_REVIEW", "APPROVED"] }
    })
    .populate("companyId", "companyName")
    .sort({ updatedAt: -1 })
    .limit(10);

    const clientAlerts = recentActivity.map(tx => ({
      id: tx._id,
      client: tx.companyId?.companyName || "Unknown Client",
      type: `${tx.type} Logged`,
      status: tx.status,
      time: new Date(tx.updatedAt).toLocaleTimeString('en-IN')
    }));

    return NextResponse.json({
      success: true,
      data: {
          stats: { activeClients, pendingAudits, readyForSync },
          clientAlerts
      }
    }, { status: 200 });

  } catch (error) {
    console.error("GET CA Dashboard Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}