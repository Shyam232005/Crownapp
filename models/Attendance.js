// models/Attendance.js
import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, index: true },
  date: { type: String, required: true, index: true }, // Format: YYYY-MM-DD for easy daily querying
  punchInTime: { type: Date, required: true },
  punchOutTime: { type: Date },
  status: { 
    type: String, 
    enum: ["punched-in", "completed"], 
    default: "punched-in" 
  }
}, { timestamps: true });

export default mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);