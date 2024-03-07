const Transaction = require("../models/transactionModel");
const userModel = require("../models/userModel");

async function getTransactions(req, res) {
  try {
    const transactions = await Transaction.find({ user: req.user.id });

    console.log(transactions);
    return res.status(200).json({
      error: false,
      message: "Transactions fetched successfully",
      data: transactions,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Internal server error",
    });
  }
}

module.exports = {
  getTransactions,
};
