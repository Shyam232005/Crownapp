import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Owner',
    index: true,
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    index: true,
  },
  documentUrl: {
    type: String,
    default: '',
  },
  extractedData: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  status: {
    type: String,
    default: 'PENDING',
    index: true,
  },
  type: {
    type: String,
    enum: ['Expense', 'Sale', 'Purchase', 'EXPENSE', 'SALES', 'PURCHASE', 'General Expense', 'Vendor Payment', 'Customer Received', 'Sales Invoice'],
    default: 'EXPENSE',
  },
  amount: {
    type: Number,
    default: 0,
  },
  partyName: {
    type: String,
    default: '',
  },
  paymentMode: {
    type: String,
    default: 'Cash',
  },
  billNumber: {
    type: String,
    default: '',
  },
  billDate: {
    type: Date,
    default: Date.now,
  },
  gstin: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
}, { timestamps: true });

export default mongoose.models.Submission || mongoose.model('Submission', submissionSchema);
