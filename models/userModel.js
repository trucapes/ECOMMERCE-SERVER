const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (v) {
          // Regular expression for email validation
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    mobileNo: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      default: "",
    },
    companyWebsite: {
      type: String,
      default: "",
    },
    companyAddress: {
      type: String,
      default: "",
    },
    userRole: {
      type: String,
      enum: ["distributor", "dealer", "contractor", "admin"],
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isPending: {
      type: Boolean,
      default: true,
    },
    orders: [
      {
        type: Boolean,
        default: false,
      },
    ],
    credit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Credit",
      default: null,
    },
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
