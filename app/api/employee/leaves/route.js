import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import Leave from "@/models/Leave";

export const dynamic = 'force-dynamic';

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    await connectDB();

    const companyId = decoded.companyId || decoded.userId;
    const leaves = await Leave.find({
      companyId: new mongoose.Types.ObjectId(companyId),
      employeeId: decoded.userId
    }).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: leaves }, { status: 200 });

  } catch (error) {
    console.error("GET Leaves Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch leaves" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    await connectDB();
    const body = await request.json();
    
    const { leaveType, fromDate, toDate, reason, employeeName } = body;

    if (!leaveType || !fromDate || !toDate || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const companyId = decoded.companyId || decoded.userId;

    const newLeave = await Leave.create({
      companyId: new mongoose.Types.ObjectId(companyId),
      employeeId: decoded.userId.toString(),
      employeeName: employeeName || "Staff Member",
      leaveType,
      fromDate,
      toDate,
      reason,
      status: "PENDING"
    });

    return NextResponse.json({ 
      success: true, 
      message: "Leave request submitted to owner.",
      data: newLeave 
    }, { status: 201 });

  } catch (error) {
    console.error("POST Leave Error:", error);
    return NextResponse.json({ error: error.message || "Failed to submit leave request" }, { status: 500 });
  }
}