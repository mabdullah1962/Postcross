const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Profile = require('../models/Profile');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

// Register (simple)
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, displayName, countryCode } = req.body;
    let user = new User({ username, email });
    await user.setPassword(password);
    await user.save();
    const profile = new Profile({ userId: user._id, displayName: displayName||username, countryCode: countryCode||'XX' });
    await profile.save();
    const token = jwt.sign({ id: user._id }, JWT_SECRET);
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// Simple login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await user.validatePassword(password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, JWT_SECRET);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
