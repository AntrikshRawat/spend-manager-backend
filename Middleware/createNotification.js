const Notification = require("../Models/Notification");
const {getIO} = require("../socket");

async function createNotification(from,message,relatedAccount,acMembers=[],type) {
   const newNote = await Notification.create({from,to:acMembers,message,relatedAccount});
    const io = getIO();
    acMembers.map((memberId)=>{
      io.to(memberId).emit(`${type}-update`);
      io.to(memberId).emit(`${type}-notification`,newNote);
    })
}

module.exports = createNotification;