const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const authenticateToken = require("./middlewares/authenticateToken");
const PORT = process.env.PORT || 5000;

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

// connect to the mongodb database
connectDB();

app.get("/", (req, res) => {
  res.send("Hello, we are up and running!");
});

app.use(cookieParser());

// Enable CORS for all routes
app.use(cors());

app.use("/api/items", require("./routes/items"));
app.use("/api/payment", require("./routes/payment"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/admin", authenticateToken, require("./routes/admin/adminRoute"));

app.listen(PORT, console.log("Server is running on port ", PORT));
