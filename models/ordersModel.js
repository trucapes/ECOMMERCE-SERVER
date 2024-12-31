const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    price: {
      type: Number,
      required: true,
    },
    products: [
      {
        name: {
          type: String,
          required: true,
        },
        imagePath: {
          type: String,
          required: true,
        },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        variant: {
          type: String,
          required: false,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    shippingAddress: {
      addressLine1: {
        type: String,
        required: false,
      },
      addressLine2: {
        type: String,
        required: false,
      },
      city: {
        type: String,
        required: false,
      },
      pincode: {
        type: Number,
        required: false,
      },
    },
    status: {
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      type: String,
      default: "pending",
      required: true,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
