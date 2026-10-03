// app/api/ca/gst-summary/route.js
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

    // Find all owners linked to this CA firm
    const owners = await Owner.find({ linkedCaFirm: payload.userId });

    const clientsGST = await Promise.all(owners.map(async (owner) => {
      // Calculate turnover from approved Sales Invoices
      const submissions = await Submission.find({ 
        status: "Approved",
        type: "Sales Invoice"
      });
      
      const totalTurnover = submissions.reduce((acc, curr) => acc + (curr.amount || 0), 0);
      
      return {
        name: owner.companyName || owner.name,
        turnover: `₹${totalTurnover.toLocaleString("en-IN")}`,
        gstr1: totalTurnover > 0 ? "Filed" : "Pending",
        gstr3b: totalTurnover > 0 ? "Filed" : "Pending"
      };
    }));

    return NextResponse.json({ success: true, data: clientsGST }, { status: 200 });
  } catch (error) {
    console.error("CA GST Summary API Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch GST summary" }, { status: 500 });
  }
}