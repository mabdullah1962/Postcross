const mongoose = require('mongoose');

const PostcardSchema = new mongoose.Schema({
  postcardId: { type: String, unique: true, index: true },
  senderUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  recipientProfileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
  status: { type: String, enum: ['assigned','sent','in_transit','received','cancelled'], default: 'assigned' },
  createdAt: { type: Date, default: Date.now },
  sentAt: Date,
  receivedAt: Date,
  message: String,
  audit: [{ action: String, by: mongoose.Schema.Types.ObjectId, at: Date }]
});

module.exports = mongoose.model('Postcard', PostcardSchema);
