// app/api/owner/settings/route.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import Owner from "@/models/Owner";

export async function GET(request) {
  try {
    await connectDB();
    
    const token = request.cookies.get("fineops_auth_token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    const owner = await Owner.findById(payload.userId).select("-password");
    if (!owner) return NextResponse.json({ success: false, error: "Owner not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: owner }, { status: 200 });
  } catch (error) {
    console.error("Fetch Settings Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    await connectDB();
    
    const token = request.cookies.get("fineops_auth_token")?.value;
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    const body = await request.json();
    
    // Map the frontend form names to the database schema fields
    const updatedOwner = await Owner.findByIdAndUpdate(
      payload.userId,
      {
        $set: {
          name: body.fullName,
          companyName: body.businessName,
          gstin: body.gstin,
          location: body.address,
          phoneNumber: body.phone,
          upiId: body.upiId,
          bankAccount: body.bankAccount
        }
      },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updatedOwner }, { status: 200 });
  } catch (error) {
    console.error("Update Settings Error:", error);
    return NextResponse.json({ success: false, error: "Failed to update settings" }, { status: 500 });
  }
}