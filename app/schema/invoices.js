import mongoose from "mongoose"

export const InvoicesSchema = new mongoose.Schema({
    merchant_name: { type: String },
    merchant_phone: { type: Number },
    merchant_address: { type: String },
    Bill_No: { type: String },
    GST_NO: { type: String, unique: true },
    Bill_Date: { type: String },
    Total: { type: String },
    CGST: { type: String },
    SGST: { type: String },
    IGST: { type: String },
    isPosted: { type: Boolean, default: false },
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction", default: null, },
})

export default mongoose.models.Invoices || mongoose.model("Invoices", InvoicesSchema)