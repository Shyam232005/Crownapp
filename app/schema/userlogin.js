import mongoose from "mongoose"

export const LoginSchema = new mongoose.Schema({
    emailOrPhone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
}, { timestamps: true })

export default mongoose.models.Login || mongoose.model("Login", LoginSchema)