const express = require("express");
const getOrders = require("../controllers/ordersController");
const authenticateToken = require("../middlewares/authenticateToken");

const router = express.Router();

router.get("",authenticateToken, getOrders);

module.exports = router;
