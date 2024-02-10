// userRoutes.js

const express = require("express");
const router = express.Router();
const UserController = require("../../controllers/admin/userController");

// Route to get all users
router.get("/", UserController.getAllUsers);

// Route to get user by ID or email
router.get("/:identifier", UserController.getUserByIdOrEmail);

// Route to search users by name or email
router.get("/search/:query", UserController.searchUsers);

// Route to delete user by ID
router.delete("/:userId", UserController.deleteUser);

// Route to verify user by ID
router.put("/verify/:userId", UserController.verifyUser);

module.exports = router;
