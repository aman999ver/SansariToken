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
  return response.devices || [];
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
    tokenNumber: transaction.token_number,
    templeName: transaction.temple_name,
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