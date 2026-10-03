// app/api/vault-status/route.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import Owner from "@/models/Owner";

export async function GET(request) {
  try {
    await connectDB();
    const token = request.cookies.get("fineops_auth_token")?.value;
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // If CA is requesting, they need to check the specific Owner's vault. 
    // For now, we fetch the first owner as the primary firm.
    const owner = await Owner.findOne({}); 
    
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