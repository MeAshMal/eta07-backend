const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
    },
    timeframe: {
      type: String,
      required: true,
    },
    userDetails: {
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
      dob: {
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
      state: {
        type: String,
        required: true,
      },
      licenseNumber: {
        type: String,
        required: true,
      },
      zip: {
        type: String,
        required: true,
      },
    },
    totalPrice: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServiceOrder", schema);
