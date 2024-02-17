const Category = require("../models/categoryModel");

// Get user profile
const getCategories = async (req, res) => {
  try {
    const user = await Category.find().sort("-index");
    res.json({ error: false, data: user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};



module.exports = { getCategories };
