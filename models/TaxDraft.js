import mongoose from "mongoose";

const taxDraftSchema = new mongoose.Schema({
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: "Owner", required: true, index: true },
  client: { type: String, required: true, trim: true },
  month: { type: String, required: true },
  outputTax: { type: Number, required: true, default: 0 },
  itc: { type: Number, required: true, default: 0 },
  liability: { type: Number, required: true, default: 0 },
  status: { 
    type: String, 
    enum: ["Draft", "Pending CA Approval", "Approved"], 
    default: "Draft" 
  }
}, { timestamps: true });

export default mongoose.models.TaxDraft || mongoose.model("TaxDraft", taxDraftSchema);