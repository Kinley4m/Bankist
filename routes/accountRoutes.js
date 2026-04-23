const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/profile', protect, async (req, res) => {
  const transactions = await Transaction.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate('relatedUser', 'fullName email accountNumber');

  res.json({
    user: {
      fullName: req.user.fullName,
      email: req.user.email,
      accountNumber: req.user.accountNumber,
      balance: req.user.balance,
      createdAt: req.user.createdAt,
    },
    transactions,
  });
});

router.post('/deposit', protect, async (req, res) => {
  const { amount, note } = req.body;
  const numericAmount = Number(amount);

  if (!numericAmount || numericAmount <= 0) {
    return res.status(400).json({ message: 'Valid deposit amount is required' });
  }

  req.user.balance += numericAmount;
  await req.user.save();

  await Transaction.create({
    user: req.user._id,
    type: 'deposit',
    amount: numericAmount,
    note: note || 'Money added to account',
  });

  res.json({ message: 'Amount deposited successfully' });
});

router.post('/withdraw', protect, async (req, res) => {
  const { amount, note } = req.body;
  const numericAmount = Number(amount);

  if (!numericAmount || numericAmount <= 0) {
    return res.status(400).json({ message: 'Valid withdraw amount is required' });
  }

  if (req.user.balance < numericAmount) {
    return res.status(400).json({ message: 'Insufficient balance' });
  }

  req.user.balance -= numericAmount;
  await req.user.save();

  await Transaction.create({
    user: req.user._id,
    type: 'withdraw',
    amount: numericAmount,
    note: note || 'Money withdrawn from account',
  });

  res.json({ message: 'Amount withdrawn successfully' });
});

router.post('/loan', protect, async (req, res) => {
  const { amount, note } = req.body;
  const numericAmount = Number(amount);

  if (!numericAmount || numericAmount <= 0) {
    return res.status(400).json({ message: 'Valid loan amount is required' });
  }

  if (numericAmount > Math.max(10000, req.user.balance * 2)) {
    return res.status(400).json({
      message: 'Loan denied. Loan amount is too high for current account profile.',
    });
  }

  req.user.balance += numericAmount;
  await req.user.save();

  await Transaction.create({
    user: req.user._id,
    type: 'loan',
    amount: numericAmount,
    note: note || 'Loan approved and credited',
  });

  res.json({ message: 'Loan approved successfully' });
});

router.post('/transfer', protect, async (req, res) => {
  const { receiver, amount, note } = req.body;
  const numericAmount = Number(amount);

  if (!receiver || !numericAmount || numericAmount <= 0) {
    return res.status(400).json({ message: 'Receiver and valid amount are required' });
  }

  if (req.user.balance < numericAmount) {
    return res.status(400).json({ message: 'Insufficient balance for transfer' });
  }

  const recipient = await User.findOne({
    $or: [{ email: receiver.toLowerCase() }, { accountNumber: receiver.toUpperCase() }],
  });

  if (!recipient) {
    return res.status(404).json({ message: 'Recipient not found' });
  }

  if (recipient._id.toString() === req.user._id.toString()) {
    return res.status(400).json({ message: 'You cannot transfer money to yourself' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sender = await User.findById(req.user._id).session(session);
    const receiverUser = await User.findById(recipient._id).session(session);

    if (sender.balance < numericAmount) {
      throw new Error('Insufficient balance for transfer');
    }

    sender.balance -= numericAmount;
    receiverUser.balance += numericAmount;

    await sender.save({ session });
    await receiverUser.save({ session });

    await Transaction.create(
      [
        {
          user: sender._id,
          type: 'transfer_sent',
          amount: numericAmount,
          note: note || `Transferred to ${receiverUser.fullName}`,
          relatedUser: receiverUser._id,
        },
        {
          user: receiverUser._id,
          type: 'transfer_received',
          amount: numericAmount,
          note: note || `Received from ${sender.fullName}`,
          relatedUser: sender._id,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'Transfer completed successfully' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ message: error.message || 'Transfer failed' });
  }
});

module.exports = router;
