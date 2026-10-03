// app/api/owner/stats/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Submission from "@/models/Submission";

export async function GET(request) {
  try {
    await connectDB();

    // 1. Count pending approvals
    const pendingApprovals = await Submission.countDocuments({ status: "Pending" });

    // 2. Fetch approved transactions to calculate totals
    const approvedEntries = await Submission.find({ status: "Approved" });

    let totalIncome = 0;
    let totalExpense = 0;

    approvedEntries.forEach((item) => {
      const isIncome = item.type === "Customer Received" || item.type === "Sales Invoice";
      const isExpense = item.type === "Vendor Payment" || item.type === "General Expense";

      if (isIncome) totalIncome += item.amount;
      if (isExpense) totalExpense += item.amount;
    });

    return NextResponse.json({
      success: true,
      data: {
        pendingApprovals,
        totalIncome,
        totalExpense
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Owner Stats API Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}