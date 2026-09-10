import mongoose from "mongoose"

export const CASchema = new mongoose.Schema({
    membershipNo : { type: Number, required: true, unique: true },
    FirmRegistrationNumber: { type: String},
    Password : {type: String , require: true}
}, { timestamps: true })

export default mongoose.models.CA || mongoose.model("CA", CASchema)