const Device = require('../models/Device');
const Counter = require('../models/Counter');
const Transaction = require('../models/Transaction');
const { getLatestSequence } = require('../services/syncService');
const { sendSuccess } = require('../utils/apiResponse');

async function resolveCounter(counterId) {
  if (!counterId) {
    const first = await Counter.findOne({ active: true }).sort({ counterId: 1 });
    if (first) return { counterId: first.counterId, counterName: first.counterName };
    return { counterId: 'C1', counterName: 'काउन्टर १' };
  }
  const cleanId = counterId.trim().toUpperCase();
  const counter = await Counter.findOne({ counterId: cleanId });
  if (counter) return { counterId: counter.counterId, counterName: counter.counterName };
  return { counterId: cleanId, counterName: `काउन्टर ${cleanId}` };
}

async function register(req, res) {
  const { deviceId, deviceName, counterId } = req.body || {};
  const cInfo = await resolveCounter(counterId);
  const device = await Device.findOneAndUpdate(
    { deviceId: deviceId.trim().toUpperCase() },
    { $set: { deviceName: deviceName.trim(), counterId: cInfo.counterId, counterName: cInfo.counterName, active: true } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  return sendSuccess(res, { device }, 200);
}

async function available(req, res) {
  const counters = await Counter.find({ active: true }).sort({ counterId: 1 }).lean();
  const devices = await Device.find({ active: true }).sort({ deviceName: 1 }).lean();

  const devicesByCounter = new Map();
  for (const d of devices) {
    const cId = d.counterId || 'C1';
    if (!devicesByCounter.has(cId)) devicesByCounter.set(cId, []);
    devicesByCounter.get(cId).push({
      deviceId: d.deviceId,
      deviceName: d.deviceName,
      counterId: cId,
      counterName: d.counterName
    });
  }

  const countersWithDevices = counters.map((c) => ({
    counterId: c.counterId,
    counterName: c.counterName,
    devices: devicesByCounter.get(c.counterId) || []
  }));

  return sendSuccess(res, {
    counters: countersWithDevices,
    devices: devices.map((d) => ({
      deviceId: d.deviceId,
      deviceName: d.deviceName,
      counterId: d.counterId || 'C1',
      counterName: d.counterName || 'काउन्टर १'
    }))
  });
}

async function create(req, res) {
  const { deviceId, deviceName, counterId } = req.body || {};
  if (!deviceId?.trim() || !deviceName?.trim()) {
    return res.status(400).json({ success: false, message: 'Device ID and device name are required', errorCode: 'VALIDATION_ERROR' });
  }
  const cleanId = deviceId.trim().toUpperCase();
  const existing = await Device.findOne({ deviceId: cleanId });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Device ID already exists', errorCode: 'DUPLICATE_ERROR' });
  }

  const cInfo = await resolveCounter(counterId);
  const device = await Device.create({
    deviceId: cleanId,
    deviceName: deviceName.trim(),
    counterId: cInfo.counterId,
    counterName: cInfo.counterName,
    active: true
  });
  return sendSuccess(res, { device }, 201);
}

async function list(req, res) {
  const devices = await Device.find().sort({ deviceName: 1 }).lean();
  const counts = await Transaction.aggregate([{ $group: { _id: '$deviceId', count: { $sum: 1 }, total: { $sum: '$amount' } } }]);
  const byId = new Map(counts.map((item) => [item._id, item]));
  return sendSuccess(res, {
    devices: devices.map((device) => ({
      ...device,
      transactionCount: byId.get(device.deviceId)?.count || 0,
      totalCollection: byId.get(device.deviceId)?.total || 0
    }))
  });
}

async function getOne(req, res) {
  const device = await Device.findOne({ deviceId: req.params.deviceId.toUpperCase() }).lean();
  if (!device) return res.status(404).json({ success: false, message: 'Device not found', errorCode: 'NOT_FOUND' });
  const summary = await Transaction.aggregate([{ $match: { deviceId: device.deviceId } }, { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$amount' } } }]);
  return sendSuccess(res, { device, summary: summary[0] || { count: 0, total: 0 } });
}

async function update(req, res) {
  const cleanId = req.params.deviceId.toUpperCase();
  const updateData = { ...req.body };
  if (updateData.counterId) {
    const cInfo = await resolveCounter(updateData.counterId);
    updateData.counterId = cInfo.counterId;
    updateData.counterName = cInfo.counterName;
  }
  const device = await Device.findOneAndUpdate({ deviceId: cleanId }, { $set: updateData }, { new: true, runValidators: true });
  if (!device) return res.status(404).json({ success: false, message: 'Device not found', errorCode: 'NOT_FOUND' });
  return sendSuccess(res, { device });
}

async function remove(req, res) {
  const device = await Device.findOneAndDelete({ deviceId: req.params.deviceId.toUpperCase() });
  if (!device) return res.status(404).json({ success: false, message: 'Device not found', errorCode: 'NOT_FOUND' });
  return sendSuccess(res, { message: 'Device deleted successfully' });
}

async function sequence(req, res) {
  const username = req.query.username || '';
  const deviceId = req.query.deviceId || '';
  const latestSequence = await getLatestSequence({ username, deviceId });
  return sendSuccess(res, { latestSequence });
}

module.exports = { register, available, create, list, getOne, update, remove, sequence };