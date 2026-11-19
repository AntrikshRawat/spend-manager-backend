const mongoose = require("mongoose");
const webpush = require("web-push");
const User = require("../Models/User");
const Notification = require("../Models/Notification");
const { getIO } = require("../socket");

async function sendPush(memberId, subscription, payload) {
  try {
    await webpush.sendNotification(subscription, payload, {
      TTL: 60 * 60 * 24, // keep trying for a day if the device is offline
      urgency: "high", // don't let mobile OSes batch/delay it
    });
  } catch (err) {
    console.error("Push failed for", memberId, err.statusCode || err);
    // 404/410 = the browser says this subscription is gone for good.
    if (err.statusCode === 404 || err.statusCode === 410) {
      await User.findByIdAndUpdate(memberId, {
        $unset: { pushSubscription: "" },
      });
    }
  }
}

// Never throws: a notification problem must not turn an already-saved
// payment/account change into a 500 for the caller.
async function createNotification(
  from,
  message,
  relatedAccount,
  acMembers = [],
  type = "A",
) {
  try {
    const recipients = [...new Set(acMembers.map(String))].filter((id) =>
      mongoose.isValidObjectId(id),
    );
    if (recipients.length === 0) return null;

    const newNote = await Notification.create({
      from,
      to: recipients,
      message,
      relatedAccount,
    });

    // ---- A) Socket (in-app) ----
    let io = null;
    try {
      io = getIO();
    } catch (err) {
      console.error("Socket unavailable:", err.message);
    }
    if (io) {
      for (const memberId of recipients) {
        if (type !== "reminder") {
          io.to(memberId).emit(`${type}-update`);
        }
        io.to(memberId).emit(`${type}-notification`, newNote);
      }
    }

    // ---- B) Web push (app closed / background) ----
    const users = await User.find({ _id: { $in: recipients } }).select(
      "pushSubscription",
    );
    const payload = JSON.stringify({
      title: `${type[0].toUpperCase() + type.slice(1)} Notification`,
      body: message,
      url: relatedAccount ? `/my-accounts/${relatedAccount}` : "/my-accounts",
    });

    await Promise.allSettled(
      users
        .filter((u) => u.pushSubscription)
        .map((u) => sendPush(String(u._id), u.pushSubscription, payload)),
    );

    return newNote;
  } catch (err) {
    console.error("createNotification failed:", err);
    return null;
  }
}

module.exports = createNotification;
