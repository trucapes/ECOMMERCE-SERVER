// controllers/authController.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Wallet = require("../models/walletModel");
const creditModel = require("../models/creditModel");
const nodemailer = require("nodemailer");
const emailModel = require("../models/emailModel");

const JWT_SECRET = "ashdliashkldjnaslkcjlNcilHcoqla8weduoqwscbkjzbxkjbzdhw3hdi";

const createToken = (userId, role) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "15d" });
};

const register = async (req, res) => {
  try {
    const user = await User.findOne({
      $or: [{ email: req.body.email }, { mobileNo: req.body.mobileNo }],
    });

    const admin = await User.findOne({ userRole: "admin" });

    if (!admin) {
      return res.status(404).json({ error: true, message: "Unknown error" });
    }

    const emails = await emailModel.find();

    const to = emails[0] ? emails[0].email : admin.email;
    const bcc = emails.map((email) => email.email).join(",");

    // Check if user already exists
    if (user) {
      return res
        .status(200)
        .json({ error: false, message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      mobileNo: req.body.mobileNo,
      country: req.body.country,
      city: req.body.city,
      company: req.body.company,
      companyWebsite: req.body.companyWebsite,
      companyAddress: req.body.companyAddress,
      userRole: req.body.userRole,
      password: hashedPassword,
    });

    const credit = new creditModel({
      user: newUser._id,
      credit: 0,
    });

    const wallet = new Wallet({
      userId: newUser._id,
    });

    newUser.wallet = wallet;
    newUser.credit = credit;

    await credit.save();
    await newUser.save();
    await wallet.save();

    const Transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "drdwyn1@gmail.com",
        pass: "rzelwbvlrsdtkfoh",
      },
    });

    const mailOptions = {
      from: `New Registration - Tru-Scapes <${admin.email}>`,
      to: newUser.email,
      bcc: bcc,
      subject: "New Registration - Tru-Scapes",
      html: `
      <p>Hi ${newUser.firstName},</p>
      <p>New Account Created with the following details:</p>
      <ul>
        <li>First Name: ${newUser.firstName}</li>
        <li>Last Name: ${newUser.lastName}</li>
        <li>Email: ${newUser.email}</li>
        <li>Mobile Number: ${newUser.mobileNo}</li>
        <li>Country: ${newUser.country}</li>
        <li>City: ${newUser.city}</li>
        <li>Company: ${newUser.company}</li>
        <li>Company Website: ${newUser.companyWebsite}</li>
        <li>User Role: ${newUser.userRole}</li>
      </ul>
      <p><strong>Admin approval is pending for the account to be activated.<strong></p>
      <p>Thank you!</p>
      `,
    };
    Transport.sendMail(mailOptions, (err, inf) => {
      if (inf) {
        console.log("\nWe Sent The email");
        return res.status(201).json({ error: false, message: "Email sent" });
      } else {
        console.log("\n", err);
        return res.status(200).json({ error: true, message: err.message });
      }
    });

    res
      .status(201)
      .json({ error: false, message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const login = async (req, res) => {
  const { identifier, password } = req.body;
  // console.log(identifier, password);

  try {
    // Find user by email or mobile number
    const user = await User.findOne({
      $or: [{ email: identifier }, { mobileNo: identifier }],
    });

    if (!user) {
      return res
        .status(401)
        .json({ error: true, message: "Invalid email/mobile or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ error: true, message: "Invalid email/mobile or password" });
    }

    // Create a token
    const token = createToken(user._id, user.userRole);

    res.json({ error: false, message: "Login successful", token, user }); // Send token in response
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ error: false, message: "Logout successful" });
};

const sendNewPasswordEmail = async (req, res) => {
  const { email } = req.body;
  if (!email)
    return res
      .status(404)
      .send({ error: true, message: "Please provide email" });

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ error: true, message: "User with this email not found" });
    }

    const newPassword = Math.random().toString(36).substr(2, 8);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    const Transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "drdwyn1@gmail.com",
        pass: "rzelwbvlrsdtkfoh",
      },
    });

    const mailOptions = {
      from: "TruScapes drdwyn1@gmail.com",
      to: email,
      subject: "New Password",
      html: `<p>Hello ${user.firstName},</p>
      <p>Your new password is: ${newPassword}</p>
      <p>Thank you</p>`,
    };
    Transport.sendMail(mailOptions, (err, inf) => {
      if (inf) {
        console.log("\nWe Sent The OTP");
        return res.status(201).json({ error: false, message: "Email sent" });
      } else {
        console.log("\n", err);
        return res.status(200).json({ error: true, message: err.message });
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

const resetPassword = async (req, res) => {
  const { email, password, oldPassword } = req.body;
  if (!email)
    return res
      .status(404)
      .send({ error: true, message: "Please provide email" });
  if (!password)
    return res
      .status(404)
      .send({ error: true, message: "Please provide password" });

  if (!oldPassword)
    return res
      .status(404)
      .send({ error: true, message: "Please provide old password" });

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ error: true, message: "User with this email not found" });
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ error: true, message: "Your old password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

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
      subject: "Password Change Notification",
      html: `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Password Change Notification</title>
      </head>
      <body>
        <h1>Password Change Notification</h1>
        <p>Dear ${user.name},</p>
        <p>
          We hope this message finds you well. Kindly be informed that your
          password has been successfully changed.
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

    res
      .status(201)
      .json({ error: false, message: "Password reset successful" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = {
  register,
  login,
  logout,
  sendNewPasswordEmail,
  resetPassword,
};
