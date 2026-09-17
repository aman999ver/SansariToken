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
  const unassigned = [];
  const knownCounterIds = new Set(counters.map((c) => (c.counterId || '').trim().toUpperCase()));

  for (const d of devices) {
    const rawCId = d.counterId ? d.counterId.trim().toUpperCase() : '';
    const formattedDevice = {
      ...d,
      counterId: rawCId || (counters[0]?.counterId || 'C1'),
      counterName: d.counterName || counters.find((c) => (c.counterId || '').trim().toUpperCase() === rawCId)?.counterName || counters[0]?.counterName || 'Counter 1'
    };

    if (rawCId && knownCounterIds.has(rawCId)) {
      if (!devicesByCounter.has(rawCId)) devicesByCounter.set(rawCId, []);
      devicesByCounter.get(rawCId).push(formattedDevice);
    } else if (counters.length > 0) {
      const fallbackId = counters[0].counterId.trim().toUpperCase();
      if (!devicesByCounter.has(fallbackId)) devicesByCounter.set(fallbackId, []);
      devicesByCounter.get(fallbackId).push(formattedDevice);
      unassigned.push(formattedDevice);
    } else {
      unassigned.push(formattedDevice);
    }
  }

  const result = counters.map((c) => {
    const cId = (c.counterId || '').trim().toUpperCase();
    const cDevices = devicesByCounter.get(cId) || [];
    return {
      ...c,
      devices: cDevices,
      deviceCount: cDevices.length,
      transactionCount: statsMap.get(c.counterId)?.count || 0,
      totalCollection: statsMap.get(c.counterId)?.total || 0
    };
  });

  return sendSuccess(res, {
    counters: result,
    allDevices: devices.map((d) => ({
      ...d,
      counterId: d.counterId || counters[0]?.counterId || 'C1',
      counterName: d.counterName || counters[0]?.counterName || 'Counter 1'
    })),
    unassignedDevices: unassigned
  });
}

async function available(req, res) {
  const counters = await Counter.find({ active: true }).sort({ counterId: 1 }).lean();
  const devices = await Device.find({ active: true }).sort({ deviceName: 1 }).lean();

  const devicesByCounter = new Map();
  for (const d of devices) {
    const cId = (d.counterId || counters[0]?.counterId || 'C1').trim().toUpperCase();
    if (!devicesByCounter.has(cId)) devicesByCounter.set(cId, []);
    devicesByCounter.get(cId).push({
      deviceId: d.deviceId,
      deviceName: d.deviceName,
      counterId: cId,
      counterName: d.counterName || counters[0]?.counterName || 'Counter 1'
    });
  }

  const result = counters.map((c) => {
    const cId = (c.counterId || '').trim().toUpperCase();
    return {
      counterId: c.counterId,
      counterName: c.counterName,
      devices: devicesByCounter.get(cId) || []
    };
  });

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
  const { newCounterId, counterName, active } = req.body || {};
  const oldCleanId = decodeURIComponent(counterId).trim().toUpperCase();

  const counter = await Counter.findOne({ counterId: oldCleanId });
  if (!counter) return sendError(res, 'Counter not found', 'NOT_FOUND', 404);

  let targetId = oldCleanId;
  if (newCounterId && newCounterId.trim().toUpperCase() !== oldCleanId) {
    targetId = newCounterId.trim().toUpperCase();
    const existing = await Counter.findOne({ counterId: targetId });
    if (existing) {
      return sendError(res, 'A counter with this new ID already exists', 'DUPLICATE_ERROR', 400);
    }
    counter.counterId = targetId;
  }

  if (counterName !== undefined) counter.counterName = counterName.trim();
  if (active !== undefined) counter.active = Boolean(active);
  await counter.save();

  // Cascade updates to devices
  const deviceUpdate = { counterId: targetId };
  if (counterName !== undefined) deviceUpdate.counterName = counter.counterName;
  await Device.updateMany({ counterId: oldCleanId }, { $set: deviceUpdate });

  // Cascade updates to transactions
  const txnUpdate = { counterId: targetId };
  if (counterName !== undefined) txnUpdate.counterName = counter.counterName;
  await Transaction.updateMany({ counterId: oldCleanId }, { $set: txnUpdate });

  return sendSuccess(res, { counter });
}

async function remove(req, res) {
  const { counterId } = req.params;
  const cleanId = decodeURIComponent(counterId).trim().toUpperCase();
  const counter = await Counter.findOneAndDelete({ counterId: cleanId });
  if (!counter) return sendError(res, 'Counter not found', 'NOT_FOUND', 404);

  // Find another active counter to reassign to if available
  const remaining = await Counter.findOne({ counterId: { $ne: cleanId } }).sort({ counterId: 1 });
  const fallbackCounterId = remaining ? remaining.counterId : '';
  const fallbackCounterName = remaining ? remaining.counterName : '';

  await Device.updateMany(
    { counterId: cleanId },
    { $set: { counterId: fallbackCounterId, counterName: fallbackCounterName } }
  );
  return sendSuccess(res, { message: 'Counter deleted successfully' });
}

module.exports = { list, available, create, update, remove };
