function sendSuccess(res, data = {}, status = 200) {
  return res.status(status).json({ success: true, ...data });
}

function sendError(res, message, errorCode = 'INTERNAL_ERROR', status = 500, details) {
  const body = { success: false, message, errorCode };
  if (details) body.details = details;
  return res.status(status).json(body);
}

module.exports = { sendSuccess, sendError };