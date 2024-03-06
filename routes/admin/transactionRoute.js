const express = require("express");
const processTransaction = require("../../controllers/admin/transactionController");

const router = express.Router();

router.post("", processTransaction);

module.exports = router;
