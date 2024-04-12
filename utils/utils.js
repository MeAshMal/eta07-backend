const Product = require("../models/Product");

exports.calculateOrderPercentages = (productOrders, serviceOrders) => {
  var totalOrders = productOrders + serviceOrders;
  if (totalOrders === 0) {
    return 0 + "% product / " + 0 + "% service";
  }
  var productPercentage = (productOrders / totalOrders) * 100;
  var servicePercentage = (serviceOrders / totalOrders) * 100;
  return (
    productPercentage.toFixed(2) +
    "% product / " +
    servicePercentage.toFixed(2) +
    "% service"
  );
};
