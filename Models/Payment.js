const mongoose = require("mongoose")

const {Schema} = mongoose;

const PaymentSchema = new Schema({
 accountId:{
  type:mongoose.Schema.Types.ObjectId,
  ref:'account'
 },
 where:{
  type:String,
  require:true
 },
 paidBy:{
  type:String,
  require:true
 },
 date:{
  type:Date,
  default:Date.now
 },
 amount:{
  type:Number,
  require:true
 },
 memberExpenses:{
  type:Array,
  require:true
 }
});

module.exports = mongoose.model('payment',PaymentSchema);