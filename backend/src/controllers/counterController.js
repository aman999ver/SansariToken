const Counter = require('../models/Counter');
const Device = require('../models/Device');
const Transaction = require('../models/Transaction');
const { sendSuccess, sendError } = require('../utils/apiResponse');

async function list(req, res) {
  const counters = await Counter.find().sort({ counterId: 1 }).lean();
  const devices = await Device.find().sort({ deviceName: 1 }).lean();
  const counts = await Transaction.aggregate([
    { $group: { _id: '$counterId', count: { $sum: 1 }, total: { $sum: '$amount' } } }
  ]);
  const statsMap = new Map(counts.map((c) => [c._id, c]));

  const devicesByCounter = new Map();
  for (const d of devices) {
    const cId = d.counterId || 'C1';
    if (!devicesByCounter.has(cId)) devicesByCounter.set(cId, []);
    devicesByCounter.get(cId).push(d);
  }

  const result = counters.map((c) => ({
    ...c,
    devices: devicesByCounter.get(c.counterId) || [],
    deviceCount: (devicesByCounter.get(c.counterId) || []).length,
    transactionCount: statsMap.get(c.counterId)?.count || 0,
    totalCollection: statsMap.get(c.counterId)?.total || 0
  }));

  return sendSuccess(res, { counters: result, allDevices: devices });
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

  const result = counters.map((c) => ({
    counterId: c.counterId,
    counterName: c.counterName,
    devices: devicesByCounter.get(c.counterId) || []
  }));

  return sendSuccess(res, { counters: result, devices });
}

async function create(req, res) {
  const { counterId, counterName } = req.body || {};
  if (!counterId?.trim() || !counterName?.trim()) {
    return sendError(res, 'Counter ID and Counter Name are required', 'VALIDATION_ERROR', 400);
  }
  const cleanId = counterId.trim().toUpperCase();
  const existing = await Counter.findOne({ counterId: cleanId });
  if (existing) {
    return sendError(res, 'A counter with this ID already exists', 'DUPLICATE_ERROR', 400);
  }
  const counter = await Counter.create({
    counterId: cleanId,
    counterName: counterName.trim(),
    active: true
  });
  return sendSuccess(res, { counter }, 201);
}

async function update(req, res) {
  const { counterId } = req.params;
  const { counterName, active } = req.body || {};
  const updateData = {};
  if (counterName !== undefined) updateData.counterName = counterName.trim();
  if (active !== undefined) updateData.active = Boolean(active);

  const counter = await Counter.findOneAndUpdate(
    { counterId: counterId.toUpperCase() },
    { $set: updateData },
    { new: true }
  );
  if (!counter) return sendError(res, 'Counter not found', 'NOT_FOUND', 404);

  if (counterName !== undefined) {
    await Device.updateMany(
      { counterId: counter.counterId },
      { $set: { counterName: counter.counterName } }
    );
  }
  return sendSuccess(res, { counter });
}

async function remove(req, res) {
  const { counterId } = req.params;
  const cleanId = counterId.toUpperCase();
  const counter = await Counter.findOneAndDelete({ counterId: cleanId });
  if (!counter) return sendError(res, 'Counter not found', 'NOT_FOUND', 404);

  // Reassign or unassign devices
  await Device.updateMany(
    { counterId: cleanId },
    { $set: { counterId: 'C1', counterName: 'काउन्टर १' } }
  );
  return sendSuccess(res, { message: 'Counter deleted successfully' });
}

module.exports = { list, available, create, update, remove };
