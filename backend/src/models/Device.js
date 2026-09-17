const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true, uppercase: true, trim: true },
  deviceName: { type: String, required: true, trim: true },
  counterId: { type: String, default: 'C1', uppercase: true, trim: true },
  counterName: { type: String, default: 'काउन्टर १', trim: true },
  active: { type: Boolean, default: true },
  lastSyncAt: { type: Date, default: null }
}, { timestamps: true });

deviceSchema.index({ counterId: 1, active: 1 });

module.exports = mongoose.model('Device', deviceSchema);