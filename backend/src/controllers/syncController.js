const { syncSchema } = require('../utils/validation');
const { syncTransactions, getLatestSequence } = require('../services/syncService');
const { sendSuccess } = require('../utils/apiResponse');

async function sync(req, res) {
  const input = syncSchema.parse(req.body);
  return sendSuccess(res, await syncTransactions(input.deviceId, input.transactions));
}

async function sequence(req, res) {
  const username = req.query.username || '';
  const deviceId = req.query.deviceId || '';
  const latestSequence = await getLatestSequence({ username, deviceId });
  return sendSuccess(res, { latestSequence });
}

module.exports = { sync, sequence };