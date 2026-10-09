import mongoose from "mongoose";

const bankRecoSchema = new mongoose.Schema(
  {
    clientId: { type: String, index: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Owner", index: true },
    caStaffId: { type: mongoose.Schema.Types.ObjectId, ref: "CAStaff" },
    desc: { type: String, required: true },
    date: { type: String, default: () => new Date().toLocaleDateString("en-IN") },
    bankAmt: { type: Number, required: true },
    bookAmt: { type: Number, default: null },
    match: { type: Boolean, default: false },
    fileUrl: { type: String, default: "" },
    filename: { type: String, default: "" },
    status: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "REVIEW_READY", "Completed"],
      default: "PENDING",
      index: true
    }
  },
  { timestamps: true }
);

export default mongoose.models.BankReco || mongoose.model("BankReco", bankRecoSchema);