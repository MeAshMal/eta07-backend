const express = require("express");
const cors = require("cors");
const errorMiddleware = require("./middlewares/Error");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const { v2: cloudinary } = require("cloudinary");
const fileupload = require("express-fileupload");
const morgan = require("morgan");
const path = require("path");

const app = express();

(async () => {
  try {
    const conn = await mongoose.connect(
      "mongodb+srv://asharmallick:ashar@cluster0.1hsiqy4.mongodb.net/?retryWrites=true&w=majority",
      {
        dbName: "ETA07",
      }
    );
    console.log("Db connected", conn.connection.host);
  } catch (error) {
    console.log(`Db connection error ${error}`);
  }
})();

app.use(cors({ origin: "https://www.eta07.com", credentials: true }));
app.use(express.json());
app.use(morgan("tiny"));
app.use(fileupload({ useTempFiles: true }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

cloudinary.config({
  cloud_name: "dto9hgjgs",
  api_key: "263287543194193",
  api_secret: "wCet2_ild7fRo7Of_iCERRBPU8k",
});
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/v1/payment", require("./routes/payment"));
app.use("/api/v1/product", require("./routes/product"));
app.use("/api/v1/service", require("./routes/service"));
app.use("/api/v1/order", require("./routes/order"));
app.use("/api/v1/auth", require("./routes/user"));
app.use("/api/v1/dashboard", require("./routes/dashboard"));
app.use("/api/v1/userstore", require("./routes/userstore"));

// app.use(express.static(path.join(__dirname, "../frontend/dist")));
// app.get("*", (_, res) => {
//   res.sendFile(path.resolve(__dirname, "../frontend/dist/index.html"));
// });
app.listen(3000, () => {
  console.log("Listening on port 3000");
});

app.use(errorMiddleware);
