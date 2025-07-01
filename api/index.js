const express = require('express');
const connectToDB = require('../config/database');
const auth = require("../Auth");
const account = require("../Account");
const payment = require("../Payment");
const cors = require('cors');
const cookieParser = require("cookie-parser");


const app = express();
const serverless = require("serverless-http");
app.use(cors({
  origin: ["http://localhost:5173"], 
  credentials: true           
}));


connectToDB();
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application
app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
 res.send('Welcome to spend manager api!');
});

app.use("/auth/v1",auth);
app.use("/account",account);
app.use("/payment",payment);


module.exports.handler = serverless(app);
