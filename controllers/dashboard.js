const { catchAsyncError } = require("../middlewares/catchAsyncError");
const Order = require("../models/Order");
const ServiceOrder = require("../models/ServiceOrder");
const User = require("../models/User");
const { calculateOrderPercentages } = require("../utils/utils");

exports.getDashboardStats = catchAsyncError(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });
  const serviceOrders = await ServiceOrder.find({ user: req.user._id });
  const user = await User.findById(req.user._id);
  let totalPurchase = 0;
  let totalSaved = user.discountAlotted;
  let productAndServiceOrderPercent = calculateOrderPercentages(
    orders.length,
    serviceOrders.length
  );
  orders.reduce((_, item) => {
    totalPurchase += item.totalPrice;
  });

  let cancelledOrders = {
    length: 0,
    price: 0,
  };
  let returned = {
    length: 0,
    price: 0,
  };
  orders.forEach((item) => {
    if (item.status === "Cancelled") {
      cancelledOrders.length += 1;
      cancelledOrders.price += item.totalPrice;
    }
  });
  orders.forEach((item) => {
    if (item.status === "Cancelled") {
      item.orderItems.forEach((product) => {
        console.log({ product });
        returned.price += product.price * (product.qty || 1);
        returned.length += 1;
      });
    }
  });
  orders.forEach((item) => {
    if (item.status === "Returned") {
      returned.length += 1;
      returned.price += item.totalPrice;
    }
  });
  const stats = {
    totalPurchase,
    totalSaved,
    productAndServiceOrderPercent,
    cancelledOrders,
    returned,
  };

  return res.status(200).json({
    success: true,
    stats,
  });
});
exports.getChartStats = catchAsyncError(async (req, res, next) => {
  let year = new Date().getFullYear();
  let stats = {};
  for (let month = 0; month < 12; month++) {
    const startDate = new Date(year, month, 1); // First day of the month
    const endDate = new Date(year, month + 1, 1); // First day of the next month
    const cancelledCount = await Order.countDocuments({
      user: req.user._id,
      status: "Cancelled",
      createdAt: { $gte: startDate, $lt: endDate },
    });
    const user = await User.findById({ _id: req.user._id });
    const savedCount = 0;
    user.savedProducts.forEach((item) => {
      if (item.dateAdded >= startDate && item.dateAdded < endDate) {
        savedCount += 1;
      }
    });
    const purchasedCount = await Order.countDocuments({
      user: req.user._id,
      createdAt: { $gte: startDate, $lt: endDate },
    });

    // console.log(`Year: ${year}, Month: ${month + 1}`);
    stats[month + 1] = {
      cancelledCount,
      savedCount,
      purchasedCount,
    };
  }
  return res.status(200).json({
    success: true,
    stats,
  });
});

exports.getPayments = catchAsyncError(async (req, res, next) => {
  const user = await User.findById({ _id: req.user._id });

  return res.status(200).json({
    success: true,
    payments: user.payments,
  });
});

exports.getOrdersStats = catchAsyncError(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });
  const serviceOrders = await ServiceOrder.find({ user: req.user._id });

  const data = {
    totalOrders: orders.length + serviceOrders.length,
    productOrders: orders.length,
    serviceOrders: serviceOrders.length,
    couponsUsed: 0,
  };

  let productPayment = 0;
  orders.forEach((item) => {
    productPayment += item.totalPrice;
  });
  let servicePayment = 0;
  serviceOrders.forEach((item) => {
    servicePayment += item.totalPrice;
  });
  const getTotalSpend = {
    productPayment,
    servicePayment,
    membershipCharge: 0,
  };
  let productReturns = [];
  orders.forEach((item) => {
    if (item.status === "Cancelled") {
      productReturns.push(item.orderItems);
    }
  });

  return res.status(200).json({
    success: true,
    data,
    getTotalSpend,
    productReturns,
  });
});
