const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      "mongodb+srv://truscapeslighting:tuscikde@cluster0.a0kvj.mongodb.net/"
    );
    console.log("Mongo DB Connected: ", conn.connection.host);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

module.exports = connectDB;
//
//mongodb://localhost:27017
