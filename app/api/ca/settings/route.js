// app/api/ca/settings/route.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import Owner from "@/models/Owner";

export async function GET(request) {
  try {
    await connectDB();
    
    const token = request.cookies.get("fineops_auth_token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    const caUser = await Owner.findById(payload.userId).select("-password");
    if (!caUser) {
      return NextResponse.json({ success: false, error: "CA firm not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: caUser }, { status: 200 });
  } catch (error) {
    console.error("Fetch CA Settings Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    await connectDB();
    
    const token = request.cookies.get("fineops_auth_token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    const body = await request.json();

    const updatedCA = await Owner.findByIdAndUpdate(
      payload.userId,
      {
        $set: {
          firmName: body.firmName,
          frn: body.frn,
          gstin: body.gstin,
          principalCa: body.principalCa,
          address: body.address,
          supportPhone: body.supportPhone,
          exportFormat: body.exportFormat
        }
      },
      { new: true }
    );

    return NextResponse.json({ success: true, data: updatedCA }, { status: 200 });
  } catch (error) {
    console.error("Update CA Settings Error:", error);
    return NextResponse.json({ success: false, error: "Failed to update settings" }, { status: 500 });
  }
}