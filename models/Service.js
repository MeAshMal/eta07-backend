const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  details: {
    type: String,
    required: true,
  },
  features: [
    {
      type: String,
      required: true,
    },
  ],
  type: {
    type: String,
    required: true,
  },
  file: [
    {
      public_id: String,
      url: String,
      isVideo: Boolean,
    },
  ],
  price: {
    type: Number,
    required: true,
  },
  yearlyPrice: Number,
});

module.exports = mongoose.model("Service", schema);
