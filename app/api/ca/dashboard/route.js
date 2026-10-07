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
      return NextResponse.json({ error: "Forbidden: CA access only" }, { status: 403 });
    }

    await connectDB();
    
    // 1. Get the CA Firm's linked clients
    const caFirmId = decoded.companyId || decoded.userId;
    const caFirm = await CA.findById(caFirmId).populate('clients', 'companyName name');
    
    if (!caFirm || !caFirm.clients) {
      return NextResponse.json({ 
        stats: { activeClients: 0, pendingAudits: 0, readyForSync: 0 }, 
        alerts: [] 
      }, { status: 200 });
    }

    const clientIds = caFirm.clients.map(client => client._id);

    // 2. Aggregate Pending Scrutiny and Sync Ready stats across ALL clients
    const pendingAudits = await Transaction.countDocuments({
      companyId: { $in: clientIds },
      status: "PENDING_CA_REVIEW"
    });

    // Clients with at least one APPROVED transaction ready for sync
    const syncReadyClients = await Transaction.distinct("companyId", {
      companyId: { $in: clientIds },
      status: "APPROVED"
    });

    // 3. Fetch Recent Activity across all clients for the Alerts feed
    const recentTransactions = await Transaction.find({
      companyId: { $in: clientIds }
    })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('companyId', 'companyName');

    // 4. Map transactions to the format the UI expects
    const alerts = recentTransactions.map(tx => ({
      id: tx._id,
      client: tx.companyId?.companyName || "Unknown Client",
      type: tx.type === 'PURCHASE' ? 'Purchase Logged' : tx.type === 'SALES' ? 'Sales Invoice' : 'Expense Logged',
      status: tx.status,
      time: new Date(tx.createdAt).toLocaleDateString('en-IN')
    }));

    return NextResponse.json({
      stats: {
        activeClients: caFirm.clients.length,
        pendingAudits,
        readyForSync: syncReadyClients.length
      },
      alerts
    }, { status: 200 });

  } catch (error) {
    console.error("GET CA Dashboard Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}