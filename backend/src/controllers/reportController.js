const Transaction = require('../models/Transaction');
const Device = require('../models/Device');
const env = require('../config/env');
const { sendSuccess } = require('../utils/apiResponse');

function dateMatch(query) {
  const match = {};
  if (query.deviceId && query.deviceId !== 'ALL') match.deviceId = query.deviceId;
  if (query.serviceId && query.serviceId !== 'ALL') match.serviceId = query.serviceId;
  if (query.serviceName && query.serviceName !== 'ALL') match.serviceName = query.serviceName;
  if (query.userName && query.userName !== 'ALL') match.userName = query.userName;
  if (query.paymentMethod && query.paymentMethod !== 'ALL') match.paymentMethod = query.paymentMethod;

  if (query.nepaliDate) {
    match.nepaliDate = query.nepaliDate;
  } else if (query.date) {
    const trimmed = query.date.trim();
    if (/^20\d\d[/-]/.test(trimmed) && (trimmed.startsWith('208') || trimmed.startsWith('207') || trimmed.startsWith('209'))) {
      match.nepaliDate = trimmed.replace(/\//g, '-');
    } else {
      const start = new Date(`${trimmed}T00:00:00.000Z`);
      if (!isNaN(start.getTime())) {
        const end = new Date(start);
        end.setUTCDate(end.getUTCDate() + 1);
        match.createdAtDevice = { $gte: start, $lt: end };
      } else {
        match.nepaliDate = trimmed;
      }
    }
  } else if (query.startDate || query.endDate) {
    match.createdAtDevice = {};
    if (query.startDate) match.createdAtDevice.$gte = new Date(`${query.startDate}T00:00:00.000Z`);
    if (query.endDate) {
      const end = new Date(`${query.endDate}T00:00:00.000Z`);
      end.setUTCDate(end.getUTCDate() + 1);
      match.createdAtDevice.$lt = end;
    }
  }
  return match;
}

async function summary(req, res) {
  const match = dateMatch(req.query);
  const [totals, devices, services] = await Promise.all([
    Transaction.aggregate([{ $match: match }, { $group: { _id: null, tokens: { $sum: 1 }, collection: { $sum: '$amount' } } }]),
    Transaction.aggregate([{ $match: match }, { $group: { _id: '$deviceId', tokens: { $sum: 1 }, collection: { $sum: '$amount' } } }, { $sort: { collection: -1 } }]),
    Transaction.aggregate([{ $match: match }, { $group: { _id: '$serviceName', tokens: { $sum: 1 }, collection: { $sum: '$amount' } } }, { $sort: { collection: -1 } }])
  ]);
  return sendSuccess(res, {
    totals: totals[0] || { tokens: 0, collection: 0 },
    devices: devices.map((d) => ({ deviceId: d._id, tokens: d.tokens, collection: d.collection })),
    services: services.map((s) => ({ serviceName: s._id || 'General', tokens: s.tokens, collection: s.collection }))
  });
}

async function transactions(req, res) {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.min(100, Math.max(1, Number(req.query.limit || 25)));
  const match = dateMatch(req.query);
  const [items, total, summaryTotals, servicesAgg] = await Promise.all([
    Transaction.find(match).sort({ createdAtDevice: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Transaction.countDocuments(match),
    Transaction.aggregate([{ $match: match }, { $group: { _id: null, tokens: { $sum: 1 }, collection: { $sum: '$amount' } } }]),
    Transaction.aggregate([{ $match: match }, { $group: { _id: '$serviceName', tokens: { $sum: 1 }, collection: { $sum: '$amount' } } }, { $sort: { collection: -1 } }])
  ]);
  return sendSuccess(res, {
    transactions: items,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    summary: {
      totals: summaryTotals[0] || { tokens: 0, collection: 0 },
      services: servicesAgg.map((s) => ({ serviceName: s._id || 'General', tokens: s.tokens, collection: s.collection }))
    }
  });
}

async function deviceReport(req, res) { return summary({ ...req, query: { ...req.query, deviceId: req.params.deviceId } }, res); }
async function daily(req, res) { return summary(req, res); }
async function deviceStatus(req, res) {
  const devices = await Device.find().lean();
  const threshold = env.offlineThresholdMinutes * 60 * 1000;
  return sendSuccess(res, {
    devices: devices.map((device) => ({
      ...device,
      online: Boolean(device.lastSyncAt && Date.now() - device.lastSyncAt.getTime() <= threshold)
    }))
  });
}

module.exports = { summary, transactions, deviceReport, daily, deviceStatus };