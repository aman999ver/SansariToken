const Service = require('../models/Service');
const Transaction = require('../models/Transaction');
const { sendSuccess } = require('../utils/apiResponse');

const DEFAULT_SERVICES = [
  { name: 'बलि पूजा', category: 'सेवा', options: [{ name: 'बोका', price: 255 }, { name: 'हाँस', price: 150 }] },
  { name: 'बजार शुल्क', category: 'शुल्क', price: 3000, options: [] },
  { name: 'गाडी पूजा', category: 'सेवा', options: [{ name: 'मोटरसाइकल', price: 100 }, { name: 'City सफारी', price: 150 }, { name: 'चार पाङ्ग्रे', price: 200 }] },
  { name: 'टहरा शुल्क', category: 'शुल्क', price: 1005, options: [] },
  { name: 'अन्य', category: 'अन्य', price: null, options: [] }
];

async function list(req, res) {
  let dbServices = await Service.find().sort({ name: 1 }).lean();
  if (!dbServices || dbServices.length === 0) {
    try {
      await Service.insertMany(DEFAULT_SERVICES);
      dbServices = await Service.find().sort({ name: 1 }).lean();
    } catch {}
  }

  try {
    const txnServiceNames = await Transaction.distinct('serviceName');
    const existingNames = new Set((dbServices || []).map((s) => s.name));
    for (const name of txnServiceNames) {
      if (name && !existingNames.has(name)) {
        dbServices.push({ _id: name, name, category: 'अन्य', options: [] });
        existingNames.add(name);
      }
    }
  } catch {}

  return sendSuccess(res, { services: dbServices || [] });
}

async function create(req, res) { return sendSuccess(res, { service: await Service.create(req.body) }, 201); }
async function update(req, res) { const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); if (!service) return res.status(404).json({ success: false, message: 'Service not found', errorCode: 'NOT_FOUND' }); return sendSuccess(res, { service }); }
async function remove(req, res) { const service = await Service.findByIdAndUpdate(req.params.id, { active: false }, { new: true }); if (!service) return res.status(404).json({ success: false, message: 'Service not found', errorCode: 'NOT_FOUND' }); return sendSuccess(res, { service }); }

module.exports = { list, create, update, remove };