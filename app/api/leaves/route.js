// app/api/leaves/route.js
import { NextResponse } from "next/server";

// IMPORTANT: Correct these imports according to your actual file names and paths
// Note: If Leave is exported alongside Attendance, use curly braces { Leave }
import connectDB from "@/lib/mongodb";
import { Leave } from "@/models/HR"; // Adjust path and import based on your schema file

export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");

    const query = employeeId ? { employeeId } : {};
    
    // Fetch leave history, newest first
    const leaves = await Leave.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: leaves }, { status: 200 });
  } catch (error) {
    console.error("GET Leaves Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leave history" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();

    const newLeave = await Leave.create({
      employeeId: body.employeeId || "emp-temp-123", // Replace with session ID later
      leaveType: body.leaveType,
      fromDate: body.fromDate,
      toDate: body.toDate,
      reason: body.reason,
      status: "Pending" // Always defaults to Pending for owner approval
    });

    return NextResponse.json(
      { success: true, message: "Leave request submitted", data: newLeave },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Leaves Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit leave request" },
      { status: 400 }
    );
  }
}