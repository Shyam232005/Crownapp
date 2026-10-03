import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, index: true },
  leaveType: { 
    type: String, 
    enum: ["Casual Leave", "Sick Leave", "Half Day"], 
    required: true 
  },
  fromDate: { type: String, required: true },
  toDate: { type: String, required: true },
  reason: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["Pending", "Approved", "Rejected"], 
    default: "Pending" 
  }
}, { timestamps: true });

export default mongoose.models.Leave || mongoose.model("Leave", leaveSchema);