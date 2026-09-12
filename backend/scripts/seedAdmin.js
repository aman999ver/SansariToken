const bcrypt = require('bcrypt');
const { connectDatabase, disconnectDatabase } = require('../src/config/database');
const env = require('../src/config/env');
const Admin = require('../src/models/Admin');

async function seedAdmin() {
  if (!env.adminUsername || !env.adminPassword) throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD are required');
  await connectDatabase();
  const passwordHash = await bcrypt.hash(env.adminPassword, 12);
  await Admin.findOneAndUpdate(
    { username: env.adminUsername },
    { $set: { passwordHash } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log(`Admin account ready: ${env.adminUsername}`);
  await disconnectDatabase();
}

seedAdmin().catch(async (error) => {
  console.error(error.message);
  await disconnectDatabase();
  process.exit(1);
});