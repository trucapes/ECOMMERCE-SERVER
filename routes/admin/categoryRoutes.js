const express = require("express");
const router = express.Router();
const CategoryController = require("../../controllers/admin/categoryController");
const upload = require("../../middlewares/upload");

// Route to get all categories with pagination, sorting, and searching
router.get("/", CategoryController.getAllCategories);

// Route to create a new category
router.post("/", upload.single("image"), CategoryController.createCategory);

// Route to edit an existing category
router.put(
  "/:categoryId",
  upload.single("image"),
  CategoryController.editCategory
);

// Route to delete a category
router.delete("/:categoryId", CategoryController.deleteCategory);

module.exports = router;
