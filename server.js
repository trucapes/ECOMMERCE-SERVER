const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 5000;

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

// connect to the mongodb database
connectDB();

// Add cors
var whitelist = ["http://localhost:3000"];
// Configure CORS middleware with credentials support
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Enable credentials support
};

app.get("/", (req, res) => {
  res.send("Hello, we are up and running!");
});

app.use(cookieParser());

// Enable CORS for all routes
app.use(cors(corsOptions));

app.use("/api/items", require("./routes/items"));
app.use("/api/payment", require("./routes/payment"));
app.use("/api/auth", require("./routes/auth"));

app.listen(PORT, console.log("Server is running on port ", PORT));
