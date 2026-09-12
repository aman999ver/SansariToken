const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  localId: { type: String, required: true, trim: true },
  deviceId: { type: String, required: true, trim: true },
  tokenNumber: { type: String, required: true, trim: true },
  templeName: { type: String, required: true, trim: true },
  nepaliDate: { type: String, default: '', trim: true },
  tokenTime: { type: String, default: '', trim: true },
  serviceId: { type: String, required: true, trim: true },
  serviceName: { type: String, required: true, trim: true },
  itemName: { type: String, default: '', trim: true },
  amount: { type: Number, required: true, min: 0 },
  paymentMethod: { type: String, required: true, trim: true },
  createdAtDevice: { type: Date, required: true },
  syncedAt: { type: Date, default: null },
  createdAtServer: { type: Date, default: Date.now }
}, { timestamps: true });

transactionSchema.index({ deviceId: 1, localId: 1 }, { unique: true });
transactionSchema.index({ createdAtDevice: -1 });
transactionSchema.index({ nepaliDate: 1, createdAtDevice: -1 });
transactionSchema.index({ deviceId: 1, createdAtDevice: -1 });
transactionSchema.index({ serviceId: 1, createdAtDevice: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);