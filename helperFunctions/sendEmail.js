const nodemailer = require("nodemailer");

const sendEmail = async ({ to, bcc, subject, html, text }) => {
  const Transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      //   user: "orders@tru-scapes.com",
      //   pass: "Truscapes2016!",
      user: "drdwyn1@gmail.com",
      pass: "rzelwbvlrsdtkfoh",
    },
  });

  const mailOptions = {
    from: "Tru-Scapes®️ <orders@tru-scapes.com>",
    to,
    bcc,
    subject,
    html,
    text,
  };
  Transport.sendMail(mailOptions, (err, inf) => {
    if (inf) {
      console.log("\nWe Sent The email");
    //   return res.status(201).json({ error: false, message: "Email sent" });
    } else {
      console.log("\n", err);
    //   return res.status(200).json({ error: true, message: err.message });
    }
  });
};

module.exports = sendEmail;
