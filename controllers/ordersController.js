const ordersModel = require("../models/ordersModel");

const getOrders = async (req, res) => {
  try {
    const id = req.user._id;
    const orders = await ordersModel.find({ userId: id }).populate("products").sort({ createdAt: -1 });

    res.status(200).json({ error: false, data: orders });
  } catch (error) {
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

module.exports = getOrders;
