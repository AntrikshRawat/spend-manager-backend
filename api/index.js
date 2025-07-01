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
  origin: "*", 
  credentials: true           
}));

let isDBConnected = false;
app.use(async(req,res,next)=>{
  if(!isDBConnected) {
    await connectToDB();
    isDBConnected = true
  }
  next();
})
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application
app.use(express.json());
app.use(cookieParser());

app.get("/",(req,res)=>{
  res.send("hello and welcome to spend-manager-api!")
})

// app.listen(3000,()=>{
//   console.log("server is running on 3000")
// })

app.use("/auth/v1",auth);
app.use("/account",account);
app.use("/payment",payment);


module.exports = serverless(app);
