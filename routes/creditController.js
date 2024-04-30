const express = require("express");
const creditModel = require("../models/creditModel");
const router = express.Router();

router.post("", async (req, res) => {
  const { user } = req.body;
  if (user.length !== 24)
    return res.status(400).json({ error: true, data: "Invalid user id" });
  const creditWallet = await creditModel.find({ user: user });

  // console.log(req.body);
  res.json({ error: false, message: creditWallet });
});

module.exports = router;
