import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, index: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Owner" },
  date: { type: Date, required: true, default: Date.now, index: true },
  punchInTime: { type: Date, required: true, default: Date.now },
  punchOutTime: { type: Date },
  status: { 
    type: String, 
    enum: ["punched-in", "completed", "punched-out"], 
    default: "punched-in" 
  }
}, { timestamps: true });

export default mongoose.models.Attendance || mongoose.model("Attendance", attendanceSchema);