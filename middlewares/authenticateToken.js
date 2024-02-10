const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const JWT_SECRET = "ashdliashkldjnaslkcjlNcilHcoqla8weduoqwscbkjzbxkjbzdhw3hdi";

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split("Bearer ")[1];

  // console.log(authHeader);

  if (!token) {
    return res
      .status(401)
      .json({ error: true, message: "Unauthorized: Token missing" });
  }

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
    return res
      .status(403)
      .json({ error: true, message: "Unauthorized: Invalid token" });
  }
};

module.exports = authenticateToken;
