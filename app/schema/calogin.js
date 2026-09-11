import mongoose from "mongoose"

export const CASchema = new mongoose.Schema({
    caName: { type: String },
    icaiNumber: { type: Number, required: true },
    firmName: { type: String },
    password: { type: String },
    city: { type: String },
    email: { type: String },
    phone: { type: String },
    clientCount: { type: String },
    referredBy: { type: String }
}, { timestamps: true })

export default mongoose.models.CA || mongoose.model("CA", CASchema)