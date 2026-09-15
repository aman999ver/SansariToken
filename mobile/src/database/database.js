import * as SQLite from 'expo-sqlite';

let databasePromise;

export function getDatabase() {
  if (!databasePromise) databasePromise = SQLite.openDatabaseAsync('token-payment.db');
  return databasePromise;
}

export async function initializeDatabase() {
  const database = await getDatabase();
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS transactions (
      local_id TEXT PRIMARY KEY NOT NULL,
      device_id TEXT NOT NULL,
      token_number TEXT NOT NULL UNIQUE,
      receipt_number TEXT NOT NULL DEFAULT '',
      temple_name TEXT NOT NULL DEFAULT '',
      user_name TEXT NOT NULL DEFAULT '',
      nepali_date TEXT NOT NULL DEFAULT '',
      token_time TEXT NOT NULL DEFAULT '',
      service_id TEXT NOT NULL,
      service_name TEXT NOT NULL,
      item_name TEXT NOT NULL DEFAULT '',
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      created_at TEXT NOT NULL,
      sync_status TEXT NOT NULL DEFAULT 'pending',
      sync_attempts INTEGER NOT NULL DEFAULT 0,
      last_sync_attempt TEXT,
      synced_at TEXT
    );
    CREATE INDEX IF NOT EXISTS transactions_sync_status_idx ON transactions(sync_status);
    CREATE INDEX IF NOT EXISTS transactions_created_at_idx ON transactions(created_at DESC);
  `);
  try { await database.execAsync("ALTER TABLE transactions ADD COLUMN temple_name TEXT NOT NULL DEFAULT ''"); } catch { /* Existing databases already have this column. */ }
  try { await database.execAsync("ALTER TABLE transactions ADD COLUMN receipt_number TEXT NOT NULL DEFAULT ''"); } catch { /* Existing databases already have this column. */ }
  try { await database.execAsync("ALTER TABLE transactions ADD COLUMN user_name TEXT NOT NULL DEFAULT ''"); } catch { /* Existing databases already have this column. */ }
  try { await database.execAsync("ALTER TABLE transactions ADD COLUMN nepali_date TEXT NOT NULL DEFAULT ''"); } catch { /* Existing databases already have this column. */ }
  try { await database.execAsync("ALTER TABLE transactions ADD COLUMN token_time TEXT NOT NULL DEFAULT ''"); } catch { /* Existing databases already have this column. */ }
  return database;
}

export async function getSetting(key) {
  const database = await getDatabase();
  const row = await database.getFirstAsync('SELECT value FROM app_settings WHERE key = ?', key);
  return row?.value ?? null;
}

export async function setSetting(key, value) {
  const database = await getDatabase();
  await database.runAsync('INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)', key, String(value));
}

export async function createTransaction(transaction) {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO transactions
      (local_id, device_id, token_number, receipt_number, temple_name, user_name, nepali_date, token_time, service_id, service_name, item_name, amount, payment_method, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    transaction.localId,
    transaction.deviceId,
    transaction.tokenNumber,
    transaction.receiptNumber,
    transaction.templeName,
    transaction.userName,
    transaction.nepaliDate,
    transaction.tokenTime,
    transaction.serviceId,
    transaction.serviceName,
    transaction.itemName || '',
    transaction.amount,
    transaction.paymentMethod,
    transaction.createdAt
  );
}

export async function listTransactions() {
  const database = await getDatabase();
  return database.getAllAsync('SELECT * FROM transactions ORDER BY created_at DESC');
}

export async function listPendingTransactions(limit = 50) {
  const database = await getDatabase();
  return database.getAllAsync("SELECT * FROM transactions WHERE sync_status IN ('pending', 'failed') ORDER BY created_at ASC LIMIT ?", limit);
}

export async function markSyncing(localIds) {
  if (!localIds.length) return;
  const database = await getDatabase();
  const placeholders = localIds.map(() => '?').join(',');
  await database.runAsync(
    `UPDATE transactions SET sync_status = 'syncing', sync_attempts = sync_attempts + 1, last_sync_attempt = ? WHERE local_id IN (${placeholders})`,
    new Date().toISOString(),
    ...localIds
  );
}

export async function markSynced(localIds) {
  if (!localIds.length) return;
  const database = await getDatabase();
  const placeholders = localIds.map(() => '?').join(',');
  await database.runAsync(`UPDATE transactions SET sync_status = 'synced', synced_at = ? WHERE local_id IN (${placeholders})`, new Date().toISOString(), ...localIds);
}

export async function markFailed(localIds) {
  if (!localIds.length) return;
  const database = await getDatabase();
  const placeholders = localIds.map(() => '?').join(',');
  await database.runAsync(`UPDATE transactions SET sync_status = 'failed' WHERE local_id IN (${placeholders})`, ...localIds);
}

export async function countPendingTransactions() {
  const database = await getDatabase();
  const row = await database.getFirstAsync("SELECT COUNT(*) AS count FROM transactions WHERE sync_status IN ('pending', 'failed', 'syncing')");
  return row?.count || 0;
}

/**
 * Returns a page of transactions (newest first) with optional sync_status filter.
 * @param {object} opts - { page: number, pageSize: number, filter: 'all'|'synced'|'pending'|'failed' }
 */
export async function listTransactionsPaginated({ page = 1, pageSize = 20, filter = 'all' } = {}) {
  const database = await getDatabase();
  const offset = (page - 1) * pageSize;

  let where = '';
  if (filter === 'synced') where = "WHERE sync_status = 'synced'";
  else if (filter === 'pending') where = "WHERE sync_status IN ('pending', 'syncing')";
  else if (filter === 'failed') where = "WHERE sync_status = 'failed'";

  const rows = await database.getAllAsync(
    `SELECT * FROM transactions ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    pageSize,
    offset
  );
  const countRow = await database.getFirstAsync(
    `SELECT COUNT(*) AS total FROM transactions ${where}`
  );
  return { rows, total: countRow?.total || 0 };
}

/**
 * Deletes synced transactions older than `days` days from the local SQLite store.
 * MongoDB retains all records; this only trims the on-device cache.
 */
export async function pruneOldSyncedTransactions(days = 2) {
  const database = await getDatabase();
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  await database.runAsync(
    "DELETE FROM transactions WHERE sync_status = 'synced' AND created_at < ?",
    cutoff
  );
}