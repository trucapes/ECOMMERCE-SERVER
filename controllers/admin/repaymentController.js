const router = require("express").Router();
const nodemailer = require("nodemailer");
const fs = require("fs");
const userModel = require("../../models/userModel");

router.post("/sendRequest", async (req, res) => {
  //Destructure the request body
  const { userId } = req.body;
  //Find the user by ID
  try {
    const user = await userModel
      .findById(userId)
      .populate("credit")
      .populate("wallet");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    //Load the email template and replace the placeholders
    let template = fs.readFileSync("emailTemplate/emailTemplate.html", "utf-8");
    console.log(typeof template);
    template = template.replace(/userName/g, user.firstName);
    template = template.replace(/userCreditAmount/g, `$${user.credit.credit}`);
    //Create the mail service
    const Transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "drdwyn1@gmail.com",
        pass: "rzelwbvlrsdtkfoh",
      },
    });
    //Create the mail options
    const mailOptions = {
      from: "Aditya drdwyn1@gmail.com",
      to: user.email,
      subject: "Please Verify Your OTP",
      html: template,
    };
    //Send the mail
    Transport.sendMail(mailOptions, (err, inf) => {
      if (inf) {
        // console.log("\nWe Sent The OTP");
        return res.status(201).json({ error: false });
      } else {
        console.log("\n", err);
        return res.status(200).json({ error: true });
      }
    });
  } catch (error) {
    return res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;
