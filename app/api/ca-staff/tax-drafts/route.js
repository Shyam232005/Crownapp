import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import TaxDraft from "@/models/TaxDraft";

export async function GET(request) {
  try {
    await connectDB();
    const token = request.cookies.get("fineops_auth_token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    const drafts = await TaxDraft.find({ staffId: payload.userId }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: drafts }, { status: 200 });
  } catch (error) {
    console.error("GET Tax Drafts Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch tax drafts" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const token = request.cookies.get("fineops_auth_token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    const body = await request.json();
    const outputTax = Number(body.outputTax) || 0;
    const itc = Number(body.itc) || 0;
    const liability = outputTax - itc;

    const newDraft = await TaxDraft.create({
      staffId: payload.userId,
      client: body.client,
      month: body.month || "September 2026",
      outputTax,
      itc,
      liability,
      status: "Draft"
    });

    return NextResponse.json({ success: true, data: newDraft }, { status: 201 });
  } catch (error) {
    console.error("POST Tax Draft Error:", error);
    return NextResponse.json({ success: false, error: "Failed to create tax draft" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { id, status } = body;

    const updated = await TaxDraft.findByIdAndUpdate(
      id, 
      { status: status || "Pending CA Approval" }, 
      { new: true }
    );

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    console.error("PATCH Tax Draft Error:", error);
    return NextResponse.json({ success: false, error: "Failed to update draft status" }, { status: 500 });
  }
}