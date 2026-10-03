import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Leave from "@/models/Leave";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");

    const query = employeeId ? { employeeId } : {};
    const leaves = await Leave.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: leaves }, { status: 200 });
  } catch (error) {
    console.error("Fetch Leaves Error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch leaves" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const newLeave = await Leave.create({
      employeeId: body.employeeId || "emp-temp-123",
      leaveType: body.leaveType,
      fromDate: body.fromDate,
      toDate: body.toDate,
      reason: body.reason,
      status: "Pending"
    });

    return NextResponse.json({ success: true, data: newLeave }, { status: 201 });
  } catch (error) {
    console.error("Create Leave Error:", error);
    return NextResponse.json({ success: false, error: "Failed to submit leave request" }, { status: 500 });
  }
}