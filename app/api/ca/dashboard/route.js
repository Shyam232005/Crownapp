// app/api/ca/dashboard/route.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import Owner from "@/models/Owner";
import Report from "@/models/Report";

export async function GET(request) {
  try {
    await connectDB();
    
    const token = request.cookies.get("fineops_auth_token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const caId = payload.userId;

    // 1. Fetch all owners linked to this CA firm
    const clients = await Owner.find({ linkedCaFirm: caId });
    const activeClients = clients.length;

    // 2. Fetch reports/audits for these clients
    const clientIds = clients.map(c => c._id);
    const reports = await Report.find({ clientId: { $in: clientIds } });
    
    const pendingAudits = reports.filter(r => r.status === "Pending Scrutiny" || r.status === "Issues Found").length;
    const readyForSync = clients.filter(c => c.vaultStatus === "Unlocked").length;

    // 3. Generate recent client alerts from owner activity/vault status
    const clientAlerts = clients.slice(0, 5).map(c => ({
      id: c._id,
      client: c.companyName,
      type: "GST / Ledger Review",
      status: c.vaultStatus === "Unlocked" ? "Data Unlocked" : "Locked",
      time: new Date(c.updatedAt).toLocaleDateString("en-IN")
    }));

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          activeClients,
          pendingAudits,
          readyForSync
        },
        clientAlerts
      }
    }, { status: 200 });

  } catch (error) {
    console.error("CA Dashboard API Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch CA dashboard data" }, { status: 500 });
  }
}