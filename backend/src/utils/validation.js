const { z } = require('zod');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid identifier');
const transactionSchema = z.object({
  localId: z.string().uuid(),
  deviceId: z.string().trim().min(1).max(64),
  tokenNumber: z.string().trim().min(1).max(100),
  receiptNumber: z.string().trim().max(100).optional().default(''),
  templeName: z.string().trim().min(1).max(200),
  userName: z.string().trim().max(200).optional().default(''),
  nepaliDate: z.string().trim().max(30).optional().default(''),
  tokenTime: z.string().trim().max(20).optional().default(''),
  serviceId: z.string().trim().min(1),
  serviceName: z.string().trim().min(1).max(200),
  itemName: z.string().trim().max(200).optional().default(''),
  amount: z.number().nonnegative(),
  paymentMethod: z.string().trim().min(1).max(50),
  createdAtDevice: z.coerce.date()
});

const syncSchema = z.object({
  deviceId: z.string().trim().min(1).max(64),
  transactions: z.array(transactionSchema).min(1).max(500)
});

module.exports = { objectId, transactionSchema, syncSchema };