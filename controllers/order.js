const { catchAsyncError } = require("../middlewares/catchAsyncError");
const Order = require("../models/Order");
const ErrorHandler = require("../utils/errorHandler");
const stripe = require("stripe")(process.env.STRIPE_API_KEY);
const Product = require("../models/Product");
const ServiceOrder = require("../models/ServiceOrder");
const Coupon = require("../models/Coupon");
const User = require("../models/User");

exports.createOrder = catchAsyncError(async (req, res) => {
  const { orderItems, shippingDetails, totalPrice } = req.body;
  const order = await Order.create({
    orderItems,
    shippingDetails,
    totalPrice,
    user: req.user._id,
  });
  const user = await User.findById(req.user._id)
    .select("refferedBy")
    .populate("refferedBy");
  if (user.refferedBy) {
    const refferedBy = await User.findById(user.refferedBy);
    refferedBy.commissions.push({
      name: orderItems[0].title,
      orderId: order._id,
      price: totalPrice * 0.05,
      isProduct: true,
    });
    refferedBy.commissionAmount += totalPrice * 0.05;
    await refferedBy.save();
  }
  res.status(200).json({
    success: true,
    order,
    message: "Order Placed successfully",
  });
});

exports.createPayment = catchAsyncError(async (req, res) => {
  const { orderItems, totalPrice } = req.body;
  const orderData = orderItems.map((item) => {
    return {
      _id: item._id,
      quantity: item.qty,
      title: item.title,
      price: item.price,
      userId: req.user._id,
    };
  });
  const customer = await stripe.customers.create({
    email: req.user.email,
    name: req.user.name,
    metadata: {
      cart: orderData.toString(),
      id: req.user._id,
    },
  });
  const order = new Order({
    totalPrice,
    orderType: "Online",

    user: req.user._id,
  });
  orderItems.forEach((item) => {
    order.orderItems.push({
      title: item.title,
      price: item.price,
      file: { url: item.image },
      qty: item.qty,
      stock: item.stock,
      isVideo: item.video,
      capStyle: item.capStyle,
      _id: item._id,
    });
  });
  await order.save();
  const session = await stripe.checkout.sessions.create({
    shipping_address_collection: {
      allowed_countries: codes,
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: "fixed_amount",
          fixed_amount: {
            amount: totalPrice,
            currency: "usd",
          },
          display_name: "Free shipping",
          // Delivers between 5-7 business days
          delivery_estimate: {
            minimum: {
              unit: "business_day",
              value: 4,
            },
            maximum: {
              unit: "business_day",
              value: 7,
            },
          },
        },
      },
    ],
    line_items: orderItems.map((item) => {
      actualPrice = item.price * 100;
      actualPrice = actualPrice.toFixed(1);
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.title,
            description: item.details,
            metadata: {
              id: item._id,
            },
          },
          unit_amount_decimal: actualPrice,
        },
        quantity: item.qty,
      };
    }),
    customer: customer.id,
    mode: "payment",
    success_url: `${process.env.FRONTEND_URL}/trackorder/${order._id}`,
    cancel_url: `${process.env.FRONTEND_URL}/cart`,
  });
  order.paymentInfo.status = session.payment_status;
  order.paymentInfo.payment_id = session.id;
  await order.save();
  res.json({ url: session.url });
});

exports.processOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ErrorHandler("Order not found", 404));
  }
  if (order.status === "Processing") {
    order.status = "Shipped";
  } else if (order.status === "Shipped") {
    order.status = "Delivered";
  } else {
    return next(new ErrorHandler("Order already delivered", 401));
  }
  order.orderItems.forEach(async (orderItem) => {
    const product = await Product.findById(orderItem._id);
    if (!product) return;
    product.stock = parseInt(product.stock) - orderItem.qty;
    await product.save();
  });
  await order.save();
  return res.status(200).json({
    success: true,
    message: "Order processed successfully",
  });
});

exports.getOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) return next(new ErrorHandler("No order found", 404));

  return res.status(200).json({
    success: true,
    order,
  });
});

exports.getMyOrders = catchAsyncError(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  return res.status(200).json({
    orders,
    success: true,
  });
});

exports.getOrders = catchAsyncError(async (req, res) => {
  const orders = await Order.find().populate("user");
  return res.status(200).json({
    orders,
    success: true,
  });
});

exports.orderService = catchAsyncError(async (req, res, next) => {
  const { userDetails, timeframe, service, totalPrice } = req.body;
  const order = await ServiceOrder.create({
    userDetails,
    timeframe,
    service,
    totalPrice,
  });
  const user = await User.findById(req.user._id)
    .select("refferedBy")
    .populate("refferedBy");
  const refferedBy = await User.findById(user.refferedBy);
  refferedBy.commissions.push({
    name: service.title,
    orderId: order._id,
    price: totalPrice * 0.05,
    isProduct: false,
  });
  refferedBy.commissionAmount += totalPrice * 0.05;
  await refferedBy.save();
  return res.status(200).json({
    success: true,
    order,
    message: "Order placed successfully",
  });
});

exports.applyCoupon = catchAsyncError(async (req, res, next) => {
  const { code, totalPrice } = req.body;
  const coupon = await Coupon.findOne({
    code,
    expiry: {
      $gt: Date.now(),
    },
  });
  const user = await User.findById(req.user._id);

  if (user.appliedCoupons.find((item) => item.code === code)) {
    return next(new ErrorHandler("Coupon code already used", 401));
  }
  if (coupon.used >= coupon.limit) {
    return next(new ErrorHandler("Coupon limit reached", 401));
  }
  if (!coupon) {
    return next(new ErrorHandler("Invalid Coupon code", 401));
  }

  coupon.used += 1;
  await coupon.save();

  const discountedPrice =
    totalPrice - totalPrice * Number("0." + coupon.discount);

  user.discountAlotted += totalPrice - discountedPrice;
  user.appliedCoupons.push({ code });
  user.couponsUsed += 1;
  await user.save();

  return res.status(200).json({
    success: true,
    code: coupon.code,
    discount: totalPrice - discountedPrice,
    discountedPrice,
  });
});

exports.newCoupon = catchAsyncError(async (req, res, next) => {
  const { code, discount, limit, expiry } = req.body;
  const coupon = await Coupon.create({
    code,
    discount,
    limit,
    expiry,
    createdAt: Date.now(),
  });
  return res.status(200).json({
    success: true,
    message: "Coupon created",
    coupon,
  });
});
