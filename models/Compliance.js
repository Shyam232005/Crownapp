import mongoose from "mongoose";

const TaxDraftSchema = new mongoose.Schema({
  clientId: { type: String, required: true }, // Links to the Firm/Owner
  caStaffId: { type: String, required: true },
  month: { type: String, required: true }, // e.g., "September 2026"
  outputTax: { type: Number, default: 0 },
  itc: { type: Number, default: 0 },
  liability: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["Draft", "Sent for CA Review", "Approved", "Filed"],
    default: "Draft"
  }
}, { timestamps: true });

const AuditReportSchema = new mongoose.Schema({
  clientId: { type: String, required: true },
  caStaffId: { type: String, required: true },
  period: { type: String, required: true }, // e.g., "Q2 2026"
  issuesFound: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["In Progress", "Issues Found", "Clean (Verified)"],
    default: "In Progress"
  },
  reportNotes: { type: String }
}, { timestamps: true });

export const TaxDraft = mongoose.models.TaxDraft || mongoose.model("TaxDraft", TaxDraftSchema);
export const AuditReport = mongoose.models.AuditReport || mongoose.model("AuditReport", AuditReportSchema);