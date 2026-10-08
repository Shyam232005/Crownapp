import mongoose from 'mongoose';

const SubmissionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Expense', 'Sale', 'Purchase', 'EXPENSE', 'SALES', 'PURCHASE'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  partyName: {
    type: String,
    required: true
  },
  paymentMode: {
    type: String,
    default: 'Cash'
  },
  billNumber: {
    type: String
  },
  billDate: {
    type: Date,
    default: Date.now
  },
  gstin: {
    type: String
  },
  description: {
    type: String
  },
  employeeId: {
    type: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  }
}, { timestamps: true });

export default mongoose.models.Submission || mongoose.model('Submission', SubmissionSchema);
