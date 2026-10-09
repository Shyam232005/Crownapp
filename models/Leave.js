import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Owner", required: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, index: true },
  employeeId: { type: String, required: true, index: true },
  employeeName: { type: String, default: "Staff Member" },
  leaveType: { 
    type: String, 
    enum: ["Casual Leave", "Sick Leave", "Half Day", "CASUAL_LEAVE", "SICK_LEAVE", "HALF_DAY"], 
    required: true 
  },
  fromDate: { type: String, required: true },
  toDate: { type: String, required: true },
  reason: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["Pending", "Approved", "Rejected", "PENDING", "APPROVED", "REJECTED"], 
    default: "PENDING",
    index: true
  }
}, { timestamps: true });

// Normalize status to uppercase for consistent querying and sync createdBy
leaveSchema.pre("validate", function() {
  if (this.status) {
    this.status = this.status.toUpperCase();
  }
  if (!this.createdBy && this.employeeId) {
    try {
      this.createdBy = new mongoose.Types.ObjectId(this.employeeId);
    } catch {
      // not a valid ObjectId hex
    }
  }
});

export default mongoose.models.Leave || mongoose.model("Leave", leaveSchema);