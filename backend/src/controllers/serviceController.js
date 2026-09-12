const Service = require('../models/Service');
const { sendSuccess } = require('../utils/apiResponse');

async function list(req, res) { return sendSuccess(res, { services: await Service.find().sort({ name: 1 }).lean() }); }
async function create(req, res) { return sendSuccess(res, { service: await Service.create(req.body) }, 201); }
async function update(req, res) { const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); if (!service) return res.status(404).json({ success: false, message: 'Service not found', errorCode: 'NOT_FOUND' }); return sendSuccess(res, { service }); }
async function remove(req, res) { const service = await Service.findByIdAndUpdate(req.params.id, { active: false }, { new: true }); if (!service) return res.status(404).json({ success: false, message: 'Service not found', errorCode: 'NOT_FOUND' }); return sendSuccess(res, { service }); }

module.exports = { list, create, update, remove };