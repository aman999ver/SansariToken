# SansariToken

Offline-first token and payment collection system for श्री संसारी माई मन्दिर व्यवस्थापन समिति.

## Projects

- `backend/`: Node.js, Express, MongoDB, Mongoose API
- `mobile/`: Expo React Native Android POS application
- `admin/`: Next.js administration dashboard
- `render.yaml`: Render web service deployment configuration

## Backend deployment

Connect this repository to Render as a Blueprint. Render will use `render.yaml`, run the backend from `backend/`, keep the web service running, and health-check `/health`.

Set these Render environment variables:

- `MONGODB_URI`
- `JWT_SECRET`
- `CORS_ORIGINS`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

Do not commit local `.env` files.

## Local development

```powershell
cd backend
npm install
npm run dev
```

```powershell
cd admin
npm install
npm run dev
```

```powershell
cd mobile
npm install
npm start
```

Mobile tokens are persisted in SQLite, use a device-prefixed daily sequence, and are queued for synchronization when offline. The current printer implementation is deliberately a mock until the R330 Plus vendor SDK is provided.
