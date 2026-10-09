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
    
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { 
      status: 401,
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
    });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ensure the requester is an employee
    if (decoded.role !== "Employee") {
      return NextResponse.json({ error: "Forbidden" }, { 
        status: 403,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
      });
    }

    await connectDB();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch the attendance record securely using the JWT userId
    const attendanceRecord = await Attendance.findOne({
      employeeId: decoded.userId.toString(),
      $or: [
        { date: { $gte: startOfDay, $lte: endOfDay } },
        { createdAt: { $gte: startOfDay, $lte: endOfDay } }
      ]
    });

    const isPunchedIn = !!attendanceRecord && attendanceRecord.status === "punched-in";
    const status = attendanceRecord ? attendanceRecord.status : "punched-out";

    return NextResponse.json(
      { status, isPunchedIn, record: attendanceRecord || null },
      { 
        status: 200,
        headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
      }
    );

  } catch (error) {
    console.error("GET Attendance Error:", error);
    return NextResponse.json({ error: "Internal Server Error", isPunchedIn: false }, { 
      status: 500,
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" }
    });
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
    const body = await request.json().catch(() => ({}));
    const actionType = body.actionType || "Punch In";

    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    if (actionType === "Punch In") {
      // Check existing record for today
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

      // Create new record for today with server-side dates
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
        isPunchedIn: true, 
        status: "punched-in",
        data: newRecord 
      }, { status: 201 });
      
    } else if (actionType === "Punch Out") {
      // Update today's record to completed
      const updatedRecord = await Attendance.findOneAndUpdate(
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
      
      if (!updatedRecord) {
        return NextResponse.json({ error: "No active punch-in found for today." }, { status: 400 });
      }
      
      return NextResponse.json({ 
        success: true, 
        isPunchedIn: false, 
        status: "completed",
        data: updatedRecord 
      }, { status: 200 });
    }

    return NextResponse.json({ error: "Invalid action type" }, { status: 400 });

  } catch (error) {
    console.error("POST Attendance Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process attendance" }, { status: 500 });
  }
}