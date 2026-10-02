import mongoose from "mongoose";
import crypto from "crypto";

const CASchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phoneNumber: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true },

  firmName: { type: String, required: true, trim: true },
  icaiNumber: { type: String, required: true, unique: true, uppercase: true },
  
  // ✨ NEW: CA kis code se platform par aaya (Owner ka invite code)
  joinedViaCode: { type: String, required: true },
  
  // CA apna code generate karega apne staff ke liye
  inviteCode: { type: String, unique: true, index: true }, 

  isVerifiedICAI: { type: Boolean, default: false },
  clients: [{ type: mongoose.Schema.Types.ObjectId, ref: "Owner" }],
  staff: [{ type: mongoose.Schema.Types.ObjectId, ref: "CAStaff" }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

CASchema.pre("save", function () {
  if (this.isNew && !this.inviteCode) {
    const rawString = `${this.firmName}-${this.icaiNumber}-${Date.now()}`;
    const hash = crypto.createHash("md5").update(rawString).digest("hex").substring(0, 6).toUpperCase();
    this.inviteCode = `CA-${hash}`;
  }
});

export default mongoose.models.CA || mongoose.model("CA", CASchema);