const mongoose = require('mongoose');
const env = require('./env');

async function connectDatabase() {
  await mongoose.connect(env.mongoUri);
  console.log('MongoDB connected');
  try {
    const Counter = require('../models/Counter');
    const count = await Counter.countDocuments();
    if (count === 0) {
      await Counter.create({ counterId: 'C1', counterName: 'काउन्टर १', active: true });
    }
  } catch (err) {
    console.error('Default counter init error:', err.message);
  }
}

async function disconnectDatabase() {
  await mongoose.disconnect();
}

module.exports = { connectDatabase, disconnectDatabase };