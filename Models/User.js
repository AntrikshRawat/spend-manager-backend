const mongoose = require('mongoose');

const {Schema} = mongoose;

const UserSchema = new Schema({
 firstName:{
  type:String,
  require:true
 },
 lastName:{
  type:String,
  default:''
 },
 userName:{
  type:String,
  require:true,
  unique:true
 },
 email:{
  type:String,
  require:true,
  unique:true
 },
 pushSubscription:{
     type:Object,
     default:null
 },
 password:{
  type:String,
  require:true
 }
})

module.exports = mongoose.model('user',UserSchema); 