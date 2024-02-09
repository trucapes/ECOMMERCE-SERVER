// routes/authRoutes.js

const express = require("express");
const router = express.Router();
const { register, login, logout } = require("../controllers/authController");
const authenticateToken = require("../middlewares/authenticateToken");

// Register route
router.post("/register", register);

// Login route
router.post("/login", login);

// Logout route
router.get("/logout", authenticateToken, logout);

module.exports = router;
