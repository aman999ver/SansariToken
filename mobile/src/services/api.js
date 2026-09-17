const REQUEST_TIMEOUT_MS = 8000;

async function request(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || body.success === false) throw new Error(body.message || `Request failed (${response.status})`);
    return body;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchAvailableDevices(apiUrl) {
  const response = await request(`${apiUrl}/api/devices/available`);
  return {
    counters: response.counters || [],
    devices: response.devices || []
  };
}

export async function loginUser(apiUrl, username, password) {
  const response = await request(`${apiUrl}/api/auth/user-login`, { method: 'POST', body: JSON.stringify({ username, password }) });
  return {
    ...response.user,
    latestSequence: response.latestSequence || 0
  };
}

export async function fetchLatestSequence(apiUrl, { username, deviceId }) {
  try {
    const params = new URLSearchParams();
    if (username) params.set('username', username);
    if (deviceId) params.set('deviceId', deviceId);
    const response = await request(`${apiUrl}/api/sync/sequence?${params.toString()}`);
    return response.latestSequence || 0;
  } catch {
    return 0;
  }
}

export async function fetchServices(apiUrl) {
  const response = await request(`${apiUrl}/api/services`);
  return response.services || [];
}

export async function uploadTransactions(apiUrl, deviceId, transactions) {
  return request(`${apiUrl}/api/sync`, { method: 'POST', body: JSON.stringify({ deviceId, transactions: transactions.map(toApiTransaction) }) });
}

function toApiTransaction(transaction) {
  return {
    localId: transaction.local_id,
    deviceId: transaction.device_id,
    counterId: transaction.counter_id || '',
    counterName: transaction.counter_name || '',
    sequence: transaction.sequence || 0,
    tokenNumber: transaction.token_number,
    receiptNumber: transaction.receipt_number,
    templeName: transaction.temple_name,
    userName: transaction.user_name,
    nepaliDate: transaction.nepali_date,
    tokenTime: transaction.token_time,
    serviceId: transaction.service_id,
    serviceName: transaction.service_name,
    itemName: transaction.item_name,
    amount: transaction.amount,
    paymentMethod: transaction.payment_method,
    createdAtDevice: transaction.created_at
  };
}