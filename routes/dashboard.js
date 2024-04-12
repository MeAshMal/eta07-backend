const {
  getDashboardStats,
  getChartStats,
  getPayments,
  getOrdersStats,
} = require("../controllers/dashboard");
const { isAuthenticated } = require("../middlewares/auth");

const router = require("express").Router();

router.get("/dashboard-stats", isAuthenticated, getDashboardStats);
router.get("/chart-stats", isAuthenticated, getChartStats);
router.get("/payments", isAuthenticated, getPayments);
router.get("/get-orders-stats", isAuthenticated, getOrdersStats);

module.exports = router;
