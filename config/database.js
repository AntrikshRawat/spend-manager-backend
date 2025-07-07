const mongoose=require('mongoose');
require('dotenv').config();

const connectToDB=async()=>{
 try{
  await mongoose.connect(process.env.MONGO_URI);
 }
 catch(e){
  console.log("Connection Error",e);
 }
}

module.exports = connectToDB;