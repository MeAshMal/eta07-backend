const { catchAsyncError } = require("../middlewares/catchAsyncError");
const Product = require("../models/Product");
const ErrorHandler = require("../utils/errorHandler");
const cloudinary = require("cloudinary");
const getDataUri = require("../utils/datauri");
const User = require("../models/User");

exports.createProduct = catchAsyncError(async (req, res, next) => {
  const {
    title,
    details,
    stock,
    category,
    price,
    features,
    file,
    sizes,
    colors,
  } = req.body;
  // const file = req.file;
  // const fileUri = getDataUri(file);
  // let video = false;
  // let myCloud;
  // if (file.mimetype.includes("video")) {
  // const myCloud = await cloudinary.v2.uploader.upload(avatar, {
  // resource_type: "video",
  // });
  //   video = true;
  // } else {
  //   myCloud = await cloudinary.v2.uploader.upload(fileUri.content, {
  //     resource_type: "image",
  //  });
  // }
  const product = await Product.create({
    title,
    details,
    category,
    stock,
    price,
    file,
    features,
    sizes,
    colors,
  });
  res.status(201).json({
    success: true,
    product,
  });
});

exports.getProducts = catchAsyncError(async (req, res) => {
  const products = await Product.find({});

  res.status(200).json({
    success: true,
    products,
  });
});

exports.getProductDetails = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  res.status(200).json({
    success: true,
    product,
  });
});

exports.checkCart = catchAsyncError(async (req, res, next) => {
  const product = await Product.findOne({ price: req.body.price });
  if (!product) {
    return res.status(200).json({
      success: false,
      message: "Cart tempered",
    });
  }
  res.status(200).json({
    success: true,
    product,
    message: "Cart not tempered",
  });
});

exports.getFeaturedProducts = catchAsyncError(async (req, res, next) => {
  const products = await Product.find({
    oldPrice: {
      $gt: 0,
    },
  }).limit(3);
  return res.status(200).json({
    success: true,
    products,
  });
});

exports.deleteProduct = catchAsyncError(async (req, res, next) => {
  await Product.findByIdAndDelete(req.params.id);
  res.status(200).json({
    succes: true,
    message: "Product deleted successfully",
  });
});

exports.updateProduct = catchAsyncError(async (req, res, next) => {
  const { title, price, details, features, stock, category, oldPrice } =
    req.body;
  const product = await Product.findById(req.params.id);

  product.title = title;
  product.details = details;
  product.price = price;
  product.stock = stock;
  product.category = category;
  product.features = features;
  product.oldPrice = oldPrice;

  await product.save();

  res.status(200).json({
    succes: true,
    message: "Product updated successfully",
  });
});

exports.uploadCapStyle = catchAsyncError(async (req, res, next) => {
  const { name } = req.body;
  const file = req.file;
  const fileUri = getDataUri(file);
  const myCloud = await cloudinary.v2.uploader.upload(fileUri.content, {
    resource_type: "image",
  });
  const product = await Product.findById(req.params.id);
  product.capStyles.push({
    icon: {
      public_id: myCloud.public_id,
      url: myCloud.url,
    },
    name,
  });
  await product.save();
  return res.status(200).json({
    success: true,
    message: "Cap style uploaded successfully",
  });
});

exports.addToWishlist = catchAsyncError(async (req, res, next) => {
  const { id } = req.body;
  if (!id) {
    return next(new ErrorHandler("Please provide product id", 400));
  }
  const product = await Product.findById(id);
  if (!product) {
    return next(new ErrorHandler("Product not found", 404));
  }
  const user = await User.findById(req.user._id);
  user.savedProducts.push({
    _id: id,
    dateAdded: Date.now(),
  });
});
