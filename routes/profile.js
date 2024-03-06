const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/authenticateToken");
const { getProfile, editProfile } = require("../controllers/profileController");

// Get user profile
router.get("/", authenticateToken, getProfile);

// Edit user profile
router.put("/", authenticateToken, editProfile);

module.exports = router;