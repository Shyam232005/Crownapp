// app/api/ca/filing-calendar/route.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import Owner from "@/models/Owner";

export async function GET(request) {
  try {
    await connectDB();
    
    const token = request.cookies.get("fineops_auth_token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Count active clients linked to this CA firm
    const clientCount = await Owner.countDocuments({ linkedCaFirm: payload.userId });

    // Standard compliance deadlines for October 2026
    const deadlines = clientCount > 0 ? [
      {
        date: "11 Oct",
        title: "GSTR-1 Filing (Outward Supplies)",
        type: "GST Compliance",
        desc: "Monthly return for taxable outward supplies",
        clients: clientCount,
        status: "Urgent"
      },
      {
        date: "20 Oct",
        title: "GSTR-3B Filing (Summary Return)",
        type: "GST Compliance",
        desc: "Monthly summary return and tax payment",
        clients: clientCount,
        status: "Pending"
      },
      {
        date: "30 Oct",
        title: "TDS / TCS Return Payment",
        type: "Income Tax",
        desc: "Quarterly tax deducted at source deposition",
        clients: clientCount,
        status: "Pending"
      }
    ] : [];

    return NextResponse.json({ success: true, data: deadlines }, { status: 200 });
  } catch (error) {
    console.error("Filing Calendar API Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch deadlines" }, { status: 500 });
  }
}