import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import Transaction from "@/models/Transaction";

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
    const companyId = decoded.companyId;

    if (!companyId) {
      return NextResponse.json({ error: "Company profile not linked" }, { status: 403 });
    }

    await connectDB();
    const objectId = new mongoose.Types.ObjectId(companyId);

    // 2. Count pending CA reviews specifically for this company
    const pendingApprovals = await Transaction.countDocuments({ 
      companyId: objectId,
      status: "PENDING_CA_REVIEW" 
    });

    // 3. Instantly Aggregate Totals at the Database Layer
    const aggregation = await Transaction.aggregate([
      { 
        $match: { 
          companyId: objectId,
          // Assuming you want to calculate actual financial turnover regardless of CA audit status. 
          // If you only want approved stats, uncomment the line below:
          // status: { $in: ["APPROVED", "EXPORTED"] }
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

    // 4. Map the MongoDB grouping to your UI properties
    aggregation.forEach((group) => {
      if (group._id === "SALES") totalIncome += group.total;
      if (group._id === "PURCHASE" || group._id === "EXPENSE") totalExpense += group.total;
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