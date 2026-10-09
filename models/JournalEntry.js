import mongoose from "mongoose";

/**
 * JournalEntry Schema
 * Strict Double-Entry Accounting Core
 * Total Debits MUST strictly equal Total Credits before saving.
 */
const JournalEntrySchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
      required: true,
      index: true
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
      index: true
    },
    referenceId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    narration: {
      type: String,
      default: "",
      trim: true
    },
    entries: [
      {
        accountName: {
          type: String,
          required: true,
          trim: true
        },
        accountType: {
          type: String,
          required: true,
          enum: ["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"]
        },
        type: {
          type: String,
          enum: ["DEBIT", "CREDIT"],
          required: true
        },
        amount: {
          type: Number,
          required: true,
          min: 0
        }
      }
    ],
    gstRate: {
      type: Number,
      enum: [0, 5, 12, 18, 28],
      default: 0
    },
    taxDetails: {
      cgst: { type: Number, default: 0 },
      sgst: { type: Number, default: 0 },
      igst: { type: Number, default: 0 }
    },
    status: {
      type: String,
      enum: ["DRAFT", "POSTED", "VOID"],
      default: "POSTED",
      index: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "creatorModel"
    },
    creatorModel: {
      type: String,
      enum: ["Owner", "Employee"],
      default: "Owner"
    }
  },
  { timestamps: true }
);

// Strict Double-Entry Accounting Validation Hook
JournalEntrySchema.pre("save", function (next) {
  if (!this.entries || this.entries.length < 2) {
    return next(
      new Error("A valid double-entry journal entry must contain at least 2 entry lines.")
    );
  }

  let totalDebits = 0;
  let totalCredits = 0;

  for (const entry of this.entries) {
    const amt = Number(entry.amount) || 0;
    if (amt <= 0) {
      return next(new Error(`Entry amount for ${entry.accountName} must be positive.`));
    }
    if (entry.type === "DEBIT") {
      totalDebits += amt;
    } else if (entry.type === "CREDIT") {
      totalCredits += amt;
    }
  }

  // Tolerance check for floating point rounding: 0.001
  const difference = Math.abs(totalDebits - totalCredits);
  if (difference > 0.001) {
    return next(
      new Error(
        `Debits and Credits must balance. Total Debit: ₹${totalDebits.toFixed(
          2
        )}, Total Credit: ₹${totalCredits.toFixed(2)}, Imbalance: ₹${difference.toFixed(2)}`
      )
    );
  }

  next();
});

export default mongoose.models.JournalEntry ||
  mongoose.model("JournalEntry", JournalEntrySchema);
