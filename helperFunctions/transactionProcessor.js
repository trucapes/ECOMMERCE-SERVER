const creditModel = require("../models/creditModel");
const Transaction = require("../models/transactionModel");
const userModel = require("../models/userModel");
const walletModel = require("../models/walletModel");

const transactionProcessor = async (res, to, amount) => {
  let description = amount < 0 ? "Debit Transaction" : "Credit Transaction";
  // Check if user is admin

  // Check if user exists and populate wallet

  // console.log(to);
  const user = await userModel.findById(to).populate("wallet");
  // console.log(user.wallet);
  if (!user) {
    return res.status(400).json({ error: true, message: "User not found" });
  }

  // Check if balance is sufficient

  if (user.wallet.balance + amount < 0) {
    return res.status(200).json({
      error: false,
      message: "Insufficient balance",
    });
  }

  // Process transaction
  // if (amount > 0) {
  const creditWallet = await creditModel.findOne({ user: user._id });
  await creditModel.findOneAndUpdate(
    { user: user._id },
    { credit: creditWallet.credit + amount }
  );
  // }

  const newTransaction = new Transaction({
    user: to,
    amount: amount,
    description: description,
    balanceRemaining: parseFloat(user.wallet.balance) + parseFloat(amount),
  });
  await newTransaction.save();

  // Update wallet balance

  await walletModel.findByIdAndUpdate(user.wallet._id, {
    balance: user.wallet.balance + amount,
  });

  user.wallet.balance += amount;
  await user.save();

  // Return response

  return res
    .status(201)
    .json({ error: false, message: "Transaction successful" });
};

module.exports = transactionProcessor;
