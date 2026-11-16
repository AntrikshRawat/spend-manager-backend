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
 accountType:{
  type:String,
  require:true,
  enum:["shared","personal"]
 },
 accountMembers:{
  type:Array,
  require:true
 }
})

module.exports = mongoose.model('account',AccountSchema);