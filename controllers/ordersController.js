const ordersModel = require("../models/ordersModel");

const getOrders = async (req, res) => {
  try {
    const id = req.user._id;
    if (req.user.userRole !== "admin") {
      console.log("second");
      const orders = await ordersModel
        .find({ userId: id })
        .populate("products")
        .sort({ createdAt: -1 });

      res.status(200).json({ error: false, data: orders });
    } else {
      console.log("first");
      const orders = await ordersModel
        .find({})
        .populate("userId")
        .sort({ createdAt: -1 });
      res.status(200).json({ error: false, data: orders });
    }
  } catch (error) {
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    let { id, status } = req.body;
    console.log(status);
    status = status.toLowerCase();
    try {
      if (status === "delivered") {
        const order = await ordersModel.findByIdAndUpdate(id, {
          status: status,
          isDelivered: true,
        });
        return res.status(200).json({ error: false, message: "Order Updated" });
      } else {
        const order = await ordersModel.findByIdAndUpdate(id, {
          status: status,
        });
        return res.status(200).json({ error: false, message: "Order Updated" });
      }
    } catch (error) {
      return res
        .status(500)
        .json({ error: true, message: "Internal Server Error" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
};

module.exports = { getOrders, updateOrderStatus };
