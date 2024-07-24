const Category = require("../models/categoryModel");
const Product = require("../models/productModel");

const getHomeProducts = async (req, res) => {
  try {
    const featuredProducts = await Product.find({})
      .populate("category")
      .sort({ index: -1 })
      .limit(8);
    return res.status(200).json({ error: false, data: featuredProducts });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
};

const getFeaturedProducts = async (req, res) => {
  // console.log("first");
  // const products = await Product.find({}).populate("category");
  try {
    const products = await Product.aggregate([
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      {
        $unwind: "$categoryDetails",
      },
      {
        $sort: { "categoryDetails.index": -1, index: -1 },
      },
      {
        $group: {
          _id: "$categoryDetails._id",
          title: { $first: "$categoryDetails.name" },
          categoryIndex: { $first: "$categoryDetails.index" },
          value: { $push: "$$ROOT" },
        },
      },
      {
        $sort: { categoryIndex: -1 },
      },
      {
        $project: {
          title: 1,
          value: { $slice: ["$value", 8] },
        },
      },
    ]);
    return res.status(200).json({ error: false, data: products });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
};

const getProductsById = async (req, res) => {
  const { productId } = req.params;
  //Check for valid Product Id
  if (productId.length !== 24) {
    return res.status(400).json({ error: true, message: "Invalid product ID" });
  }
  try {
    const response = await Product.findById(productId);
    return res.status(200).json({ error: false, data: response });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
};

const getProductByCategory = async (req, res) => {
  try {
    let { page = 1, limit = 80, category, q } = req.query;
    if (q) {
      return searchProducts(req, res);
    }
    
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    let filter = {};
    let categoryDoc;

    if (category) {
      if (category.length !== 24) {
        category = category[0].toUpperCase() + category.slice(1);
        categoryDoc = await Category.findOne({ name: category }).populate("subcategories");
        
        if (!categoryDoc) {
          return res.status(404).json({ error: true, message: "Category not found" });
        }

        // Include main category and all subcategories
        const categoryIds = [categoryDoc._id, ...categoryDoc.subcategories.map(sub => sub._id)];
        filter.category = { $in: categoryIds };
      } else {
        // If category is an ObjectId, find the category and its subcategories
        categoryDoc = await Category.findById(category).populate("subcategories");
        
        if (!categoryDoc) {
          return res.status(404).json({ error: true, message: "Category not found" });
        }

        const categoryIds = [categoryDoc._id, ...categoryDoc.subcategories.map(sub => sub._id)];
        filter.category = { $in: categoryIds };
      }
    }

    const products = await Product.find(filter)
      .populate("category")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Assuming you want to sort by creation date, newest first

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    return res.json({
      error: false,
      data: {
        name: categoryDoc,
        filter,
        page,
        limit,
        products,
        totalProducts,
        totalPages,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

const searchProducts = async (req, res) => {
  const { q } = req.query;
  try {
    const products = await Product.find({ name: { $regex: q, $options: "i" } });
    return res.status(200).json({ error: false, data: products });
  } catch (error) {
    return res
      .status(500)
      .json({ error: true, message: "Internal Server Error" });
  }
};

module.exports = {
  getFeaturedProducts,
  getHomeProducts,
  getProductsById,
  getProductByCategory,
  searchProducts,
};

/* (filter)
  .populate("category")
  .skip(skip)
  .limit(parseInt(limit))
  .sort(sortOptions); */
