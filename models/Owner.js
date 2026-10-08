import mongoose from "mongoose";
import crypto from "crypto";

const OwnerSchema = new mongoose.Schema({
  // Basic Info
  name: { type: String, required: true, trim: true },
  phoneNumber: { type: String, required: true, unique: true, index: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, required: true },

  // Business Details
  companyName: { type: String, required: true, trim: true },
  gstin: { type: String, required: true, uppercase: true },
  location: { type: String, required: true },
  Category: { type: String, required: true },
  inviteCode: { type: String, unique: true, index: true },

  // PRODUCTION-LEVEL: Subscription & Validation Tracking
  subscriptionExpiry: { type: Date },
  subscription: {
    planName: { 
      type: String, 
      enum: ["Free Trial", "MSME Starter", "Manufacturing & Growth", "Enterprise Multi-Unit"], 
      default: "Free Trial" 
    },
    cycle: { 
      type: String, 
      enum: ["monthly", "annual", "trial"], 
      default: "trial" 
    },
    status: { 
      type: String, 
      enum: ["active", "trialing", "past_due", "expired", "canceled"], 
      default: "trialing" 
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date }, 
    paymentCustomerId: { type: String, default: null }, 
    paymentSubscriptionId: { type: String, default: null },
    hasUsedTrial: { type: Boolean, default: false } 
  },

  // Account State
  isActive: { type: Boolean, default: true },

  // Relationships & Vault State (Updated for Vercel Serverless & 1-to-1 Mapping)
  employees: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }],
  linkedCaFirm: [{ type: mongoose.Schema.Types.ObjectId, ref: "CA" }],
  vaultStatus: { 
    type: String, 
    enum: ["Locked", "Requested", "Unlocked"], 
    default: "Locked" 
  }
}, { timestamps: true });

OwnerSchema.pre("save", function () {
  if (this.isNew && !this.inviteCode) {
    const rawString = `${this.companyName}-${this.phoneNumber}-${Date.now()}`;
    const hash = crypto.createHash("md5").update(rawString).digest("hex").substring(0, 6).toUpperCase();
    this.inviteCode = `BIZ-${hash}`;
  }

  if (this.isModified('subscription.status') && this.subscription.status === 'trialing') {
    this.subscription.hasUsedTrial = true;
  }
});

export default mongoose.models.Owner || mongoose.model("Owner", OwnerSchema);