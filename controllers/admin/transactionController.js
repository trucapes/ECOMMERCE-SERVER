const transactionProcessor = require("../../helperFunctions/transactionProcessor");
const Transaction = require("../../models/transactionModel");
const userModel = require("../../models/userModel");
const walletModel = require("../../models/walletModel");

async function processTransaction(req, res) {
  let { from, to, amount } = req.body;

  if (amount[0] == "-") {
    amount = amount.slice(1);
    amount = Number(amount) * -1;
  } else {
    amount = Number(amount);
  }

  if(amount[0] == '-') return res.status(400).json({ error: true, message: "Amount cannot be negative" })

  if (from.userRole !== "admin") {
    return res.status(400).json({ error: true, message: "Unauthorized" });
  }

  return transactionProcessor(res, to, amount);
}

module.exports = processTransaction;
