const Account = require("../Models/Account");

const accountVerification = async(req, res, next) => {
 try{
  const userId = req.userId;
  const {accountId} = req.query;

  const account = await Account.findById(accountId);
  if(!account) {
   return res.status(404).json({message:"No Account Found!"});
  }
  const isUserHaveAccount = account.accountMembers.find(memberId=>memberId===userId);
  if(!isUserHaveAccount) {
   return res.status(401).json({message:"Unauthorized Access! Not Allowed"});
  }
  next();
 }catch(e) {
  res.status(500).json({message:"Internal Application Error."});
 }
}
module.exports = accountVerification;