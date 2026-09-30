import mongoose from "mongoose";

const OwnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  businessName: { type: String, required: true },
  inviteCode: { type: String, unique: true }, // Employees ko invite karne ke liye
  // Optional: Owner can link multiple CAs later
  caId: { type: mongoose.Schema.Types.ObjectId, ref: "CA" } 
}, { timestamps: true });

export default mongoose.models.Owner || mongoose.model("Owner", OwnerSchema);