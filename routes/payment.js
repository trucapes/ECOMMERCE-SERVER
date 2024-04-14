const express = require("express");
const router = express.Router();
const {
  initializePayment,
  verifyPayment,
  payCreditBalance,
} = require("../controllers/paymentController");

// initialize payment endpoint
router.post("/", initializePayment);

router.post("/payCredit", payCreditBalance);

module.exports = router;
