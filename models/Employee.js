import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phoneNumber: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true },

  // Strict reference to the Owner (Company)
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Owner", required: true, index: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "Owner", index: true },

  // Production Link: Access Control
  roleInCompany: { 
    type: String, 
    enum: ["Admin", "Manager", "Data Entry", "Viewer"], 
    default: "Viewer" 
  },
  department: { type: String, trim: true, default: "General" },

  // Production Link: Security & Termination
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

EmployeeSchema.pre("validate", function () {
  if (this.companyId && !this.ownerId) {
    this.ownerId = this.companyId;
  } else if (this.ownerId && !this.companyId) {
    this.companyId = this.ownerId;
  }
});

export default mongoose.models.Employee || mongoose.model("Employee", EmployeeSchema);