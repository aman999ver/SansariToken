const Transaction = require('../models/Transaction');
const Device = require('../models/Device');
const User = require('../models/User');
const env = require('../config/env');
const { sendSuccess } = require('../utils/apiResponse');

const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

function toEnglishDigits(str) {
  return str.replace(/[०-९]/g, (d) => String(nepaliDigits.indexOf(d)));
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildNepaliDatePattern(input) {
  const clean = input.trim();
  const parts = clean.split(/[/\\-]/).map((p) => p.trim()).filter(Boolean);
  if (parts.length > 1) {
    return '^' + parts.map((part, index) => {
      const eng = toEnglishDigits(part);
      if (index > 0 && eng.length <= 2) {
        const val = Number(eng);
        if (!isNaN(val)) {
          if (val < 10) {
            return `[0०]?[${val}${nepaliDigits[val]}]`;
          }
          const d1 = Math.floor(val / 10);
          const d2 = val % 10;
          return `[${d1}${nepaliDigits[d1]}][${d2}${nepaliDigits[d2]}]`;
        }
      }
      return Array.from(part).map((ch) => {
        if (/[0-9]/.test(ch)) {
          const idx = Number(ch);
          return `[${idx}${nepaliDigits[idx]}]`;
        }
        if (/[०-९]/.test(ch)) {
          const idx = nepaliDigits.indexOf(ch);
          return `[${idx}${ch}]`;
        }
        return ch.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      }).join('');
    }).join('[/\\-]');
  }

  let pattern = '^';
  for (const ch of clean) {
    if (/[0-9]/.test(ch)) {
      const idx = Number(ch);
      pattern += `[${idx}${nepaliDigits[idx]}]`;
    } else if (/[०-९]/.test(ch)) {
      const idx = nepaliDigits.indexOf(ch);
      pattern += `[${idx}${ch}]`;
    } else if (ch === '/' || ch === '-') {
      pattern += '[/\\-]';
    } else if (ch === ' ') {
      pattern += '\\s*';
    } else {
      pattern += ch.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    }
  }
  return pattern;
}

async function dateMatch(query) {
  const match = {};
  if (query.deviceId && query.deviceId !== 'ALL') match.deviceId = query.deviceId;
  if (query.serviceId && query.serviceId !== 'ALL') match.serviceId = query.serviceId;
  if (query.serviceName && query.serviceName !== 'ALL') match.serviceName = query.serviceName;

  if (query.userName && query.userName !== 'ALL') {
    const searchName = query.userName.trim();
    try {
      const userDoc = await User.findOne({
        $or: [
          { username: new RegExp(`^${escapeRegex(searchName)}$`, 'i') },
          { displayName: new RegExp(`^${escapeRegex(searchName)}$`, 'i') }
        ]
      }).lean();

      if (userDoc) {
        const names = Array.from(new Set([userDoc.username, userDoc.displayName, searchName])).filter(Boolean);
        match.userName = { $in: names };
      } else {
        match.userName = searchName;
      }
    } catch {
      match.userName = searchName;
    }
  }

  if (query.paymentMethod && query.paymentMethod !== 'ALL') match.paymentMethod = query.paymentMethod;

  const rawDate = (query.nepaliDate || query.date || '').trim();
  if (rawDate) {
    const engDate = toEnglishDigits(rawDate);
    const pattern = buildNepaliDatePattern(rawDate);
    const nepaliMatch = { $regex: pattern, $options: 'i' };

    // If it's a Bikram Sambat year (207x, 208x, 209x or Nepali digits)
    if (/^20[789]/.test(engDate) || /[०-९]/.test(rawDate)) {
      match.nepaliDate = nepaliMatch;
    } else {
      const start = new Date(`${rawDate}T00:00:00.000Z`);
      if (!isNaN(start.getTime())) {
        const end = new Date(start);
        end.setUTCDate(end.getUTCDate() + 1);
        match.$or = [
          { createdAtDevice: { $gte: start, $lt: end } },
          { nepaliDate: nepaliMatch }
        ];
      } else {
        match.nepaliDate = nepaliMatch;
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
  const match = await dateMatch(req.query);
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
  const match = await dateMatch(req.query);
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