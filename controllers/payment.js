const { catchAsyncError } = require("../middlewares/catchAsyncError");
const User = require("../models/User");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
exports.createPaymentIntent = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
  const { amount, typeOfPayment } = req.body;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100,

    currency: "usd",
    automatic_payment_methods: {
      enabled: true,
    },
  });
  console.log({ paymentIntent });
  user.payments.push({
    typeOfPayment,
    quantity: amount,
  });
  await user.save();
  return res.json({
    secret: paymentIntent.client_secret,
    orderId: paymentIntent.id,
    paymentIntent,
  });
});

exports.createPayout = catchAsyncError(async (req, res, next) => {
  const { intent } = req.body;
  // const refund = await stripe.refunds.create({
  //   charge: intent,
  //   amount: 200,
  // });
  // console.log({ refund });
  const paymentIntent = await stripe.paymentIntents.refund({
    intent,
  });
  return res.json({});
});
