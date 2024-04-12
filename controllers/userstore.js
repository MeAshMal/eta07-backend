const { catchAsyncError } = require("../middlewares/catchAsyncError");
const UserStore = require("../models/UserStore");

exports.createUserStore = catchAsyncError(async (req, res, next) => {
  const { category, email, mobile, storeName, storeBanner } = req.body;
  const userStore = await UserStore.create({
    category,
    email,
    mobile,
    storeName,
    storeBanner,
    owner: req.user._id,
  });
  return res.status(200).json({
    success: true,
    userStore,
    message: "User store created successfully",
  });
});

exports.getMyStore = catchAsyncError(async (req, res, next) => {
  const userStore = await UserStore.findOne({ owner: req.user._id });
  if (!userStore) {
    return next(new ErrorHandler("User store not found", 404));
  }
  return res.status(200).json({
    success: true,
    userStore,
  });
});
