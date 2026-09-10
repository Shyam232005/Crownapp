import mongoose from "mongoose"

export const HelpSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: Number, required: true, unique: true },
    companyName: { type: String },
    gstin: { type: String, unique: true },
    caFirmName: { type: String },
    icaiNumber: { type: String, unique: true },
    issueCategory: { type: String },
    priority: { type: String },
    subject: { type: String },
    description: { type: String },
    affectedInvoiceOrVoucher: { type: String, required: true },
}, { timestamps: true })

export default mongoose.models.Help || mongoose.model("Help", HelpSchema)