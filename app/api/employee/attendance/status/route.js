import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import Attendance from "@/models/Attendance";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(process.env.MONGODB_URI);
};

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("crown_session")?.value;
    
    if (!token) {
      return NextResponse.json({ isPunchedIn: false, error: "Unauthorized" }, { 
        status: 401,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ isPunchedIn: false, error: "Invalid session" }, { 
        status: 401,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" }
      });
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

    const isPunchedIn = !!record && record.status === "punched-in";
    const isCompleted = !!record && record.status === "completed";

    return NextResponse.json({
      isPunchedIn,
      isCompleted,
      status: record ? record.status : "punched-out",
      record: record || null
    }, { 
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate"
      }
    });

  } catch (error) {
    console.error("GET Employee Attendance Status Error:", error);
    return NextResponse.json({ 
      isPunchedIn: false, 
      error: error.message || "Failed to check status" 
    }, { 
      status: 500,
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate" }
    });
  }
}
