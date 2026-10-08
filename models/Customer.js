import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Owner',
      required: [true, 'Company ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    balance: {
      type: Number,
      default: 0,
    },
    openingBalance: {
      type: Number,
      default: 0,
    },
    creditLimit: {
      type: Number,
      default: 0,
    },
    billingAddress: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    gstin: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
    },
  },
  { timestamps: true }
);

CustomerSchema.pre('validate', function () {
  if (this.billingAddress && !this.address) {
    this.address = this.billingAddress;
  } else if (this.address && !this.billingAddress) {
    this.billingAddress = this.address;
  }
  if (this.isNew && this.openingBalance && this.balance === 0) {
    this.balance = this.openingBalance;
  }
});

// Optional sparse compound index for unique customer phone per company
CustomerSchema.index({ companyId: 1, phone: 1 }, { unique: true, sparse: true });

export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);
