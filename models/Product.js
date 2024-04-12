const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    file: [
      {
        public_id: String,
        url: String,
      },
    ],
    stock: {
      type: Number,
      required: true,
    },
    oldPrice: {
      type: Number,
      required: false,
      default: 0,
    },
    colors: [
      {
        type: String,
        required: true,
      },
    ],
    sizes: [{ type: String, required: true }],
    price: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", schema);
