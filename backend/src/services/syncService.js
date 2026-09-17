const Device = require('../models/Device');
const Transaction = require('../models/Transaction');

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function getLatestSequence({ username, deviceId }) {
  const query = {};
  if (username && username.trim()) {
    query.userName = new RegExp(`^${escapeRegex(username.trim())}$`, 'i');
  } else if (deviceId && deviceId.trim()) {
    query.deviceId = deviceId.trim();
  } else {
    return 0;
  }

  // Find recent transactions matching the query
  const txns = await Transaction.find(query)
    .sort({ createdAtDevice: -1 })
    .limit(200)
    .select('sequence receiptNumber tokenNumber')
    .lean();

  let maxSeq = 0;
  for (const t of txns) {
    if (typeof t.sequence === 'number' && t.sequence > maxSeq) {
      maxSeq = t.sequence;
    }
    const numStr = t.receiptNumber || t.tokenNumber || '';
    const match = numStr.match(/(\d+)$/);
    if (match) {
      const parsed = parseInt(match[1], 10);
      if (!isNaN(parsed) && parsed > maxSeq) {
        maxSeq = parsed;
      }
    }
  }
  return maxSeq;
}

async function syncTransactions(deviceId, transactions) {
  const device = await Device.findOne({ deviceId, active: true });
  if (!device) {
    const error = new Error('Device is not registered or inactive');
    error.status = 403;
    error.errorCode = 'DEVICE_NOT_ALLOWED';
    throw error;
  }

  const synced = [];
  const duplicates = [];
  const failed = [];
  let detectedUser = null;

  for (const input of transactions) {
    if (input.deviceId !== deviceId) {
      failed.push({ localId: input.localId, message: 'Transaction deviceId does not match request deviceId' });
      continue;
    }
    if (input.userName && !detectedUser) {
      detectedUser = input.userName;
    }

    // Ensure counter info is populated from device if missing
    const counterId = input.counterId || device.counterId || 'C1';
    const counterName = input.counterName || device.counterName || 'काउन्टर १';

    let sequence = input.sequence;
    if (!sequence) {
      const match = (input.receiptNumber || input.tokenNumber || '').match(/(\d+)$/);
      sequence = match ? parseInt(match[1], 10) : 0;
    }

    const payload = {
      ...input,
      counterId,
      counterName,
      sequence,
      syncedAt: new Date(),
      createdAtServer: new Date()
    };

    try {
      const result = await Transaction.updateOne(
        { deviceId, localId: input.localId },
        { $setOnInsert: payload },
        { upsert: true }
      );
      if (result.upsertedCount === 1) synced.push(input.localId);
      else duplicates.push(input.localId);
    } catch (error) {
      if (error.code === 11000) duplicates.push(input.localId);
      else failed.push({ localId: input.localId, message: 'Transaction could not be accepted' });
    }
  }

  await Device.updateOne({ deviceId }, { $set: { lastSyncAt: new Date() } });

  const latestSequence = await getLatestSequence({ username: detectedUser, deviceId });

  return { synced, duplicates, failed, latestSequence };
}

module.exports = { syncTransactions, getLatestSequence };