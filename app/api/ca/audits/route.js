// app/api/ca/audits/route.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import Report from "@/models/Report";

export async function GET(request) {
  try {
    await connectDB();
    
    // Securely identify the requester
    const token = request.cookies.get("fineops_auth_token")?.value;
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    
    let query = {};
    if (payload.role === "owner") {
      query.clientId = payload.userId; // Owner only sees their own reports
    } else {
      query.caId = payload.userId; // CA sees all reports they generated
    }

    const reports = await Report.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: reports }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch reports" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const token = request.cookies.get("fineops_auth_token")?.value;
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    if (payload.role !== "ca" && payload.role !== "ca-staff") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    
    const newReport = await Report.create({
      clientId: body.clientId,
      caId: payload.userId,
      clientName: body.clientName,
      period: body.period,
      reportType: body.reportType,
      status: body.status || "Clean (Verified)",
      fileData: body.fileData, // Store Base64 for the PDF/Image
      staffName: body.staffName || "System CA",
      issuesCount: body.issuesCount || 0
    });

    return NextResponse.json({ success: true, data: newReport }, { status: 201 });
  } catch (error) {
    console.error("Report Upload Error:", error);
    return NextResponse.json({ success: false, error: "Failed to upload report" }, { status: 500 });
  }
}