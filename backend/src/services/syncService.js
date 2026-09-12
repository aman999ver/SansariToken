const Device = require('../models/Device');
const Transaction = require('../models/Transaction');

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
  for (const input of transactions) {
    if (input.deviceId !== deviceId) {
      failed.push({ localId: input.localId, message: 'Transaction deviceId does not match request deviceId' });
      continue;
    }
    try {
      const result = await Transaction.updateOne(
        { deviceId, localId: input.localId },
        { $setOnInsert: { ...input, syncedAt: new Date(), createdAtServer: new Date() } },
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
  return { synced, duplicates, failed };
}

module.exports = { syncTransactions };