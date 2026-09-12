const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 }
}, { _id: true });

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, default: '', trim: true },
  price: { type: Number, min: 0, default: null },
  active: { type: Boolean, default: true },
  options: { type: [optionSchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);