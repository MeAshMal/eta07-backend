const User = require("../models/User");
const { catchAsyncError } = require("../middlewares/catchAsyncError");
const ErrorHandler = require("../utils/errorHandler.js");
const cloudinary = require("cloudinary");
const crypto = require("crypto");

exports.login = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorHandler("No user found", 401));
  }
  const isMatch = await user.passwordCompare(password);
  if (!isMatch) {
    return next(new ErrorHandler("Invalid Credentials", 401));
  }

  const token = await user.generateToken();

  res
    .status(200)
    .cookie("token", token, {
      expires: new Date(Date.now() + 90 * 24 * 60 * 1000),
      httpOnly: true,
    })
    .json({
      success: true,
      user,
      message: "Successfully logged in",
      token,
    });
});

exports.register = catchAsyncError(async (req, res, next) => {
  const {
    name,
    email,
    password,
    phone,
    city,
    state,
    street,
    pincode,
    referralCode,
  } = req.body;
  let user = await User.findOne({ name });
  if (referralCode) {
    const refferedBy = await User.findOne({ referralLink: referralCode });
    if (refferedBy) {
      user.refferedBy = refferedBy._id;
      await user.save();
    }
  }
  if (user) {
    return next(new ErrorHandler("User already exists", 401));
  }
  // const myCloud = await cloudinary.v2.uploader.upload(
  //   req.body.avatar.toString(),
  //   {
  //     folder: "avatars",
  //   }
  // );
  user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: "myCloud.public_id",
      url: "myCloud.url",
    },
    phone,
    address: {
      state,
      city,
      street,
      pincode,
    },
  });
  const token = await user.generateToken();
  res
    .status(200)
    .cookie("token", token, {
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    })
    .json({
      success: true,
      user,
      token,
    });
});

exports.getAllUsers = catchAsyncError(async (req, res, next) => {
  let user = await User.findById(req.user._id);
  if (user.role !== "admin") {
    return next(
      new ErrorHandler(`${user.role} is not allowed see all users`, 400)
    );
  }
  const users = await User.find();
  res.status(200).json({
    success: true,
    users,
  });
});

exports.getLoggedInUserDetails = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new ErrorHandler("Unauthorized", 500));
  }
  res.status(200).json({
    success: true,
    user,
  });
});
exports.logout = catchAsyncError(async (req, res, next) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "Logged out",
    });
});

exports.getMyDetails = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({
    success: true,
    user,
  });
});

exports.addAddress = catchAsyncError(async (req, res, next) => {
  const { street, city, pincode, state } = req.body;
  const user = await User.findById(req.user._id);
  user.address.push({
    city,
    pincode,
    state,
    street,
  });
  await user.save();
  res.status(200).json({
    success: true,
    message: "Address saved",
  });
});

exports.changePassword = catchAsyncError(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);
  const isMatch = await user.passwordCompare(oldPassword);
  if (!isMatch) {
    return next(new ErrorHandler("Invalid Old Password", 402));
  }
  user.password = newPassword;
  await user.save();
  return res.status(200).json({
    success: true,
    message: "Password successfully changed",
  });
});

exports.updateRole = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (user.role === "user") {
    user.role = "admin";
  } else if (user.role === "admin") {
    user.role = "user";
  }
  await user.save();
  res.status(200).json({
    success: true,
    message: "User role updated",
  });
});

exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  // const user = await User.findOne({ email: req.body.email });
  // if (!user) return next(new ErrorHandler("User not found", 404));
  // const resetPasswordToken = await user.getResetPasswordToken();
  // await user.save();
  // const resetUrl = `${req.protocol}://${req.get(
  //   "host"
  // )}/password/reset/${resetPasswordToken}`;
  // const message = `Reset your password by clicking the link below \n\n ${resetUrl}`;
  // try {
  //   await sendEmail({ email: user.email, subject: "Reset Password", message });
  //   res.status(200).json({
  //     success: true,
  //     message: `Email sent to ${user.email}`,
  //   });
  // } catch (error) {
  //   user.resetPasswordExpire = undefined;
  //   user.resetPasswordToken = undefined;
  //   return next(new ErrorHandler(error.message, 500));
  // }
});

exports.resetPassword = catchAsyncError(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken: resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) return next(new ErrorHandler("Invalid token", 401));

  user.password = req.body.password;
  user.resetPasswordExpire = undefined;
  user.resetPasswordToken = undefined;
  await user.save();
  res.status(200).json({
    success: true,
    message: `Password updated`,
  });
});

exports.signinWithSocial = catchAsyncError(async (req, res) => {
  const { name, email, referralCode, imageUrl } = req.body;
  console.log({ imageUrl });
  const user = await User.findOne({ email });
  if (user) {
    const token = await user.generateToken();
    return res
      .status(200)
      .cookie("token", token, {
        expires: new Date(Date.now() + 90 * 24 * 60 * 1000),
        httpOnly: true,
      })
      .json({
        success: true,
        user,
        message: "Successfully logged in",
      });
  } else {
    const userFromName = await User.findOne({ name });
    if (userFromName) {
      const token = await userFromName.generateToken();
      return res
        .status(200)
        .cookie("token", token, {
          expires: new Date(Date.now() + 90 * 24 * 60 * 1000),
          httpOnly: true,
        })
        .json({
          success: true,
          user: userFromName,
          message: "Successfully logged in",
        });
    }
    const user = await User.create({
      name,
      email,
      avatar: {
        url: imageUrl,
      },
    });
    if (referralCode) {
      const refferedBy = await User.findOne({ referralLink: referralCode });
      if (refferedBy) {
        user.refferedBy = refferedBy._id;
        await user.save();
      }
    }
    const token = await user.generateToken();
    return res
      .status(200)
      .cookie("token", token, {
        expires: new Date(Date.now() + 90 * 24 * 60 * 1000),
        httpOnly: true,
      })
      .json({
        success: true,
        user,
        message: "Successfully registered",
      });
  }
});

exports.addFunds = catchAsyncError(async (req, res, next) => {
  const { amount } = req.body;
  const user = await User.findById(req.user._id);
  user.balance += amount;
  await user.save();
  return res.status(200).json({
    success: true,
    message: "Funds added successfully",
  });
});

exports.withdrawFunds = catchAsyncError(async (req, res, next) => {
  const { amount } = req.body;
  const user = await User.findById(req.user._id);
  if (user.balance < amount) {
    return next(new ErrorHandler("Insufficient balance", 400));
  }
  user.balance -= amount;
  await user.save();
  return res.status(200).json({
    success: true,
    message: "Funds withdrawn successfully",
  });
});
