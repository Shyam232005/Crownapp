// models/BankReco.js
import mongoose from "mongoose";

const bankRecoSchema = new mongoose.Schema({
  clientId: { type: String, required: true, index: true },
  desc: { type: String, required: true },
  date: { type: String, required: true },
  bankAmt: { type: Number, required: true },
  match: { type: Boolean, default: false },
  bookAmt: { type: Number, default: null }
}, { timestamps: true });

export default mongoose.models.BankReco || mongoose.model("BankReco", bankRecoSchema);