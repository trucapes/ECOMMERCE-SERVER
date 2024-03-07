const Transaction = require("../../models/transactionModel");
const userModel = require("../../models/userModel");
const walletModel = require("../../models/walletModel");

async function processTransaction(req, res) {
  const { from, to, amount } = req.body;
  let description;
  // Check if user is admin

  if (from.userRole !== "admin") {
    return res.status(400).json({ error: true, message: "Unauthorized" });
  }

  // Check if user exists and populate wallet

  // console.log(to);
  const user = await userModel.findById(to).populate("wallet");
  // console.log(user.wallet);
  if (!user) {
    return res.status(400).json({ error: true, message: "User not found" });
  }

  // Check if balance is sufficient

  if (user.wallet.balance + amount < 0) {
    return res.status(400).json({
      error: false,
      message: "Insufficient balance",
    });
  }

  // Process transaction

  amount < 0
    ? (description = "Debit Transaction")
    : (description = "Credit Transaction");

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
}

module.exports = processTransaction;
