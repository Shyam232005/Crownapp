import mongoose from "mongoose";

const SubmissionSchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: ["Vendor Payment", "Customer Received", "General Expense", "Task/Report"]
  },
  partyName: { type: String },
  amount: { type: Number, default: 0 },
  paymentMode: { type: String },

  // NAYE COMPLIANCE FIELDS 🔥
  billNumber: { type: String },
  billDate: { type: String },
  gstin: { type: String },

  description: { type: String, required: true },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending"
  },

  SalesInvoice: {
    type: {
      type: String,
      required: true,
      enum: ["Vendor Payment", "Customer Received", "General Expense", "Task/Report", "Sales Invoice"] // Yahan "Sales Invoice" add kiya
    },
  },
}, { timestamps: true });

export default mongoose.models.Submission || mongoose.model("Submission", SubmissionSchema);