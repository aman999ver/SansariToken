const Transaction = require('../models/Transaction');
const Device = require('../models/Device');
const env = require('../config/env');
const { sendSuccess } = require('../utils/apiResponse');

function dateMatch(query) {
  const match = {};
  if (query.deviceId) match.deviceId = query.deviceId;
  if (query.serviceId) match.serviceId = query.serviceId;
  if (query.paymentMethod) match.paymentMethod = query.paymentMethod;
  if (query.date) { const start = new Date(`${query.date}T00:00:00.000Z`); const end = new Date(start); end.setUTCDate(end.getUTCDate() + 1); match.createdAtDevice = { $gte: start, $lt: end }; }
  else if (query.startDate || query.endDate) { match.createdAtDevice = {}; if (query.startDate) match.createdAtDevice.$gte = new Date(`${query.startDate}T00:00:00.000Z`); if (query.endDate) { const end = new Date(`${query.endDate}T00:00:00.000Z`); end.setUTCDate(end.getUTCDate() + 1); match.createdAtDevice.$lt = end; } }
  return match;
}

async function summary(req, res) {
  const match = dateMatch(req.query);
  const [totals, devices] = await Promise.all([
    Transaction.aggregate([{ $match: match }, { $group: { _id: null, tokens: { $sum: 1 }, collection: { $sum: '$amount' } } }]),
    Transaction.aggregate([{ $match: match }, { $group: { _id: '$deviceId', tokens: { $sum: 1 }, collection: { $sum: '$amount' } } }, { $sort: { _id: 1 } }])
  ]);
  return sendSuccess(res, { totals: totals[0] || { tokens: 0, collection: 0 }, devices });
}

async function transactions(req, res) {
  const page = Math.max(1, Number(req.query.page || 1)); const limit = Math.min(100, Math.max(1, Number(req.query.limit || 25))); const match = dateMatch(req.query);
  const [items, total] = await Promise.all([Transaction.find(match).sort({ createdAtDevice: -1 }).skip((page - 1) * limit).limit(limit).lean(), Transaction.countDocuments(match)]);
  return sendSuccess(res, { transactions: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}

async function deviceReport(req, res) { return summary({ ...req, query: { ...req.query, deviceId: req.params.deviceId } }, res); }
async function daily(req, res) { return summary(req, res); }
async function deviceStatus(req, res) { const devices = await Device.find().lean(); const threshold = env.offlineThresholdMinutes * 60 * 1000; return sendSuccess(res, { devices: devices.map((device) => ({ ...device, online: Boolean(device.lastSyncAt && Date.now() - device.lastSyncAt.getTime() <= threshold) })) }); }

module.exports = { summary, transactions, deviceReport, daily, deviceStatus };