
// /auth/v1/usernames


const express = require('express');
const User = require('../Models/User');
const Router = express.Router();

Router.post('/', async (req, res) => {
  try {
    const { userIds } = req.body;
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.json([]);
    }
    const users = await User.find({ _id: { $in: userIds } }).select("userName");
    const userMap = new Map(users.map(u => [String(u._id), u.userName]));
    const userNames = userIds.map(id => userMap.get(String(id))).filter(Boolean);
    res.json(userNames);
  } catch (error) {
    console.error('Error finding users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = Router;
