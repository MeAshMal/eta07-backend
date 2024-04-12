require("dotenv").config();
const express = require("express");
const router = express.Router();
const { isAuthenticated, authorizeAdmin } = require("../middlewares/auth");
const {
  createProduct,
  getProducts,
  getProductDetails,
  checkCart,
  getFeaturedProducts,
  deleteProduct,
  updateProduct,
  uploadCapStyle,
  addToWishlist,
} = require("../controllers/product");

router.route("/new").post(isAuthenticated, authorizeAdmin, createProduct);
router.route("/all").get(getProducts);
router
  .route("/:id")
  .get(getProductDetails)
  .delete(isAuthenticated, authorizeAdmin, deleteProduct)
  .put(isAuthenticated, authorizeAdmin, updateProduct);
router.route("/checkcart").post(checkCart);
router.route("/featuredProducts").get(getFeaturedProducts);
router
  .route("/upload/cap/:id")
  .put(isAuthenticated, authorizeAdmin, uploadCapStyle);
router.post("/add-to-wishlist", isAuthenticated, addToWishlist);

module.exports = router;
