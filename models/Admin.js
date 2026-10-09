import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      default: "Super Admin"
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: ""
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["ADMIN", "Admin", "SUPER_ADMIN"],
      default: "ADMIN"
    },
    isSuperAdmin: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED"],
      default: "ACTIVE"
    }
  },
  { timestamps: true }
);

export default mongoose.models.Admin || mongoose.model("Admin", AdminSchema);
