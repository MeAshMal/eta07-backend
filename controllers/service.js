const { catchAsyncError } = require("../middlewares/catchAsyncError");
const Service = require("../models/Service");

exports.getServices = catchAsyncError(async (req, res, next) => {
  const services = await Service.find();
  return res.status(200).json({
    success: true,
    services,
  });
});

exports.createService = catchAsyncError(async (req, res, next) => {
  const { title, details, features, file, type, price } = req.body;
  const service = await Service.create({
    details,
    features,
    type,
    price,
    title,
    file,
  });
  return res.status(200).json({
    success: true,
    service,
  });
});

exports.getService = catchAsyncError(async (req, res, next) => {
  const service = await Service.findById(req.params.id);
  return res.status(200).json({
    success: true,
    service,
  });
});
