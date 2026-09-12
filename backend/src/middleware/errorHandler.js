const { ZodError } = require('zod');
const { sendError } = require('../utils/apiResponse');

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error instanceof ZodError) return sendError(res, 'Request validation failed', 'VALIDATION_ERROR', 400, error.issues);
  if (error.code === 11000) return sendError(res, 'A record with this identity already exists', 'DUPLICATE_RECORD', 409);
  if (error.status && error.errorCode) return sendError(res, error.message, error.errorCode, error.status);
  console.error(error);
  return sendError(res, 'Something went wrong', 'INTERNAL_ERROR', 500);
}

module.exports = errorHandler;