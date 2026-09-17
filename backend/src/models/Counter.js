const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  counterId: { type: String, required: true, unique: true, uppercase: true, trim: true },
  counterName: { type: String, required: true, trim: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Counter', counterSchema);
