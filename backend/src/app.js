const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const env = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const { sendSuccess } = require('./utils/apiResponse');

const app = express();
app.use(helmet());
app.use(cors({ origin: env.corsOrigins.includes('*') ? '*' : (env.corsOrigins.length ? env.corsOrigins : false) }));
app.use(express.json({ limit: '1mb' }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false }));
app.get('/', (req, res) => sendSuccess(res, { service: 'sansari-token-backend', message: 'Sansari Token API is running', health: '/health' }));
app.get('/health', (req, res) => sendSuccess(res, { service: 'token-payment-backend', timestamp: new Date().toISOString() }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/devices', require('./routes/deviceRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/sync', require('./routes/syncRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found', errorCode: 'NOT_FOUND' }));
app.use(errorHandler);

module.exports = app;