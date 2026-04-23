const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['deposit', 'withdraw', 'transfer_sent', 'transfer_received', 'loan'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    note: {
      type: String,
      default: '',
      trim: true,
    },
    relatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', transactionSchema);
