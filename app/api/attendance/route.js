// app/api/attendance/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");
    
    if (!employeeId) {
      return NextResponse.json({ success: false, error: "Missing employeeId" }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0]; // Gets YYYY-MM-DD
    
    const record = await Attendance.findOne({ employeeId, date: today });
    
    // If no record exists for today, they haven't punched in yet
    if (!record) {
      return NextResponse.json({ success: true, status: "punched-out" }, { status: 200 });
    }
    
    return NextResponse.json({ success: true, status: record.status }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch attendance" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const { employeeId, actionType } = await request.json();
    const today = new Date().toISOString().split('T')[0];

    if (actionType === "Punch In") {
      const newRecord = await Attendance.create({
        employeeId,
        date: today,
        punchInTime: new Date(),
        status: "punched-in"
      });
      return NextResponse.json({ success: true, data: newRecord }, { status: 201 });
    } 
    
    if (actionType === "Punch Out") {
      const updatedRecord = await Attendance.findOneAndUpdate(
        { employeeId, date: today, status: "punched-in" },
        { $set: { punchOutTime: new Date(), status: "completed" } },
        { new: true }
      );
      return NextResponse.json({ success: true, data: updatedRecord }, { status: 200 });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to update attendance" }, { status: 500 });
  }
}