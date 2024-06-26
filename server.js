const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const authenticateToken = require("./middlewares/authenticateToken");
const PORT = process.env.PORT || 5003;

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
app.use("/api/payment", authenticateToken, require("./routes/payment"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/admin", authenticateToken, require("./routes/admin/adminRoute"));
app.use("/api/transaction", require("./routes/admin/transactionRoute"));
app.use("/api/get_transactions", require("./routes/userTransaction"));
app.use("/api/public", require("./routes/public"));
app.use("/api/order", require("./routes/orders"));
app.use("/api/products", require("./routes/userProduct"));
app.use("/api/credit", require("./routes/creditController"));

app.listen(PORT, console.log("Server is running on port ", PORT));
