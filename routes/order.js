const express = require("express");
const {
  createOrder,
  createPayment,
  processOrder,
  getOrder,
  getMyOrders,
  getOrders,
  orderService,
  applyCoupon,
  newCoupon,
} = require("../controllers/order");
const router = express.Router();
const { isAuthenticated, authorizeAdmin } = require("../middlewares/auth");

router.route("/new").post(isAuthenticated, createOrder);
router.route("/payment/create").post(isAuthenticated, createPayment);
router.route("/process/:id").put(isAuthenticated, authorizeAdmin, processOrder);
router.route("/:id").get(isAuthenticated, getOrder);
router.route("/my").get(isAuthenticated, getMyOrders);
router.route("/all").get(isAuthenticated, authorizeAdmin, getOrders);
router.route("/service").get(isAuthenticated, orderService);
router.route("/apply-coupon").post(isAuthenticated, applyCoupon);
router.route("/new-coupon").post(isAuthenticated, newCoupon);
module.exports = router;
