// app/api/vault-status/route.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import Owner from "@/models/Owner";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request) {
  try {
    await connectDB();
    const token = request.cookies.get("crown_session")?.value || request.cookies.get("fineops_auth_token")?.value;
    
    const clientId = request.nextUrl.searchParams.get("clientId");
    let owner = null;
    if (clientId) {
      owner = await Owner.findById(clientId);
    } else {
      owner = await Owner.findOne({});
    }
    
    return NextResponse.json({ success: true, status: owner?.vaultStatus || "Locked" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, status: "Locked" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    await connectDB();
    const { status } = await request.json(); // "Requested", "Unlocked", or "Locked"
    
    // Update the firm's vault status
    await Owner.findOneAndUpdate({}, { $set: { vaultStatus: status } }, { upsert: true });

    return NextResponse.json({ success: true, status }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update vault" }, { status: 500 });
  }
}