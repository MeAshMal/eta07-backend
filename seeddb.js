const mongoose = require("mongoose");
(async () => {
  try {
    const conn = await mongoose.connect("mongodb://0.0.0.0:27017/", {
      dbName: "ETA07",
    });
    console.log("Db connected", conn.connection.host);
  } catch (error) {
    console.log(`Db connection error ${error}`);
  }
})();

const coupon = require("./models/Coupon");

coupon
  .findByIdAndUpdate(
    "660b2307770d4f87de8d3dd6",
    {
      expiry: new Date("4/3/2024"),
    },
    { new: true }
  )
  .then((r) => {
    console.log("done" + r);
  })
  .catch((e) => console.log(e));
