import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import CA from "@/models/CA";

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
    
    // Fetch the CA to get their active client count
    const caFirmId = decoded.caFirmId || decoded.companyId || decoded.userId;
    const caFirm = await CA.findById(caFirmId);
    
    const clientList = caFirm?.clientCompanies || caFirm?.clients || [];
    const clientCount = clientList.length;

    // If no clients, return an empty array to trigger the empty state UI
    if (clientCount === 0) {
      return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }

    const currentMonth = new Date().toLocaleString('default', { month: 'short' });
    const currentDay = new Date().getDate();

    // Standard Indian Compliance Calendar
    const standardDeadlines = [
      {
        date: `07 ${currentMonth}`,
        title: "TDS / TCS Deposit",
        type: "Tax Payment",
        desc: "Deposit of Tax Deducted/Collected at Source.",
        clients: clientCount,
        status: currentDay > 7 ? "Overdue" : (currentDay >= 5 ? "Urgent" : "Upcoming")
      },
      {
        date: `11 ${currentMonth}`,
        title: "GSTR-1",
        type: "GST",
        desc: "Details of outward supplies of goods and services.",
        clients: clientCount,
        status: currentDay > 11 ? "Overdue" : (currentDay >= 9 ? "Urgent" : "Upcoming")
      },
      {
        date: `20 ${currentMonth}`,
        title: "GSTR-3B",
        type: "GST",
        desc: "Summary return of outward supplies and input tax credit.",
        clients: clientCount,
        status: currentDay > 20 ? "Overdue" : (currentDay >= 17 ? "Urgent" : "Upcoming")
      }
    ];

    return NextResponse.json({
      success: true,
      data: standardDeadlines
    }, { status: 200 });

  } catch (error) {
    console.error("GET Filing Calendar Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}