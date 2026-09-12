const Device = require('../models/Device');
const Transaction = require('../models/Transaction');
const { sendSuccess } = require('../utils/apiResponse');

async function register(req, res) {
  const { deviceId, deviceName } = req.body || {};
  const device = await Device.findOneAndUpdate({ deviceId }, { $set: { deviceName, active: true } }, { new: true, upsert: true, setDefaultsOnInsert: true });
  return sendSuccess(res, { device }, 200);
}

async function available(req, res) {
  const devices = await Device.find({ active: true }).select('deviceId deviceName').sort({ deviceName: 1 }).lean();
  return sendSuccess(res, { devices });
}

async function create(req, res) {
  const { deviceId, deviceName } = req.body || {};
  if (!deviceId?.trim() || !deviceName?.trim()) return res.status(400).json({ success: false, message: 'Device ID and device name are required', errorCode: 'VALIDATION_ERROR' });
  const device = await Device.create({ deviceId: deviceId.trim(), deviceName: deviceName.trim(), active: true });
  return sendSuccess(res, { device }, 201);
}

async function list(req, res) {
  const devices = await Device.find().sort({ deviceName: 1 }).lean();
  const counts = await Transaction.aggregate([{ $group: { _id: '$deviceId', count: { $sum: 1 }, total: { $sum: '$amount' } } }]);
  const byId = new Map(counts.map((item) => [item._id, item]));
  return sendSuccess(res, { devices: devices.map((device) => ({ ...device, transactionCount: byId.get(device.deviceId)?.count || 0, totalCollection: byId.get(device.deviceId)?.total || 0 })) });
}

async function getOne(req, res) {
  const device = await Device.findOne({ deviceId: req.params.deviceId }).lean();
  if (!device) return res.status(404).json({ success: false, message: 'Device not found', errorCode: 'NOT_FOUND' });
  const summary = await Transaction.aggregate([{ $match: { deviceId: device.deviceId } }, { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$amount' } } }]);
  return sendSuccess(res, { device, summary: summary[0] || { count: 0, total: 0 } });
}

async function update(req, res) {
  const device = await Device.findOneAndUpdate({ deviceId: req.params.deviceId }, { $set: req.body }, { new: true, runValidators: true });
  if (!device) return res.status(404).json({ success: false, message: 'Device not found', errorCode: 'NOT_FOUND' });
  return sendSuccess(res, { device });
}

module.exports = { register, available, create, list, getOne, update };