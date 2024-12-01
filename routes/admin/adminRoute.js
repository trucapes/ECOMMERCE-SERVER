const express = require("express");
const router = express.Router();
const userRoutes = require("./userRoutes");
const emailModel = require("../../models/emailModel");

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  // Check if user is admin (you may implement your own logic)
  if (req.user && req.user.userRole === "admin") {
    next();
  } else {
    // console.log(req.user);
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
router.use(
  "/repayment",
  require("../../controllers/admin/repaymentController")
);

// Add routes for email notifications and other admin-specific settings
router.post("/email/add", (req, res) => {
  // Implement logic to add an email notification

  const { email } = req.body;

  const newEmail = new emailModel({ email });
  newEmail
    .save()
    .then((email) => {
      res
        .status(201)
        .json({ message: "Email added successfully", data: email });
    })
    .catch((error) => {
      res.status(500).json({ message: "Error adding email", error });
    });
});

router.get("/email", (req, res) => {
  emailModel
    .find()
    .then((emails) => {
      res.status(200).json(emails);
    })
    .catch((error) => {
      res.status(500).json({ message: "Error fetching emails", error });
    });
});

router.delete("/email/:id", async (req, res) => {
  const { id } = req.params;

  const emailCount = await emailModel.find().countDocuments();
  if (emailCount <= 1) {
    return res
      .status(400)
      .json({ message: "Cannot delete last email for notification" });
  }

  emailModel
    .findByIdAndDelete(id)
    .then(() => {
      res.status(200).json({ message: "Email deleted successfully", _id: id });
    })
    .catch((error) => {
      res.status(500).json({ message: "Error deleting email", error });
    });
});

module.exports = router;
