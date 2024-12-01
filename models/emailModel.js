const mongoose = require("mongoose");

const emailNotificationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("EmailNotiffication", emailNotificationSchema);
