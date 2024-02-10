const Category = require("../../models/categoryModel");

const CategoryController = {
  // Get all categories with pagination, sorting, and searching
  getAllCategories: async (req, res) => {
    try {
      const { page = 1, limit = 20, sortBy = "createdAt", search } = req.query;

      let filter = {};
      if (search) {
        filter.name = { $regex: search, $options: "i" };
      }

      const skip = (page - 1) * limit;
      const sortOptions = {};
      sortOptions[sortBy] = -1;

      const categories = await Category.find(filter)
        .skip(skip)
        .limit(parseInt(limit))
        .sort(sortOptions);

      const totalCategoriesCount = await Category.countDocuments(filter);
      const totalPages = Math.ceil(totalCategoriesCount / limit);

      res.json({
        success: true,
        data: categories,
        page: page,
        limit: limit,
        totalPages: totalPages,
      });
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  },

  // Create a new category
  createCategory: async (req, res) => {
    try {
      const { name, index } = req.body;
      const image = req.file.path; // Assuming the uploaded image path is stored in req.file.path

      console.log(req.file);

      const newCategory = new Category({
        name,
        index,
        image,
      });

      await newCategory.save();

      res.json({ success: true, message: "Category created successfully" });
    } catch (error) {
      console.error("Error creating category:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },

  // Edit an existing category
  editCategory: async (req, res) => {
    try {
      const { categoryId } = req.params;
      const { name, index } = req.body;

      // Check if the category exists
      const category = await Category.findById(categoryId);
      if (!category) {
        return res
          .status(404)
          .json({ success: false, message: "Category not found" });
      }

      // Update category fields
      if (name) category.name = name;
      if (index) category.index = parseInt(index);

      // Update the category
      await category.save();

      res.json({ success: true, message: "Category updated successfully" });
    } catch (error) {
      console.error("Error editing category:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },

  // Delete a category
  deleteCategory: async (req, res) => {
    try {
      const { categoryId } = req.params;

      // Find and delete the category
      await Category.findByIdAndDelete(categoryId);

      res.json({ success: true, message: "Category deleted successfully" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },
};

module.exports = CategoryController;
