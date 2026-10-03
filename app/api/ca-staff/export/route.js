// app/api/ca-staff/export/route.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import Submission from "@/models/Submission";

export async function POST(request) {
  try {
    await connectDB();
    
    const token = request.cookies.get("fineops_auth_token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { clientId, period, format } = body;

    // Fetch approved submissions for the selected client and period
    const submissions = await Submission.find({ status: "Approved" });

    if (format === "csv" || format === "xlsx") {
      const headers = ["Date", "Type", "Party Name", "GSTIN", "Amount", "Description"];
      const csvData = [
        headers.join(","),
        ...submissions.map(s => `"${new Date(s.createdAt).toLocaleDateString()}","${s.type}","${s.partyName || ''}","${s.gstin || ''}","${s.amount}","${s.description || ''}"`)
      ].join("\n");

      return NextResponse.json({ 
        success: true, 
        fileData: csvData, 
        filename: `FineOps_Export_${clientId}_${period.replace(" ", "_")}.${format === 'xlsx' ? 'csv' : 'csv'}` 
      }, { status: 200 });
    } else {
      // Tally XML Format
      let xmlData = `<ENVELOPE><BODY><DATA>\n`;
      submissions.forEach(s => {
        xmlData += `  <VOUCHER>\n    <DATE>${s.createdAt}</DATE>\n    <PARTY>${s.partyName || ''}</PARTY>\n    <AMOUNT>${s.amount}</AMOUNT>\n    <TYPE>${s.type}</TYPE>\n  </VOUCHER>\n`;
      });
      xmlData += `</DATA></BODY></ENVELOPE>`;

      return NextResponse.json({ 
        success: true, 
        fileData: xmlData, 
        filename: `FineOps_Tally_${clientId}_${period.replace(" ", "_")}.xml` 
      }, { status: 200 });
    }
  } catch (error) {
    console.error("Export API Error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate export file" }, { status: 500 });
  }
}