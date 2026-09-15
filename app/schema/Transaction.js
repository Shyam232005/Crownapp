import mongoose from "mongoose";

const entrySchema = new mongoose.Schema({
    accountName: { type: String },
    entryType: { type: String, enum: ["DEBIT", "CREDIT"] },
    amount: { type: Number, min: 0 },
});

const transactionSchema = new mongoose.Schema(
    {
        invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice", required: true },
        transactionDate: { type: Date, default: Date.now },
        description: { type: String },
        entries: [entrySchema]
    },
    { timestamps: true }
);

export default mongoose.models.Transaction || mongoose.model("Transaction", transactionSchema);