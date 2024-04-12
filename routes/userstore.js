const { isAuthenticated } = require("../middlewares/auth");

const router = require("express").Router();
const { createUserStore, getMyStore } = require("../controllers/userstore");

router.post("/create", isAuthenticated, createUserStore);
router.post("/my", isAuthenticated, getMyStore);

module.exports = router;
