import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema({
  type: { 
    type: String, 
    required: true,
    enum: ["General Expense", "Vendor Payment", "Customer Received", "Sales Invoice"]
  },
  amount: { type: Number, required: true },
  partyName: { type: String, default: "Internal" },
  paymentMode: { type: String, default: "Cash" },
  billNumber: { type: String },
  billDate: { type: String },
  gstin: { type: String },
  description: { type: String },
  employeeId: { type: String, required: true },
  status: { 
    type: String, 
    enum: ["Pending", "Approved", "Rejected"], 
    default: "Pending" 
  }
}, { timestamps: true });

export default mongoose.models.Submission || mongoose.model("Submission", submissionSchema);