const mongoose = require('mongoose');
const env = require('./env');

async function connectDatabase() {
  await mongoose.connect(env.mongoUri);
  console.log('MongoDB connected');
  try {
    const Counter = require('../models/Counter');
    const Device = require('../models/Device');
    let firstCounter = await Counter.findOne().sort({ counterId: 1 });
    if (!firstCounter) {
      firstCounter = await Counter.create({ counterId: 'C1', counterName: 'Counter 1', active: true });
    }
    // Automatically link any legacy devices that don't have counterId
    await Device.updateMany(
      { $or: [{ counterId: { $exists: false } }, { counterId: null }, { counterId: '' }] },
      { $set: { counterId: firstCounter.counterId, counterName: firstCounter.counterName } }
    );
  } catch (err) {
    console.error('Default counter/device init error:', err.message);
  }
}

async function disconnectDatabase() {
  await mongoose.disconnect();
}

module.exports = { connectDatabase, disconnectDatabase };