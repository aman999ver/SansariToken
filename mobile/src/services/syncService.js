import NetInfo from '@react-native-community/netinfo';
import { countPendingTransactions, listPendingTransactions, markFailed, markSynced, markSyncing, pruneOldSyncedTransactions } from '../database/database';
import { uploadTransactions } from './api';

let syncing = false;

export async function syncPendingTransactions({ apiUrl, deviceId }) {
  if (syncing || !apiUrl || !deviceId) return { synced: 0, pending: await countPendingTransactions() };
  const network = await NetInfo.fetch();
  if (!network.isConnected) return { synced: 0, pending: await countPendingTransactions() };
  syncing = true;
  try {
    const transactions = await listPendingTransactions();
    if (!transactions.length) return { synced: 0, pending: 0 };
    const localIds = transactions.map((transaction) => transaction.local_id);
    await markSyncing(localIds);
    try {
      const result = await uploadTransactions(apiUrl, deviceId, transactions);
      const accepted = [...(result.synced || []), ...(result.duplicates || [])];
      await markSynced(accepted);
      // Prune synced transactions older than 2 days from local SQLite (MongoDB keeps all)
      await pruneOldSyncedTransactions(2);
      const failed = (result.failed || []).map((item) => item.localId).filter(Boolean);
      await markFailed(failed);
      return { synced: accepted.length, pending: await countPendingTransactions(), latestSequence: result.latestSequence };
    } catch (error) {
      await markFailed(localIds);
      return { synced: 0, pending: await countPendingTransactions(), error: error.message };
    }
  } finally {
    syncing = false;
  }
}