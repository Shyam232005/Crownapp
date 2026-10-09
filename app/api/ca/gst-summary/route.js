import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import CA from "@/models/CA";
import Owner from "@/models/Owner";
import Transaction from "@/models/Transaction";
import Report from "@/models/Report"; // Used to check if actual returns have been uploaded

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
    const role = (decoded.normalizedRole || decoded.role || "").toUpperCase();
    if (role !== "CA" && role !== "CA-EMPLOYEE" && role !== "CA_STAFF") {
      return NextResponse.json({ success: false, error: "Forbidden: CA Firm access only" }, { status: 403 });
    }

    await connectDB();
    
    // 1. Fetch CA Firm and mapped clients
    const caFirmId = decoded.caFirmId || decoded.companyId || decoded.userId;
    const caFirm = await CA.findById(caFirmId).populate({
      path: 'clientCompanies',
      model: Owner,
      select: 'companyName'
    }).populate({
      path: 'clients',
      model: Owner,
      select: 'companyName'
    });

    const clients = (caFirm?.clientCompanies && caFirm.clientCompanies.length > 0)
      ? caFirm.clientCompanies
      : (caFirm?.clients || []);

    if (!caFirm || clients.length === 0) {
      return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }

    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);

    const currentPeriodString = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    // 2. Resolve stats for each client concurrently
    const gstSummaryPromises = clients.map(async (client) => {
      
      // Calculate total Sales for the current month to estimate turnover
      const salesAggregation = await Transaction.aggregate([
        { 
          $match: { 
            companyId: client._id, 
            type: 'SALES', 
            transactionDate: { $gte: currentMonthStart },
            status: { $in: ['APPROVED', 'EXPORTED'] }
          } 
        },
        { $group: { _id: null, totalTurnover: { $sum: "$totalAmount" } } }
      ]);

      const turnoverAmount = salesAggregation[0]?.totalTurnover || 0;

      // Check if GSTR reports have been generated/uploaded for this month
      const gstr1Report = await Report.findOne({ 
        companyId: client._id, 
        reportType: 'GSTR-1', 
        period: currentPeriodString 
      });
      
      const gstr3bReport = await Report.findOne({ 
        companyId: client._id, 
        reportType: 'GSTR-3B', 
        period: currentPeriodString 
      });

      return {
        name: client.companyName,
        turnover: turnoverAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        gstr1: gstr1Report ? "Filed" : "Pending",
        gstr3b: gstr3bReport ? "Filed" : "Pending"
      };
    });

    const summaryData = await Promise.all(gstSummaryPromises);

    return NextResponse.json({ success: true, data: summaryData }, { status: 200 });

  } catch (error) {
    console.error("GET GST Summary Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}