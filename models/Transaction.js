import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner', required: true },
  createdBy: { type: String, required: true }, // Can be Employee ID or Owner ID
  type: { 
    type: String, 
    enum: ['SALES', 'PURCHASE', 'EXPENSE', 'COLLECTION', 'OPENING_BALANCE'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['PENDING_OWNER_APPROVAL', 'PENDING_CA_REVIEW', 'QUERY_RAISED', 'APPROVED', 'REJECTED', 'EXPORTED'], 
    default: 'PENDING_OWNER_APPROVAL' 
  },
  totalAmount: { type: Number, required: true },
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

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);