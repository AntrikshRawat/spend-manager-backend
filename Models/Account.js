const mongoose = require("mongoose");

const {Schema}= mongoose;

const AccountSchema = new Schema({
 accountName:{
  type:String,
  default:"sm-account"
 },
 accountHolder:{
  type:mongoose.Schema.Types.ObjectId,
  ref:'user',
  require:true
 },
 accountMembers:{
  type:Array,
  require:true
 },
 totalTransaction:{
  type:Number,
  default:0
 },
 totalSpend:{
  type:Number,
  default:0
 }
})

module.exports = mongoose.model('account',AccountSchema);