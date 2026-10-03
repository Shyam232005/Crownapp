import mongoose from "mongoose";

const AttendanceSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD for easy querying
  punchIn: { type: Date },
  punchOut: { type: Date },
  status: {
    type: String,
    enum: ["Present", "Half Day", "Absent"],
    default: "Present"
  }
}, { timestamps: true });

const LeaveSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  leaveType: { 
    type: String, 
    required: true,
    enum: ["Casual Leave", "Sick Leave", "Half Day"]
  },
  fromDate: { type: Date, required: true },
  toDate: { type: Date, required: true },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending"
  }
}, { timestamps: true });

export const Attendance = mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema);
export const Leave = mongoose.models.Leave || mongoose.model("Leave", LeaveSchema);