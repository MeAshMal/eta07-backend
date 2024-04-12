const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: String,

  password: String,
  avatar: {
    public_id: String,
    url: String,
  },
  role: {
    type: String,
    enum: ["user", "admin", "agent"],
    default: "user",
  },
  referralLink: String,
  refferedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  membershipType: {
    type: String,
    enum: ["Free", "Starter", "Advanced", "Pro"],
    default: "Free",
  },
  membershipTimeFrame: {
    type: String,
    enum: ["Monthly", "Yearly"],
    required: false,
  },
  phone: {
    type: String,
  },

  address: [
    {
      state: String,
      city: String,
      street: String,
      pincode: String,
    },
  ],
  paymentInformation: {
    creditCard: String,
    visa: String,
    masterCard: String,
  },
  discountAlotted: {
    type: Number,
    default: 0,
  },
  payments: [
    {
      typeOfPayment: {
        type: String,
      },
      quantity: {
        type: Number,
      },
      Date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  couponsUsed: {
    type: Number,
    default: 0,
  },
  balance: {
    type: Number,
    default: 0,
  },
  savedProducts: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      dateAdded: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  commissions: [
    {
      name: String,
      orderId: String,
      price: Number,
      isProduct: Boolean,
    },
  ],
  commissionAmount: {
    type: Number,
    default: 0,
  },
  appliedCoupons: [
    {
      code: {
        type: String,
        unique: true,
      },
    },
  ],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

schema.methods.generateToken = async function () {
  console.log({ secret: process.env.JWT_SECRET });
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET);
};

schema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

schema.methods.passwordCompare = async function (password) {
  if (this.password) {
    return await bcrypt.compare(password, this.password);
  }
  return false;
};

schema.methods.getResetPasswordToken = async function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model("User", schema);
