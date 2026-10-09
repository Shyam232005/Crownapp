import mongoose from "mongoose";

/**
 * Ledger Schema
 * Holds account definitions and summarizes balances derived from Journal Entries.
 */
const LedgerSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
      required: true,
      index: true
    },
    accountName: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    accountType: {
      type: String,
      required: true,
      enum: ["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"]
    },
    openingBalance: {
      type: Number,
      default: 0
    },
    totalDebit: {
      type: Number,
      default: 0
    },
    totalCredit: {
      type: Number,
      default: 0
    },
    closingBalance: {
      type: Number,
      default: 0
    },
    description: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

LedgerSchema.index({ companyId: 1, accountName: 1 }, { unique: true });

export default mongoose.models.Ledger || mongoose.model("Ledger", LedgerSchema);
