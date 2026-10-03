// app/api/ca/staff/route.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import Staff from "@/models/Staff";

export async function GET(request) {
  try {
    await connectDB();
    
    const token = request.cookies.get("fineops_auth_token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    const staffMembers = await Staff.find({ firmId: payload.userId }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: staffMembers }, { status: 200 });
  } catch (error) {
    console.error("Fetch Staff Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch staff" }, { status: 500 });
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

    const newStaff = await Staff.create({
      firmId: payload.userId,
      name: body.name,
      role: body.role || "Audit Assistant",
      clientsCount: Number(body.clientsCount) || 0
    });

    return NextResponse.json({ success: true, data: newStaff }, { status: 201 });
  } catch (error) {
    console.error("Create Staff Error:", error);
    return NextResponse.json({ success: false, error: "Failed to create staff member" }, { status: 500 });
  }
}