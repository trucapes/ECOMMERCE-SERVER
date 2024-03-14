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
  console.log("first");
  // const products = await Product.find({}).populate("category");
  try {
    const products = await Product.aggregate([
      {
        $lookup: {
          from: "categories", // The name of the collection in your MongoDB database
          localField: "category", // Field in the Product model
          foreignField: "_id", // Field in the Category model
          as: "categoryDetails", // Name of the field to store the category details
        },
      },
      {
        $unwind: "$categoryDetails", // Deconstruct the array produced by the $lookup stage
      },
      {
        $sort: { index: -1 },
      },
      {
        $group: {
          _id: "$categoryDetails._id", // Group by category ObjectId
          title: { $first: "$categoryDetails.name" }, // Assuming category name is stored in 'name' field
          value: { $push: "$$ROOT" }, // Store products belonging to each category
        },
      },
      {
        $project: {
          title: "$title",
          value: { $slice: ["$value", 8] }, // Retrieve top 8 products for each category
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
  //Destructuring the query parameters

  try {
    let { page = 1, limit = 20, category } = req.query;
    let filter = {};
    const skip = (page - 1) * limit;

    let categoryDoc; //Variable to store category document
    if (category && category.length !== 24) {
      category = category[0].toUpperCase() + category.slice(1); //Converting category name to Title case
      console.log(category);
      //   console.log(page, limit, category);

      //Finding category document based on category name
      categoryDoc = await Category.findOne({ name: category });
      filter.category = categoryDoc._id;
      console.log(categoryDoc);
    } else if (category) {
      filter.category = category;
    }

    //Finding products based on category document also applying pagination
    const products = await Product.find(filter)
      .populate("category")
      .skip(skip)
      .limit(parseInt(limit));

    return res.json({
      error: false,
      data: { name: categoryDoc, page, limit, filter, products },
    });
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
};

/* (filter)
  .populate("category")
  .skip(skip)
  .limit(parseInt(limit))
  .sort(sortOptions); */
