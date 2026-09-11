import mongoose from "mongoose"

export const LoginSchema = new mongoose.Schema({
    fullName: { type: String },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
    companyName: { type: String, },
    companyRole: { type: String, },
    gstin: { type: String, },
    caFirmName: { type: String },
    icaiNumber: { type: String },
    cityState: { type: String },
    referredBy: { type: String },
    agreeTerms: { type: Boolean }
}, { timestamps: true })

export default mongoose.models.Login || mongoose.model("Login", LoginSchema)