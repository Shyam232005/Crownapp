import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
  employeeId: { type: String, required: true },
  itemName: { type: String, required: true, trim: true, index: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true, default: "Pieces (Pcs)" },
  supplierName: { type: String, required: true, trim: true },
  challanNumber: { type: String },
  remarks: { type: String }
}, { timestamps: true });

export default mongoose.models.Inventory || mongoose.model("Inventory", inventorySchema);