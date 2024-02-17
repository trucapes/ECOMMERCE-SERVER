const express = require("express")
const router = express.Router()
const { getCategories } = require("../controllers/publicController");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const JWT_SECRET = "ashdliashkldjnaslkcjlNcilHcoqla8weduoqwscbkjzbxkjbzdhw3hdi";

const getRequestUser = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split("Bearer ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res
        .status(403)
        .json({ error: true, message: "Unauthorized: Invalid token" });
    }

    req.user = user;
    next();
  } catch (error) {
    next();
  }
};

router.use(getRequestUser)

router.get('/categories', getCategories)


module.exports = router