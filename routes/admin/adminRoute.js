// adminRoutes.js

const express = require("express");
const router = express.Router();
const userRoutes = require("./userRoutes");

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  // Check if user is admin (you may implement your own logic)
  if (req.user && req.user.userRole === "admin") {
    next();
  } else {
    console.log(req.user);
    res
      .status(403)
      .json({ error: true, message: "Unauthorized: Admin access only" });
  }
};

// Apply isAdmin middleware to all admin routes
router.use(isAdmin);

// Import routes for authentication, profile, and user management
router.use("/users", userRoutes);
router.use("/category", require("./categoryRoutes"));
router.use("/products", require("./productRoute"));

module.exports = router;
