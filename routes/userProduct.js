const express = require("express");
const {
  getFeaturedProducts,
  getProductsById,
  getProductByCategory,
} = require("../controllers/productsController");

const router = express.Router();

router.get("/featured", getFeaturedProducts);
router.get("/:productId", getProductsById);
router.get("/", getProductByCategory);

module.exports = router;
