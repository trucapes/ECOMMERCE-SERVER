const express = require("express");
const {
  getProductsById,
  getProductByCategory,
  getHomeProducts,
  getFeaturedProducts,
} = require("../controllers/productsController");

const router = express.Router();

router.get("/home_featured", getHomeProducts);
router.get("/category_featured", getFeaturedProducts);
router.get("/:productId", getProductsById);
router.get("/", getProductByCategory);

module.exports = router;
