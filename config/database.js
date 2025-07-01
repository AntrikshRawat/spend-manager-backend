const mongoose=require('mongoose');
require('dotenv').config();
const mongoURI = process.env.MONGO_URI;

const connectToDB=async()=>{
 try{
  await mongoose.connect(mongoURI);
  console.log("Connected to Database");
 }
 catch(e){
  console.log("Connection Error",e);
 }
}

module.exports = connectToDB;