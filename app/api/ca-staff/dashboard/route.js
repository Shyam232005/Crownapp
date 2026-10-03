// app/api/ca-staff/dashboard/route.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import Owner from "@/models/Owner";
import Submission from "@/models/Submission";

export async function GET(request) {
  try {
    await connectDB();
    
    const token = request.cookies.get("fineops_auth_token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Find assigned clients
    const clients = await Owner.find({ 
      $or: [
        { assignedStaffId: payload.userId },
        { linkedCaFirm: payload.firmId || payload.userId }
      ]
    });

    // Find pending submissions/vouchers for the priority review queue
    const pendingSubmissions = await Submission.find({ status: "Pending" }).sort({ createdAt: -1 });

    const reviewQueue = pendingSubmissions.map(item => ({
      id: item._id,
      client: item.partyName || "Client Business",
      type: item.type,
      date: new Date(item.createdAt).toLocaleDateString("en-IN"),
      amount: item.amount || 0,
      status: !item.gstin ? "Missing GSTIN" : "Pending Verification"
    }));

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          assignedClients: clients.length,
          pendingVouchers: pendingSubmissions.length,
          openQueries: 0
        },
        reviewQueue
      }
    }, { status: 200 });

  } catch (error) {
    console.error("CA Staff Dashboard API Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch staff dashboard data" }, { status: 500 });
  }
}