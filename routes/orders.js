const express = require("express");
const {
  getOrders,
  updateOrderStatus,
} = require("../controllers/ordersController");
const authenticateToken = require("../middlewares/authenticateToken");

const router = express.Router();

//Handling a get request by the user

router.get("", authenticateToken, getOrders);
router.post("/update", authenticateToken, updateOrderStatus);

module.exports = router;
