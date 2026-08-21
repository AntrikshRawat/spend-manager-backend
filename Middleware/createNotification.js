const webpush = require("web-push");
const User = require("../Models/User");
const Notification = require("../Models/Notification");
const { getIO } = require("../socket");

async function createNotification(
  from,
  message,
  relatedAccount,
  acMembers = [],
  type = "A",
) {
  const newNote = await Notification.create({
    from,
    to: acMembers,
    message,
    relatedAccount,
  });

  const io = getIO();

  // 2. Loop through all members
  for (const memberId of acMembers) {
    // ---- A) Socket emit ----
    if(type !== "reminder") {
      io.to(memberId).emit(`${type}-update`);
    }
    io.to(memberId).emit(`${type}-notification`, newNote);

    // ---- B) Push notification ---
    const user = await User.findById(memberId);
    if (user?.pushSubscription) {
      try {
        await webpush.sendNotification(
          user.pushSubscription,
          JSON.stringify({
            title:`${type[0].toUpperCase() + type.slice(1)} Notification`,
            body: message,
            url: relatedAccount
              ? `/my-accounts/${relatedAccount}`
              : "/my-accounts",
          }),
        );
      } catch (err) {
        console.error("Push failed for", memberId, err.statusCode || err);
        if (err.statusCode === 410) {
          await User.findByIdAndUpdate(memberId, {
            $unset: { pushSubscription: "" },
          });
        }
      }
    }
  }
}

module.exports = createNotification;
