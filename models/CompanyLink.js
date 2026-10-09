import mongoose from "mongoose";

const CompanyLinkSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Owner", required: true, index: true },
  caFirmId: { type: mongoose.Schema.Types.ObjectId, ref: "CA", required: true, index: true },
  status: { 
    type: String, 
    enum: ["PENDING", "CONNECTED", "NONE", "REVOKED"], 
    default: "PENDING",
    index: true 
  },
  lastDataSyncAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.CompanyLink || mongoose.model("CompanyLink", CompanyLinkSchema);
