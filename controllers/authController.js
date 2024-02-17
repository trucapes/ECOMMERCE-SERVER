// controllers/authController.js

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/userModel");

const JWT_SECRET = "ashdliashkldjnaslkcjlNcilHcoqla8weduoqwscbkjzbxkjbzdhw3hdi";

const createToken = (userId, role) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "15d" });
};

const register = async (req, res) => {
  try {
    const user = await User.findOne({
      $or: [{ email: req.body.email }, { mobileNo: req.body.mobileNo }],
    });

  

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
      userRole: req.body.userRole,
      password: hashedPassword,
    });

    await newUser.save();

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

    res.json({ error: false, message: "Login successful", token }); // Send token in response
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ error: false, message: "Logout successful" });
};

module.exports = { register, login, logout };
