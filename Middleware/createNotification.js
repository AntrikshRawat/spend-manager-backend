const Notification = require("../Models/Notification");
const {getIO} = require("../socket");

async function createNotification(from,message,relatedAccount,acMembers=[],type) {
   const newNote = await Notification.create({from,to:acMembers,message,relatedAccount});
    const io = getIO();
    acMembers.map((memberId)=>{
      io.to(memberId).emit(`${type}`,newNote);
    })
}

module.exports = createNotification;