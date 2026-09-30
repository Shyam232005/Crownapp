import mongoose from "mongoose";

const CASchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  firmName: { type: String, required: true },
  ownerIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Owner" }] // Ek CA ke paas multiple owners (clients) ho sakte hain
}, { timestamps: true });

export default mongoose.models.CA || mongoose.model("CA", CASchema);