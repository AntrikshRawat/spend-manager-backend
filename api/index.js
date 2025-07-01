const express = require('express');
const connectToDB = require('../config/database');
const auth = require("../Auth");
const account = require("../Account");
const payment = require("../Payment");
const cors = require('cors');
const cookieParser = require("cookie-parser");
const serverless = require("serverless-http");

const app = express();

app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

let isDBConnected = false;

app.use(async (req, res, next) => {
  try {
    if (!isDBConnected) {
      await connectToDB();
      isDBConnected = true;
      console.log("✅ MongoDB Connected!");
    }
    next(); // ✅ CRITICAL!
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    return res.status(500).json({ message: "DB connection failed" });
  }
});


app.get("/", (req, res) => {
  res.send("hello and welcome to spend-manager-api!");
});

app.use("/auth/v1", auth);
app.use("/account", account);
app.use("/payment", payment);


module.exports = serverless(app);
