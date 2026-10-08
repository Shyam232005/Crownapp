import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true, index: true },
  createdBy: { type: String, required: true, index: true }, // User ID (Employee or Owner)
  type: { 
    type: String, 
    required: true,
    trim: true
  },
  status: { 
    type: String, 
    enum: ['PENDING_OWNER_APPROVAL', 'PENDING_CA_REVIEW', 'QUERY_RAISED', 'APPROVED', 'REJECTED', 'EXPORTED'], 
    default: 'PENDING_OWNER_APPROVAL',
    index: true 
  },
  amount: { type: Number, required: true },
  totalAmount: { type: Number },
  transactionDate: { type: Date, default: Date.now },
  metadata: {
    vendorName: String,
    customerName: String,
    payeeName: String,
    paymentMode: String,
    description: String,
    invoiceNumber: String,
    gstin: String,
    category: String
  }
}, { timestamps: true });

TransactionSchema.pre('validate', function () {
  // Sync amount and totalAmount for universal compatibility
  if (this.amount != null && this.totalAmount == null) {
    this.totalAmount = this.amount;
  } else if (this.totalAmount != null && this.amount == null) {
    this.amount = this.totalAmount;
  }

  // Normalize type
  if (this.type) {
    const upper = this.type.trim().toUpperCase();
    if (upper === 'SALES' || upper === 'PURCHASE' || upper === 'EXPENSE' || upper === 'COLLECTION' || upper === 'OPENING_BALANCE') {
      this.type = upper;
    }
  }
});

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);