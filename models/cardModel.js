const mongoose = require("mongoose");

const creditCart = new mongoose.Schema(
  {
    cardNumber: {
      type: String,
      required: true,
    },
    expiryYear: {
      type: String,
      required: true,
    },
    expiryMonth: {
      type: String,
      required: true,
    },
    cvv: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const CreditCard = mongoose.model("CreditCard", creditCart);
module.exports = CreditCard;
