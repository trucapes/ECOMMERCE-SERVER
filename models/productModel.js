const mongoose = require("mongoose");

const { Schema } = mongoose;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // Reference to the Category model
      required: true,
    },
    price: {
      // Regular pricing
      regular: {
        type: Number,
        required: true,
      },
      // Role-based pricing
      distributor: {
        type: Number,
        required: true,
      },
      dealer: {
        type: Number,
        required: true,
      },
      contractor: {
        type: Number,
        required: true,
      },
    },
    discount: {
      // Role-based discount percentage
      distributor: {
        type: Number,
        required: true,
      },
      dealer: {
        type: Number,
        required: true,
      },
      contractor: {
        type: Number,
        required: true,
      },
    },
    salesTax: {
      // Role-based sales tax percentage
      distributor: {
        type: Number,
        required: true,
      },
      dealer: {
        type: Number,
        required: true,
      },
      contractor: {
        type: Number,
        required: true,
      },
    },
    shippingCost: {
      type: Number,
      required: true,
    },
    images: {
      type: Array,
      required: true,
    },
    specifications: {
      // Example: { color: 'Blue', weight: '2.5 kg', ... }
    },
    stockAvailable: {
      type: Boolean,
      default: true,
    },
    hotProduct: {
      type: Boolean,
      default: true,
    },
    index: {
      type: Number,
      default: 1,
    },
    category_index: {
      type: Number,
      default: 10000,
    },
    variants: [
      {
        name: {
          type: String,
          required: true, // Example: 'Small', 'Medium', 'Large'
        },
        additionalPrice: {
          type: Number,
          default: 0, // Price increment/decrement for the variant
        },
      },
    ],
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
