// models/Report.js
import mongoose from "mongoose";
import "./Owner.js";

const reportSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Owner", index: true },
  clientId: { type: String }, // Links to Owner ID
  caId: { type: String }, // Links to CA ID
  uploadedBy: { type: String },
  clientName: { type: String },
  period: { type: String, default: "" }, // e.g., "October 2026"
  reportType: { type: String, default: "Audit Report" },
  status: { type: String, default: "Clean (Verified)" },
  fileData: { type: String, required: true }, // Base64 string for Vercel serverless compatibility
  staffName: { type: String, default: "Primary CA" },
  issuesCount: { type: Number, default: 0 },
  // Strict relational department linking
  department: {
    type: String,
    enum: ["FINANCE", "OPERATIONS", "SALES", "HR"],
    default: "FINANCE",
    uppercase: true,
    trim: true,
    index: true
  },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    index: true
  },
  category: {
    type: String,
    trim: true,
    default: "FINANCIAL_AUDIT"
  }
}, { timestamps: true });

reportSchema.index({ companyId: 1, department: 1 });

reportSchema.pre("validate", function () {
  if (!this.department && this.reportType) {
    const typeUpper = this.reportType.toUpperCase();
    if (typeUpper.includes("STOCK") || typeUpper.includes("INVENTORY")) {
      this.department = "OPERATIONS";
    } else if (typeUpper.includes("SALE") || typeUpper.includes("REVENUE")) {
      this.department = "SALES";
    } else if (typeUpper.includes("PAYROLL") || typeUpper.includes("STAFF") || typeUpper.includes("HR")) {
      this.department = "HR";
    } else {
      this.department = "FINANCE";
    }
  }
});

export default mongoose.models.Report || mongoose.model("Report", reportSchema);