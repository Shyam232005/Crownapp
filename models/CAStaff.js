import mongoose from "mongoose";

const CAStaffSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phoneNumber: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true },

  // Link to the parent CA Firm
  caId: { type: mongoose.Schema.Types.ObjectId, ref: "CA", required: true, index: true },

  // Production Link: Client Isolation (Staff can only access assigned owners)
  assignedClients: [{ type: mongoose.Schema.Types.ObjectId, ref: "Owner" }],

  // Production Link: Access Level within CA Firm
  roleInFirm: {
    type: String,
    enum: ["Senior Auditor", "Junior Auditor", "Article Assistant"],
    default: "Article Assistant"
  },

  // Production Link: Security
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.CAStaff || mongoose.model("CAStaff", CAStaffSchema);