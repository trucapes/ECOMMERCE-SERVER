const ordersModel = require("../models/ordersModel");

const getOrders = async (req, res) => {
  try {
    const id = req.query.id;
    console.log(id);
    const orders = await ordersModel.find({ userId: id }).populate("products");

    const products = orders.map((order) => {
      return{
        _id: order._id,
        
      };
    });

    res.status(200).json({ error: false, data: orders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = getOrders;
