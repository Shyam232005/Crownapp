import mongoose from 'mongoose';

const LedgerEntrySchema = new mongoose.Schema({
  transactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
  accountName: { type: String, required: true }, // e.g., "Cash/Bank A/C", "Expense A/C"
  type: { type: String, enum: ['DEBIT', 'CREDIT'], required: true },
  amount: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.models.LedgerEntry || mongoose.model('LedgerEntry', LedgerEntrySchema);