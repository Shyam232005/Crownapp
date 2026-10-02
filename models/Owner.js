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

  // ✨ PRODUCTION-LEVEL: Subscription & Validation Tracking
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
      // active = running, trialing = in trial, past_due = payment failed but grace period, expired = totally dead, canceled = user stopped it
      type: String, 
      enum: ["active", "trialing", "past_due", "expired", "canceled"], 
      default: "trialing" 
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date }, 
    
    // Missing Pieces added for future Gateway Integration (Razorpay/Stripe)
    paymentCustomerId: { type: String, default: null }, 
    paymentSubscriptionId: { type: String, default: null },
    
    // Prevents "Free Trial" abuse (ek hi number se baar baar trial na le paye)
    hasUsedTrial: { type: Boolean, default: false } 
  },

  // Account State (Agar kisi owner ko ban karna ho ya soft-delete karna ho)
  isActive: { type: Boolean, default: true },

  // Relationships
  employees: [{ type: mongoose.Schema.Types.ObjectId, ref: "Employee" }],
  linkedCAs: [{ type: mongoose.Schema.Types.ObjectId, ref: "CA" }]
}, { timestamps: true });

// Function argument se 'next' hataya aur andar se 'next()' hataya
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