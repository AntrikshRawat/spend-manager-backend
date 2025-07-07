const mongoose = require("mongoose");

const {Schema} = mongoose;

const NotificationSchema = new Schema({
  from: {
    type: String,
    require:true
   },
  to:{
    type:Array,
    require:true
  },
  message: {
   type: String,
   require:true
  },
  timestamp: {
   type: Date,
   default: Date.now,
   expires: 10 * 24 * 60 * 60 //10 days
  },
  relatedAccount: {
   type: mongoose.Schema.Types.ObjectId,
   ref: "account",
   null:true
  },
})


module.exports = mongoose.model('notification',NotificationSchema);