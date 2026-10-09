import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import Transaction from "@/models/Transaction";
import Leave from "@/models/Leave";
import Stock from "@/models/Stock";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

export async function GET(request) {
  try {
    // 1. Authenticate Session & Extract Company ID
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const companyId = decoded.companyId || decoded.userId;

    if (!companyId) {
      return NextResponse.json({ error: "Company profile not linked" }, { status: 403 });
    }

    await connectDB();
    const objectId = new mongoose.Types.ObjectId(companyId);

    // 2. Count pending owner approvals (Transactions + Leaves)
    const [pendingVouchers, pendingLeaves] = await Promise.all([
      Transaction.countDocuments({ 
        companyId: objectId,
        status: { $in: ["PENDING_OWNER_APPROVAL", "PENDING"] }
      }),
      Leave.countDocuments({
        companyId: objectId,
        status: "PENDING"
      })
    ]);

    const pendingApprovals = (pendingVouchers || 0) + (pendingLeaves || 0);

    // 3. Instantly Aggregate Totals at the Database Layer
    const aggregation = await Transaction.aggregate([
      { 
        $match: { 
          companyId: objectId,
        } 
      },
      { 
        $group: {
          _id: "$type",
          total: { $sum: "$totalAmount" }
        }
      }
    ]);

    let totalIncome = 0;
    let totalExpense = 0;

    // 4. Map the MongoDB grouping to UI properties
    aggregation.forEach((group) => {
      if (group._id === "SALES") totalIncome += group.total;
      if (group._id === "PURCHASE" || group._id === "EXPENSE") totalExpense += group.total;
    });

    // 5. Query Today's Inward Stock Live from Stock.js
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayInwardStock = await Stock.find({
      companyId: objectId,
      date: { $gte: startOfDay, $lte: endOfDay }
    })
      .sort({ date: -1, createdAt: -1 })
      .lean();

    const inwardCount = todayInwardStock.length;
    const inwardTotalQty = todayInwardStock.reduce((acc, item) => acc + (item.quantity || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        pendingApprovals,
        totalIncome,
        totalExpense,
        todayInward: {
          count: inwardCount,
          totalQuantity: inwardTotalQty,
          items: todayInwardStock
        }
      }
    }, {
      status: 200,
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
    });

  } catch (error) {
    console.error("GET Owner Stats Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to aggregate statistics" },
      { status: 500 }
    );
  }
}