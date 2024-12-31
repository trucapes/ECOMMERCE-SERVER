const mongoose = require("mongoose");

const cardModel = new mongoose.Schema(
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

const CardModel = mongoose.model("CreditCard", cardModel);
module.exports = CardModel;
