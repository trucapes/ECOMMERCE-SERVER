const express = require("express");
const router = express.Router();
const {
  initializePayment,
  verifyPayment,
  payCreditBalance,
} = require("../controllers/paymentController");

// initialize payment endpoint
router.post("/", initializePayment);
router.get("/", (req, res) => {
  res.send("Server is up and running");
});

router.post("/payCredit", payCreditBalance);

module.exports = router;
