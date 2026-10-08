import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import Attendance from "@/models/Attendance"; // Assuming this model exists

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
    
    // Ensure the requester is an employee
    if (decoded.role !== "Employee") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch the attendance record securely using the JWT userId
    const attendanceRecord = await Attendance.findOne({
      employeeId: decoded.userId,
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const isPunchedIn = !!attendanceRecord && (attendanceRecord.status === "punched-in" || attendanceRecord.status === "completed");

    if (!attendanceRecord) {
      return NextResponse.json({ status: "punched-out", isPunchedIn: false }, { status: 200 });
    }

    return NextResponse.json({ status: attendanceRecord.status, isPunchedIn, record: attendanceRecord }, { status: 200 });

  } catch (error) {
    console.error("GET Attendance Error:", error);
    return NextResponse.json({ error: "Internal Server Error", isPunchedIn: false }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "Employee") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await connectDB();
    const { actionType } = await request.json();

    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    if (actionType === "Punch In") {
      // Check existing record for today
      const existing = await Attendance.findOne({
        employeeId: decoded.userId,
        $or: [
          { date: { $gte: startOfDay, $lte: endOfDay } },
          { createdAt: { $gte: startOfDay, $lte: endOfDay } }
        ]
      });

      if (existing) {
        return NextResponse.json({ success: true, isPunchedIn: true, data: existing }, { status: 200 });
      }

      // Create new record for today with server-side dates
      const newRecord = await Attendance.create({
        employeeId: decoded.userId,
        companyId: decoded.companyId,
        date: today,
        punchInTime: today,
        status: "punched-in"
      });
      return NextResponse.json({ success: true, isPunchedIn: true, data: newRecord }, { status: 201 });
      
    } else if (actionType === "Punch Out") {
      // Update today's record to completed
      const updatedRecord = await Attendance.findOneAndUpdate(
        { 
          employeeId: decoded.userId,
          createdAt: { $gte: startOfDay, $lte: endOfDay }
        },
        { 
          $set: { 
            status: "completed",
            punchOutTime: new Date()
          } 
        },
        { new: true }
      );
      
      if (!updatedRecord) {
        return NextResponse.json({ error: "No active punch-in found for today." }, { status: 400 });
      }
      
      return NextResponse.json({ success: true, data: updatedRecord }, { status: 200 });
    }

    return NextResponse.json({ error: "Invalid action type" }, { status: 400 });

  } catch (error) {
    console.error("POST Attendance Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}