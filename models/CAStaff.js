import mongoose from "mongoose";

const CAStaffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  caId: { type: mongoose.Schema.Types.ObjectId, ref: "CA", required: true }, // Linked to their CA Firm
  assignedClients: [{ type: mongoose.Schema.Types.ObjectId, ref: "Owner" }] // Jin clients ka data yeh staff check karega
}, { timestamps: true });

export default mongoose.models.CAStaff || mongoose.model("CAStaff", CAStaffSchema);