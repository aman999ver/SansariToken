const app = require('./app');
const env = require('./config/env');
const { connectDatabase } = require('./config/database');

async function start() {
  await connectDatabase();
  app.listen(env.port, () => console.log(`API listening on port ${env.port}`));
}

start().catch((error) => { console.error('Failed to start server', error); process.exit(1); });