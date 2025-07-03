
// /auth/filter


const express = require('express');
const User = require('../Models/User');
const Router = express.Router();

Router.get('/', async (req, res) => {
  try {
    const searchQuery = req.query.search || '';
    const regex = new RegExp(`^${searchQuery}`, 'i'); 
    const users = await User.find({ userName: regex }).select('_id userName');
    res.json({ users });
  } catch (error) {
    console.error('Error filtering users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = Router;
