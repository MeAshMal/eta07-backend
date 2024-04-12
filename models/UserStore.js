const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  storeName: {
    type: String,
    required: true,
  },
  storeBanner: {
    public_id: String,
    url: String,
  },
  category: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("UserStore", schema);
