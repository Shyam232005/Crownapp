import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import Attendance from "@/models/Attendance";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

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

    // 1. Generate server-side date strictly on the backend
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    // 2. Check if attendance already recorded today for this employee
    const existing = await Attendance.findOne({
      employeeId: decoded.userId.toString(),
      $or: [
        { date: { $gte: startOfDay, $lte: endOfDay } },
        { createdAt: { $gte: startOfDay, $lte: endOfDay } }
      ]
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        message: "Already punched in for today.",
        isPunchedIn: true,
        data: existing
      }, { status: 200 });
    }

    // 3. Create new attendance with server-side date and punchInTime
    const newRecord = await Attendance.create({
      employeeId: decoded.userId.toString(),
      companyId: decoded.companyId ? new mongoose.Types.ObjectId(decoded.companyId) : undefined,
      date: today,
      punchInTime: today,
      status: "punched-in"
    });

    return NextResponse.json({
      success: true,
      message: "Punch-in successful. Terminal unlocked.",
      isPunchedIn: true,
      data: newRecord
    }, { status: 201 });

  } catch (error) {
    console.error("Employee Punch-In Error:", error);
    return NextResponse.json({ error: error.message || "Failed to record punch-in" }, { status: 500 });
  }
}
