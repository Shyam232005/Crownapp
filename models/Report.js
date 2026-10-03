// models/Report.js
import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  clientId: { type: String, required: true }, // Links to Owner ID
  caId: { type: String, required: true }, // Links to CA ID
  clientName: { type: String, required: true },
  period: { type: String, required: true }, // e.g., "October 2026"
  reportType: { type: String, enum: ["Tax Draft", "Audit Report", "Financial Chart"], required: true },
  status: { type: String, enum: ["Clean (Verified)", "Issues Found", "Pending Review"], default: "Clean (Verified)" },
  fileData: { type: String, required: true }, // Base64 string for Vercel serverless compatibility
  staffName: { type: String, default: "Primary CA" },
  issuesCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.Report || mongoose.model("Report", reportSchema);