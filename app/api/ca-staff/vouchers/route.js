// app/api/ca-staff/vouchers/route.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import Submission from "@/models/Submission";

export async function GET(request) {
  try {
    await connectDB();
    const token = request.cookies.get("fineops_auth_token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all submissions or filter as needed
    const submissions = await Submission.find({}).sort({ createdAt: -1 });

    const formattedVouchers = submissions.map(sub => ({
      id: sub._id,
      desc: sub.description || sub.partyName || "General Entry",
      type: sub.type,
      date: sub.billDate || new Date(sub.createdAt).toLocaleDateString("en-IN"),
      client: sub.partyName || "Client Business",
      amount: sub.amount || 0,
      status: sub.status === "Approved" ? "Verified" : sub.status === "Query" ? "Query Raised" : "Pending"
    }));

    return NextResponse.json({ success: true, data: formattedVouchers }, { status: 200 });
  } catch (error) {
    console.error("GET Vouchers Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch vouchers" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, status } = body; // status can be "Approved" (Verified) or "Query" (Query Raised)

    const updated = await Submission.findByIdAndUpdate(
      id,
      { status: status === "Verified" ? "Approved" : status === "Query Raised" ? "Query" : "Pending" },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    console.error("PATCH Voucher Status Error:", error);
    return NextResponse.json({ success: false, error: "Failed to update voucher status" }, { status: 500 });
  }
}