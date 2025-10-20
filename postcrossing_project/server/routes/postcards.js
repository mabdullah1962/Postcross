const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Profile = require('../models/Profile');
const Counter = require('../models/Counter');
const Postcard = require('../models/Postcard');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

// Simple auth middleware
async function auth(req, res, next){
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).send('Missing auth');
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).send('Invalid token');
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).send('Invalid token');
  }
}

// Request an address to send a postcard
router.post('/request-address', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const cooldownDays = 1; // for demo keep small
    const cutoff = new Date(Date.now() - cooldownDays * 24*60*60*1000);

    // pick a random eligible profile
    const eligible = await Profile.aggregate([
      { 
        $match: { 
          receivePublicly: true,
          userId: { $ne: new mongoose.Types.ObjectId(userId) },
          last_given_at: { $lt: cutoff } 
          } 
        },
        { $sample: { size: 1 } }
      ]);


    if (!eligible || eligible.length === 0) {
      return res.status(503).json({ message: 'No recipients available, try later.' });
    }
    const recipient = eligible[0];
    const country = (recipient.countryCode || 'XX').toUpperCase();

    // increment counter
    const counter = await Counter.findOneAndUpdate({ _id: country }, { $inc: { seq: 1 } }, { upsert: true, new: true });
    const seq = counter.seq;
    const postcardId = `${country}-${seq}`;

    // create postcard
    const pc = await Postcard.create({ postcardId, senderUserId: userId, recipientProfileId: recipient._id, status: 'assigned' });

    // update last_given_at
    await Profile.updateOne({ _id: recipient._id }, { $set: { last_given_at: new Date() } });

    res.json({ postcardId, recipient: recipient.publicAddress });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// mark sent
router.post('/:postcardId/mark-sent', auth, async (req, res) => {
  try {
    const { postcardId } = req.params;
    const pc = await Postcard.findOne({ postcardId });
    if (!pc) return res.status(404).send('Not found');
    if (!pc.senderUserId.equals(req.user._id)) return res.status(403).send('Not your postcard');
    pc.status = 'sent';
    pc.sentAt = new Date();
    pc.audit.push({ action: 'sent', by: req.user._id, at: new Date() });
    await pc.save();
    res.json(pc);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// mark received
router.post('/:postcardId/mark-received', auth, async (req, res) => {
  try {
    const { postcardId } = req.params;
    const pc = await Postcard.findOne({ postcardId });
    if (!pc) return res.status(404).send('Not found');
    // allow recipient's profile owner to confirm
    const recipientProfile = await Profile.findById(pc.recipientProfileId);
    if (!recipientProfile) return res.status(400).send('Recipient profile missing');
    if (!recipientProfile.userId.equals(req.user._id)) return res.status(403).send('Not the recipient');
    pc.status = 'received';
    pc.receivedAt = new Date();
    pc.audit.push({ action: 'received', by: req.user._id, at: new Date() });
    await pc.save();
    res.json(pc);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
