const transactionProcessor = require("../../helperFunctions/transactionProcessor");
const emailModel = require("../../models/emailModel");
const Transaction = require("../../models/transactionModel");
const userModel = require("../../models/userModel");
const walletModel = require("../../models/walletModel");
const nodemailer = require("nodemailer");

async function processTransaction(req, res) {
  let { from, to, amount } = req.body;

  const user = await userModel.findById(to).populate("wallet");
  const emails = await emailModel.find();
  const bcc = emails.map((email) => email.email).join(",");

  if (amount[0] == "-") {
    amount = amount.slice(1);
    amount = Number(amount) * -1;
  } else {
    amount = Number(amount);
  }

  if (amount[0] == "-")
    return res
      .status(400)
      .json({ error: true, message: "Amount cannot be negative" });

  if (from.userRole !== "admin") {
    return res.status(400).json({ error: true, message: "Unauthorized" });
  }

  const Transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "orders@tru-scapes.com",
      pass: "fsrvuyynrofrojew",
    },
  });

  const mailOptions = {
    from: "Tru-Scapes",
    to: user.email,
    bcc: bcc,
    subject: "Your Tru-Scapes® Wallet Has Been Updated",
    html: `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
      </head>
      <body>
        <p><strong>Dear ${user.firstName},</strong></p>
        ${
          amount > 0
            ? "Great news! Your Tru-Scapes® wallet was just Credited with the amount of $" +
              amount +
              "!"
            : "Your Tru-Scapes® wallet was just Debited with the amount of $" +
              amount +
              "!"
        }
        <p>
          <strong>Transaction Details:</strong>
          <ul>
            <li>Transaction Type: ${amount > 0 ? "Credit" : "Debit"}</li>
            <li>Amount: ${amount}</li>
          </ul>
        </p>
        <p>You can review your full transaction history and wallet balance anytime from your Dashboard. <br/>
        If anything looks inccorect or you have questions, we’re always here to help.</p>
        <p>Cheers,</p>
        <p>The Tru-Scapes® Team</p>
      </body>
    </html>`,
  };

  await Transport.sendMail(mailOptions)
    .catch((err) => console.log("Error", err))
    .then((res) => console.log(res));

  return transactionProcessor(res, to, amount);
}

module.exports = processTransaction;
