import mongoose from "mongoose";

export const DEPARTMENTS = {
  OPERATIONS: "OPERATIONS",
  SALES: "SALES",
  FINANCE: "FINANCE",
  HR: "HR",
  GENERAL: "GENERAL"
};

export const EMPLOYEE_ROLES = {
  EMPLOYEE: "EMPLOYEE",
  MANAGER: "MANAGER",
  HEAD: "HEAD",
  ADMIN: "ADMIN",
  VIEWER: "VIEWER"
};

const DepartmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      enum: ["OPERATIONS", "SALES", "FINANCE", "HR", "GENERAL"]
    },
    displayName: {
      type: String,
      required: true,
      trim: true
    },
    code: {
      type: String,
      uppercase: true,
      trim: true
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
      required: true,
      index: true
    },
    description: {
      type: String,
      default: ""
    },
    headEmployeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee"
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Compound index to guarantee unique department per company
DepartmentSchema.index({ companyId: 1, name: 1 }, { unique: true });

export default mongoose.models.Department || mongoose.model("Department", DepartmentSchema);
