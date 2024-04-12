const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    orderItems: [
      {
        title: {
          type: String,
          required: true,
        },
        price: {
          type: String,
          required: true,
        },
        qty: {
          type: Number,
          required: true,
        },

        _id: {
          type: mongoose.Types.ObjectId,
          ref: "Product",
          required: true,
        },
      },
    ],
    shippingDetails: {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      companyName: {
        type: String,
        required: true,
      },
      floor: {
        type: String,
        required: true,
      },
    },
    paymentInfo: {
      type: Object,
    },
    totalPrice: Number,
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    discount: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered", "Cancelled", "Returned"],
      default: "Processing",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", schema);
