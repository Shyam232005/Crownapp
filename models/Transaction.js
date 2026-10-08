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
  receiptNumber: { type: String, trim: true, default: '' },
  paymentMethod: { type: String, trim: true, default: '' },
  transactionDate: { type: Date, default: Date.now },
  metadata: {
    vendorName: String,
    customerName: String,
    payeeName: String,
    paymentMode: String,
    paymentMethod: String,
    receiptNumber: String,
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

  // Sync paymentMethod and metadata.paymentMode
  if (this.paymentMethod && (!this.metadata || !this.metadata.paymentMode)) {
    if (!this.metadata) this.metadata = {};
    this.metadata.paymentMode = this.paymentMethod;
    this.metadata.paymentMethod = this.paymentMethod;
  } else if (this.metadata?.paymentMode && !this.paymentMethod) {
    this.paymentMethod = this.metadata.paymentMode;
    this.metadata.paymentMethod = this.metadata.paymentMode;
  }

  // Sync receiptNumber and metadata.receiptNumber
  if (this.receiptNumber && (!this.metadata || !this.metadata.receiptNumber)) {
    if (!this.metadata) this.metadata = {};
    this.metadata.receiptNumber = this.receiptNumber;
  } else if (this.metadata?.receiptNumber && !this.receiptNumber) {
    this.receiptNumber = this.metadata.receiptNumber;
  }

  // Normalize type
  if (this.type) {
    const upper = this.type.trim().toUpperCase();
    const validTypes = [
      'SALES', 'PURCHASE', 'EXPENSE', 'COLLECTION', 
      'ADVANCE_RECEIVED', 'PAYMENT_IN', 'PAYMENT_OUT', 
      'INCOME', 'OPENING_BALANCE'
    ];
    if (validTypes.includes(upper)) {
      this.type = upper;
    }
  }
});

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);