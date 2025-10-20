// Simple seed script to create sample users and profiles
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Profile = require('./models/Profile');
const Counter = require('./models/Counter');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/postcross';

async function run() {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to mongo for seeding');

  await Promise.all([User.deleteMany({}), Profile.deleteMany({}), Counter.deleteMany({})]);

  const samples = [
    { username:'alice', email:'alice@example.com', password:'password', displayName:'Alice', countryCode:'US' },
    { username:'bob', email:'bob@example.com', password:'password', displayName:'Bob', countryCode:'CL' },
    { username:'carla', email:'carla@example.com', password:'password', displayName:'Carla', countryCode:'CN' },
    { username:'dan', email:'dan@example.com', password:'password', displayName:'Dan', countryCode:'US' },
    { username:'emma', email:'emma@example.com', password:'password', displayName:'Emma', countryCode:'GB' }
  ];

  for (const s of samples) {
    const u = new User({ username: s.username, email: s.email });
    await u.setPassword(s.password);
    await u.save();
    const p = new Profile({
      userId: u._id,
      displayName: s.displayName,
      countryCode: s.countryCode,
      receivePublicly: true,
      publicAddress: {
        name: s.displayName,
        street: '123 Demo St',
        city: 'DemoCity',
        postal: '00000',
        country: s.countryCode
      },
      last_given_at: new Date(0)
    });
    await p.save();
    console.log('Created', s.username);
  }

  // init counters for those countries
  const countries = ['US','CL','CN','GB'];
  for (const c of countries) {
    await Counter.create({ _id: c, seq: Math.floor(Math.random()*1000) });
  }

  console.log('Seeding done');
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
