const express = require('express');
const connectToDB = require('./config/database');
const auth = require("./Auth");
const account = require("./Account");
const payment = require("./Payment");
const cors = require('cors');
const cookieParser = require("cookie-parser");
const http = require("http");
const socket = require("./socket");
const verifyUser = require('./Middleware/verifyUser');
const Notification = require('./Models/Notification');

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: ["https://spend-manager-f.vercel.app","http://localhost:5173"], 
  credentials: true       
}));
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application
app.use(express.json());
app.use(cookieParser());


connectToDB().then(() => {
  console.log('✅ MongoDB Connected');
  server.listen(3000, () => {
    console.log(`🚀 Server running on port ${3000}`);
  });
  socket.init(server);
}).catch((err) => {
  console.error('❌ MongoDB connection failed:', err);
  process.exit(1);
});


app.get("/",(req,res)=>{
  res.send("hello and welcome to spend-manager-api!")
})

app.get("/notifications",verifyUser,async(req,res)=>{
  try{
    const uId = req.userId;
    const allNotifications = await Notification.find({ to: uId }).sort({ timestamp: -1 });
    res.json(allNotifications);
  }catch(err) {
    res.status(505).json({message:"Internal Server Error!"});
  }
})



app.use("/auth/v1",auth);
app.use("/account",account);
app.use("/payment",payment);