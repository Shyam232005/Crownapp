// app/api/owner/link-ca/route.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import Owner from "@/models/Owner";
import CA from "@/models/CA";

export async function POST(request) {
  try {
    await connectDB();
    
    const token = request.cookies.get("fineops_auth_token")?.value;
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    const { inviteCode } = await request.json();

    // 1. Find the CA using the invite code
    const caFirm = await CA.findOne({ inviteCode });
    if (!caFirm) {
      return NextResponse.json({ success: false, error: "Invalid CA Invite Code" }, { status: 404 });
    }

    // 2. Link the CA to the Owner's profile
    await Owner.findByIdAndUpdate(payload.userId, {
      $set: { linkedCaFirm: caFirm._id }
    });

    return NextResponse.json({ 
      success: true, 
      firmName: caFirm.businessName || "Your CA Firm" 
    }, { status: 200 });

  } catch (error) {
    console.error("Link CA Error:", error);
    return NextResponse.json({ success: false, error: "Failed to link CA Firm" }, { status: 500 });
  }
}