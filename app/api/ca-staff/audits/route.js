// app/api/ca-staff/audits/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
// IMPORTANT: Adjust the import below based on what you named the Compliance models file
import { AuditReport } from "@/models/Compliance";

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId");

    const query = clientId ? { clientId } : {};
    
    // Fetch audit reports, newest first
    const audits = await AuditReport.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: audits }, { status: 200 });
  } catch (error) {
    console.error("GET Audits Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch audit reports" }, 
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const newAudit = await AuditReport.create({
      clientId: body.clientId || "client-temp-123",
      caStaffId: body.caStaffId || "staff-temp-123",
      period: body.period,
      issuesFound: Number(body.issuesFound) || 0,
      status: body.status || "In Progress",
      reportNotes: body.reportNotes || ""
    });

    return NextResponse.json(
      { success: true, message: "Audit report created", data: newAudit }, 
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Audit Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create audit report" }, 
      { status: 400 }
    );
  }
}