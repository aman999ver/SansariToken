const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true, trim: true },
  deviceName: { type: String, required: true, trim: true },
  active: { type: Boolean, default: true },
  lastSyncAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Device', deviceSchema);