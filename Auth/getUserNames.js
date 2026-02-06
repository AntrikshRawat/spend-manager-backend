
// /auth/v1/usernames


const express = require('express');
const User = require('../Models/User');
const Router = express.Router();

Router.post('/', async (req, res) => {
  try {
    const { userIds } = req.body;
    const users = await Promise.all(userIds.map(id => User.findById(id)));
    const userNames = users.filter(Boolean).map(user => user.userName); 
    res.json(userNames);
  } catch (error) {
    console.error('Error finding users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = Router;
