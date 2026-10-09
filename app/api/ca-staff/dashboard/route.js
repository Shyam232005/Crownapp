import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import CA from "@/models/CA";
import CAStaff from "@/models/CAStaff";
import Transaction from "@/models/Transaction";
import Owner from "@/models/Owner";

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
    const isCA = decoded.role === "CA" || decoded.normalizedRole === "CA";
    const isStaff = decoded.role === "CAStaff" || decoded.role === "CA-Employee" || decoded.role === "CA_STAFF" || decoded.normalizedRole === "CA_STAFF";
    
    if (!isCA && !isStaff) {
      return NextResponse.json({ success: false, error: "Forbidden: CA staff access only" }, { status: 403 });
    }

    await connectDB();

    let assignedClientIds = [];

    if (isStaff) {
      const staffMember = await CAStaff.findById(decoded.userId);
      if (!staffMember) {
        return NextResponse.json({ success: false, error: "Staff profile not found" }, { status: 404 });
      }
      assignedClientIds = staffMember.assignedCompanies?.length ? staffMember.assignedCompanies : (staffMember.assignedClients || []);
    } else {
      // CA Admin viewing staff dashboard: show all connected client companies
      const caFirmId = decoded.caFirmId || decoded.companyId || decoded.userId;
      const caFirm = await CA.findById(caFirmId);
      assignedClientIds = caFirm ? [...(caFirm.clientCompanies || []), ...(caFirm.clients || [])] : [];
    }

    if (!assignedClientIds || assignedClientIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          stats: { assignedClients: 0, pendingVouchers: 0, openQueries: 0 },
          reviewQueue: []
        }
      }, { status: 200 });
    }

    // 1. Calculate Summary Metrics
    const [pendingVouchers, openQueries] = await Promise.all([
      Transaction.countDocuments({
        companyId: { $in: assignedClientIds },
        status: "PENDING_CA_REVIEW"
      }),
      Transaction.countDocuments({
        companyId: { $in: assignedClientIds },
        status: "QUERY_RAISED"
      })
    ]);

    const assignedClients = assignedClientIds.length;

    // 2. Fetch Priority Review Queue (Most recent pending or queried vouchers)
    const priorityTransactions = await Transaction.find({
      companyId: { $in: assignedClientIds },
      status: { $in: ["PENDING_CA_REVIEW", "QUERY_RAISED"] }
    })
      .populate("companyId", "companyName")
      .sort({ updatedAt: -1 })
      .limit(8);

    const reviewQueue = priorityTransactions.map((tx) => {
      const metadata = tx.metadata || {};
      
      // Compute intelligent tag for the staff member
      let displayStatus = "Needs Scrutiny";
      if (tx.status === "QUERY_RAISED") {
        displayStatus = "Query Raised";
      } else if (!metadata.gstin || metadata.gstin.trim() === "") {
        displayStatus = "Missing GSTIN";
      }

      return {
        id: tx._id,
        clientId: tx.companyId?._id || "",
        client: tx.companyId?.companyName || "Unknown Client",
        type: tx.type || "EXPENSE",
        date: tx.transactionDate ? new Date(tx.transactionDate).toLocaleDateString("en-IN") : new Date(tx.createdAt).toLocaleDateString("en-IN"),
        amount: tx.totalAmount || 0,
        status: displayStatus
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          assignedClients,
          pendingVouchers,
          openQueries
        },
        reviewQueue
      }
    }, { status: 200 });

  } catch (error) {
    console.error("GET CA Staff Dashboard Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}