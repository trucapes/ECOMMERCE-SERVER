const express = require("express");
const authenticateToken = require("../middlewares/authenticateToken");
const { getTransactions } = require("../controllers/userTransactionController");

const router = express.Router();

router.get("", authenticateToken, getTransactions);

module.exports = router;
