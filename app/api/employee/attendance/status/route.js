import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import Attendance from "@/models/Attendance";

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    
    if (!token) {
      return NextResponse.json({ isPunchedIn: false, error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ isPunchedIn: false, error: "Invalid session" }, { status: 401 });
    }

    await connectDB();

    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const record = await Attendance.findOne({
      employeeId: decoded.userId.toString(),
      $or: [
        { date: { $gte: startOfDay, $lte: endOfDay } },
        { createdAt: { $gte: startOfDay, $lte: endOfDay } }
      ]
    });

    const isPunchedIn = !!record && (record.status === "punched-in" || record.status === "completed");

    return NextResponse.json({
      isPunchedIn,
      status: record ? record.status : "punched-out",
      record: record || null
    }, { status: 200 });

  } catch (error) {
    console.error("GET Employee Attendance Status Error:", error);
    return NextResponse.json({ isPunchedIn: false, error: error.message || "Failed to check status" }, { status: 500 });
  }
}
