const mongoose = require('mongoose');

const ProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  displayName: String,
  countryCode: String,
  receivePublicly: { type: Boolean, default: true },
  publicAddress: {
    name: String,
    street: String,
    city: String,
    postal: String,
    region: String,
    country: String
  },
  last_given_at: { type: Date, default: new Date(0) }
});

module.exports = mongoose.model('Profile', ProfileSchema);
