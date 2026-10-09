import { NextResponse } from "next/server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import Attendance from "@/models/Attendance";

export const dynamic = "force-dynamic";

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

    const body = await request.json().catch(() => ({}));
    const actionType = body.actionType || "Punch In";

    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    if (actionType === "Punch Out") {
      const updated = await Attendance.findOneAndUpdate(
        {
          employeeId: decoded.userId.toString(),
          $or: [
            { date: { $gte: startOfDay, $lte: endOfDay } },
            { createdAt: { $gte: startOfDay, $lte: endOfDay } }
          ]
        },
        {
          $set: {
            status: "completed",
            punchOutTime: new Date()
          }
        },
        { new: true }
      );

      if (!updated) {
        return NextResponse.json({ error: "No active punch-in found for today." }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: "Punch-out recorded. Shift completed.",
        isPunchedIn: false,
        status: "completed",
        data: updated
      }, { status: 200 });
    }

    // Default: Punch In
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
        message: "Attendance record exists for today.",
        isPunchedIn: existing.status === "punched-in",
        status: existing.status,
        data: existing
      }, { status: 200 });
    }

    let companyId = decoded.companyId;
    if (!companyId) {
      const Employee = mongoose.models.Employee || (await import("@/models/Employee")).default;
      const emp = await Employee.findById(decoded.userId);
      companyId = emp?.companyId;
    }

    const newRecord = await Attendance.create({
      employeeId: decoded.userId.toString(),
      companyId: companyId,
      createdBy: decoded.userId,
      date: today,
      punchInTime: today,
      status: "punched-in"
    });

    return NextResponse.json({
      success: true,
      message: "Punch-in successful. Terminal unlocked.",
      isPunchedIn: true,
      status: "punched-in",
      data: newRecord
    }, { status: 201 });

  } catch (error) {
    console.error("Employee Attendance Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process attendance" }, { status: 500 });
  }
}
