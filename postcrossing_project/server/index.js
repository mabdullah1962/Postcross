// Minimal Express server for PostCrossing mock
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth');
const postcardsRoutes = require('./routes/postcards');

const app = express();
app.use(bodyParser.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/postcross';
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error', err));

app.use('/api/auth', authRoutes);
app.use('/api/postcards', postcardsRoutes);

const port = process.env.PORT || 3000;
app.listen(port, ()=> console.log('Server listening on port', port));
