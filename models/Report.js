// models/Report.js
import mongoose from "mongoose";
import "@/models/Owner";

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
  issuesCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.Report || mongoose.model("Report", reportSchema);