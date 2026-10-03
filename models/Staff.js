// models/Staff.js
import mongoose from "mongoose";

const staffSchema = new mongoose.Schema({
  firmId: { type: mongoose.Schema.Types.ObjectId, ref: "Owner", required: true, index: true },
  name: { type: String, required: true, trim: true },
  role: { type: String, default: "Audit Assistant" },
  clientsCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.Staff || mongoose.model("Staff", staffSchema);