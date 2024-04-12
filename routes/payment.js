const router = require("express").Router();
const { createPaymentIntent, createPayout } = require("../controllers/payment");

router.post("/create-intent", createPaymentIntent);
router.post("/create-refund", createPayout);

module.exports = router;
