const Category = require("../models/categoryModel");
const Product = require("../models/productModel");

// Get user profile
const getCategories = async (req, res) => {
  // console.log("req.headers");
  const reqType = req.headers.for;

  if (reqType === "categories") {
    try {
      const user = await Category.find().sort({ index: -1 });
      res.json({ error: false, data: user });
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: true, message: "Internal Server Error" });
    }
  } else {
    const page = req.query.page;
    const name = req.query.name;
    const skip = 16 * (page - 1);
    const limit = 16 * page;
    let filter = {};
    if (req.query.name) {
      filter.name = req.query.name;
    }
    try {
      const user = await Category.findOne(filter)
        .limit(limit)
        .sort({ index: -1 });

      const products = await Product.find(user._id)
        .populate("category")
        .skip(skip)
        .limit(limit);

      res.json({ error: false, data: products });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ error: true, message: "Internal Server Error" });
    }
  }
};

module.exports = { getCategories };
