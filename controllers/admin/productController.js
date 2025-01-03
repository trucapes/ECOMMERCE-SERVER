// controllers/admin/productController.js

const Product = require("../../models/productModel");
const { validationResult } = require("express-validator");

const productController = {
  // Create a new product
  createProduct: async (req, res) => {
    try {
      req_product = {
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        price: {
          regular: parseFloat(req.body["price.regular"]),
          distributor: parseFloat(req.body["price.distributor"]),
          dealer: parseFloat(req.body["price.dealer"]),
          contractor: parseFloat(req.body["price.contractor"]),
        },
        discount: {
          distributor: parseInt(req.body["discount.distributor"]),
          dealer: parseInt(req.body["discount.dealer"]),
          contractor: parseInt(req.body["discount.contractor"]),
        },
        salesTax: {
          distributor: parseInt(req.body["salesTax.distributor"]),
          dealer: parseInt(req.body["salesTax.dealer"]),
          contractor: parseInt(req.body["salesTax.contractor"]),
        },
        shippingCost: parseFloat(req.body.shippingCost),
        images: req.body.images,
        stockAvailable: req.body.stockAvailable,
        hotProduct: req.body.hotProduct,
        index: parseInt(req.body.index) || 10000,
        category_index: parseInt(req.body.category_index) || 10000,
        variants: req.body.variants || [], // Handle variants
      };
      const errors = validationResult(req_product);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ error: true, message: "Validation Error", errors: errors });
      }

      const newProduct = new Product(req_product);
      // console.log(req_product)

      await newProduct.save();

      res.status(201).json({
        error: false,
        message: "Product created successfully",
        data: newProduct,
      });
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ error: true, message: "Internal Server Error" });
    }
  },

  // Update an existing product
  updateProduct: async (req, res) => {
    try {
      if (!req.body.name) {
        // Only update the filds that are comming from the frontend
        const updatedProductData = await Product.findByIdAndUpdate(
          req.params.productId,
          { index: req.body.index, category_index: req.body.category_index },
          { new: true }
        );

        // console.log(updatedProductData);

        res.json({
          error: false,
          message: "Product updated successfully",
          data: updatedProductData,
        });
        return;
      }

      req_product = {
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        price: {
          regular: parseFloat(req.body["price.regular"]),
          distributor: parseFloat(req.body["price.distributor"]),
          dealer: parseFloat(req.body["price.dealer"]),
          contractor: parseFloat(req.body["price.contractor"]),
        },
        discount: {
          distributor: parseInt(req.body["discount.distributor"]),
          dealer: parseInt(req.body["discount.dealer"]),
          contractor: parseInt(req.body["discount.contractor"]),
        },
        salesTax: {
          distributor: parseInt(req.body["salesTax.distributor"]),
          dealer: parseInt(req.body["salesTax.dealer"]),
          contractor: parseInt(req.body["salesTax.contractor"]),
        },
        shippingCost: parseFloat(req.body.shippingCost),
        stockAvailable: req.body.stockAvailable,
        hotProduct: req.body.hotProduct,
        index: parseInt(req.body.index),
        category_index: parseInt(req.body.category_index),
        variants: req.body.variants || [],
      };

      if (req.body.images && req.body.images.length > 0) {
        // console.log(req.files)
        req_product.images = req.body.images;
        // console.log(req_product)
      }
      // console.log(req.files)
      const errors = validationResult(req_product);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: true,
          message: "Validation Error",
          errors: errors.array(),
        });
      }

      const updatedProductData = await Product.findByIdAndUpdate(
        req.params.productId,
        req_product,
        {
          new: true, // Return the updated document
          runValidators: true, // Run model validation
        }
      );

      res.json({
        error: false,
        message: "Product updated successfully",
        data: updatedProductData,
      });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ error: true, message: "Internal Server Error" });
    }
  },

  // Get all products
  getAllProducts: async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = "createdAt",
        search,
        category_id,
      } = req.query;

      let filter = {};
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      if (category_id) {
        filter["category"] = category_id;
      }

      const skip = (page - 1) * limit;
      const sortOptions = {};

      if (category_id) {
        sortOptions["category_index"] = -1;
      } else {
        sortOptions[sortBy] = -1;
      }

      const products = await Product.find(filter)
        .populate("category")
        .skip(skip)
        .limit(parseInt(limit))
        .sort(sortOptions);

      const totalCount = await Product.countDocuments(filter);
      const totalPages = Math.ceil(totalCount / limit);
      res.json({ error: false, data: products, totalCount, totalPages });
    } catch (error) {
      console.error("Error getting products:", error);
      res.status(500).json({ error: true, message: "Internal Server Error" });
    }
  },

  // Get a single product by ID
  getProductById: async (req, res) => {
    try {
      const product = await Product.findById(req.params.productId);
      if (!product) {
        return res
          .status(404)
          .json({ error: true, message: "Product not found" });
      }

      res.json({ error: false, data: product });
    } catch (error) {
      console.error("Error getting product by ID:", error);
      res.status(500).json({ error: true, message: "Internal Server Error" });
    }
  },

  // Delete a product
  deleteProduct: async (req, res) => {
    try {
      const product = await Product.findById(req.params.productId);
      if (!product) {
        return res
          .status(404)
          .json({ error: true, message: "Product not found" });
      }

      await product.remove();

      res.json({ error: false, message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: true, message: "Internal Server Error" });
    }
  },
};

module.exports = productController;
