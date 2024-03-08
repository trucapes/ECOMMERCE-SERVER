const express = require("express");
const getOrders = require("../controllers/ordersController");

const router = express.Router();

router.get("", getOrders);

module.exports = router;
