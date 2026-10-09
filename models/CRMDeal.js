import mongoose from "mongoose";

/**
 * CRMDeal Schema
 * Employee CRM module for generating Quotes, Offers, and Invoices.
 * STRICT ISOLATION: Feeds Owner dashboard, but is strictly HIDDEN from CA firms.
 */
const CRMDealSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
      required: true,
      index: true
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true
    },
    employeeName: {
      type: String,
      default: ""
    },
    customerName: {
      type: String,
      required: true,
      trim: true
    },
    customerEmail: {
      type: String,
      trim: true,
      default: ""
    },
    customerPhone: {
      type: String,
      trim: true,
      default: ""
    },
    dealType: {
      type: String,
      enum: ["QUOTE", "OFFER", "INVOICE"],
      default: "QUOTE",
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      index: true
    },
    stage: {
      type: String,
      enum: ["LEAD", "OFFER_SENT", "WON", "LOST"],
      default: "LEAD",
      index: true
    },
    status: {
      type: String,
      enum: ["DRAFT", "SENT", "ACCEPTED", "REJECTED", "CONVERTED"],
      default: "DRAFT",
      index: true
    },
    items: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, default: 1, min: 1 },
        rate: { type: Number, default: 0, min: 0 },
        taxRate: { type: Number, default: 0 },
        amount: { type: Number, required: true }
      }
    ],
    validUntil: {
      type: Date
    },
    notes: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

export default mongoose.models.CRMDeal || mongoose.model("CRMDeal", CRMDealSchema);
