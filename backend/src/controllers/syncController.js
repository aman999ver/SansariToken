const { syncSchema } = require('../utils/validation');
const { syncTransactions } = require('../services/syncService');
const { sendSuccess } = require('../utils/apiResponse');

async function sync(req, res) {
  const input = syncSchema.parse(req.body);
  return sendSuccess(res, await syncTransactions(input.deviceId, input.transactions));
}

module.exports = { sync };