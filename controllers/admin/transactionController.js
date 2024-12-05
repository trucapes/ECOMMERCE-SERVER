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
      user: "drdwyn1@gmail.com",
      pass: "rzelwbvlrsdtkfoh",
    },
  });

  const mailOptions = {
    from: "TruScapes <no-reply@truscapes.com>",
    to: user.email,
    bcc: bcc,
    subject: "New Wallet Transaction",
    html: `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Document</title>
      </head>
      <body>
        <h1>New Wallet Transaction</h1>
        <p>Dear ${user.name},</p>
        <p>
          We're writing to inform you that a credit transaction of amount $${amount} has been
          detected. We kindly request your prompt attention in settling this
          amount at your earliest convenience.
        </p>
        <p>Thank you for your understanding and cooperation.</p>
        <p>Best regards,</p>
        <p>TruScapes</p>
      </body>
    </html>`,
  };

  await Transport.sendMail(mailOptions)
    .catch((err) => console.log("Error", err))
    .then((res) => console.log(res));

  return transactionProcessor(res, to, amount);
}

module.exports = processTransaction;
