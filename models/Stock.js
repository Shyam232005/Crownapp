import mongoose from "mongoose";

const stockSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Owner", required: true, index: true },
  createdBy: { type: String, index: true },
  employeeId: { type: String, index: true },
  itemName: { type: String, required: true, trim: true, index: true },
  sku: { type: String, trim: true, default: "" },
  category: { type: String, trim: true, default: "General" },
  quantity: { type: Number, required: true },
  unit: { type: String, default: "Pieces (Pcs)" },
  supplierName: { type: String, trim: true, default: "General Supplier" },
  invoiceNumber: { type: String, trim: true, default: "" },
  challanNumber: { type: String, trim: true, default: "" },
  remarks: { type: String, default: "" },
  type: { type: String, default: "INWARD" },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.Stock || mongoose.model("Stock", stockSchema);
