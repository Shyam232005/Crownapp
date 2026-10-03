// app/api/ca/bank-reco/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import BankReco from "@/models/BankReco";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get("clientId") || "owner-temp-123";

    const recoItems = await BankReco.find({ clientId }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: recoItems }, { status: 200 });
  } catch (error) {
    console.error("GET Bank Reco Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch bank reconciliation" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const newItem = await BankReco.create({
      clientId: body.clientId || "owner-temp-123",
      desc: body.desc,
      date: body.date,
      bankAmt: Number(body.bankAmt),
      match: body.match || false,
      bookAmt: body.bookAmt !== undefined ? Number(body.bookAmt) : null
    });

    return NextResponse.json({ success: true, data: newItem }, { status: 201 });
  } catch (error) {
    console.error("POST Bank Reco Error:", error);
    return NextResponse.json({ success: false, error: "Failed to create reconciliation item" }, { status: 500 });
  }
}