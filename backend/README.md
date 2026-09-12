# Token & Payment Backend

Phase 1 backend for the offline-first token and payment collection system. This service accepts device-created transaction identities and never uses the server to generate offline token numbers.

## Setup

1. Start MongoDB locally or provide a hosted MongoDB connection string.
2. Copy `.env.example` to `.env` and replace `JWT_SECRET`, `MONGODB_URI`, and `ADMIN_PASSWORD`.
3. Install dependencies with `npm install`.
4. Create or update the admin account with `npm run seed:admin`.
5. Start the API with `npm run dev` for development or `npm start` for production.

The default API URL is `http://localhost:4000`. `GET /health` does not require authentication.

## Render deployment

The repository includes `render.yaml`. Connect the GitHub repository to Render as a Blueprint, provide the secret environment variables, and deploy the `sansari-token-backend` web service. Render keeps the service running and automatically redeploys when the main branch changes.

Required Render secrets: `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGINS`, `ADMIN_USERNAME`, and `ADMIN_PASSWORD`.

## API

All successful responses contain `success: true`; errors contain `success: false`, `message`, and `errorCode`.

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | No | Admin login and JWT issuance |
| POST | `/api/auth/change-password` | JWT | Change the logged-in admin password |
| POST | `/api/devices/register` | No | Register or reactivate a POS device |
| GET | `/api/devices/available` | No | List active devices for first-time POS assignment |
| POST | `/api/devices` | JWT | Add a device/counter from the admin dashboard |
| GET | `/api/devices` | JWT | List devices and collection totals |
| GET | `/api/devices/:deviceId` | JWT | Device details and totals |
| PATCH | `/api/devices/:deviceId` | JWT | Update device name or active state |
| GET | `/api/services` | No | Read active/configured services |
| POST | `/api/services` | JWT | Create a service |
| PATCH | `/api/services/:id` | JWT | Update a service or price/options |
| DELETE | `/api/services/:id` | JWT | Soft-delete a service |
| POST | `/api/sync` | No | Idempotent device batch synchronization |
| GET | `/api/reports/summary` | JWT | Overall and device totals |
| GET | `/api/reports/transactions` | JWT | Filtered, paginated transactions |
| GET | `/api/reports/device/:deviceId` | JWT | Device-scoped report |
| GET | `/api/reports/daily` | JWT | Date-filtered report |
| GET | `/api/reports/devices/status` | JWT | Online/offline status from `lastSyncAt` |

The transaction unique index is `{ deviceId, localId }`. Re-uploading the same local transaction returns it in `duplicates` instead of creating another MongoDB document. The sync endpoint processes each transaction independently, so confirmed items remain accepted if a later item fails.

## Example requests

```bash
curl -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"change-this-password\"}"
```

```bash
curl -X POST http://localhost:4000/api/devices/register -H "Content-Type: application/json" -d "{\"deviceId\":\"DEV001\",\"deviceName\":\"Counter 1\"}"
```

```bash
curl -X POST http://localhost:4000/api/sync -H "Content-Type: application/json" -d "{\"deviceId\":\"DEV001\",\"transactions\":[{\"localId\":\"550e8400-e29b-41d4-a716-446655440000\",\"deviceId\":\"DEV001\",\"tokenNumber\":\"DEV001-000001\",\"serviceId\":\"service-bali\",\"serviceName\":\"Bali Puja\",\"itemName\":\"Boka\",\"amount\":255,\"paymentMethod\":\"cash\",\"createdAtDevice\":\"2026-09-12T10:00:00.000Z\"}]}"
```

For authenticated requests, send `Authorization: Bearer <token>`.

## Data models

- `Admin`: username and bcrypt password hash.
- `Device`: unique device ID, name, active state, and last successful sync time.
- `Service`: configurable name, category, optional base price, and item options.
- `Transaction`: device/local identity, device token number, service/payment details, device timestamp, server timestamp, and sync timestamp.

## Phase 2

The Expo mobile application still needs to be created: SQLite transaction persistence, per-device token sequencing, mock printer abstraction, service selection, transaction history, network detection, and the retrying sync queue.