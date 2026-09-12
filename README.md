# SansariToken

Offline-first token and payment collection system for श्री संसारी माई मन्दिर व्यवस्थापन समिति.

## Projects

- `backend/`: Node.js, Express, MongoDB, Mongoose API
- `mobile/`: Expo React Native Android POS application
- `admin/`: Next.js administration dashboard
- `render.yaml`: Render web service deployment configuration

## Backend deployment

Connect this repository to Render as a Blueprint. Render will use `render.yaml`, run the backend from `backend/`, and health-check `/health`.

The current blueprint uses Render's free plan, so no card is required. Render Free may spin down the service after inactivity; the first request after sleep can take a little longer. Always-on operation requires a paid plan.

The public backend URL will be:

```text
https://sansari-token-backend.onrender.com
```

Render may add a suffix if that service name is already taken. Copy the actual URL from the Render service page after the first deploy. Verify it with:

```text
GET https://<your-render-url>/health
```

The API root (`/`) returns a friendly service status response instead of a route error. GitHub Actions also checks `/health` every 14 minutes through `.github/workflows/render-healthcheck.yml`. This may reduce cold starts, but Render Free can still sleep; guaranteed always-on operation requires a paid plan.

Set these Render environment variables:

- `MONGODB_URI`
- `JWT_SECRET`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

`render.yaml` currently sets `CORS_ORIGINS=*` for initial setup. After the admin and mobile URLs are deployed, replace it with a comma-separated allowlist of trusted origins.

Recommended initial values:

```text
MONGODB_URI=<your MongoDB Atlas URI>
JWT_SECRET=<long random secret>
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<strong production password>
```

The mobile API base URL is configured in `mobile/src/constants/appConfig.js`; update it to the actual Render URL before producing the final APK. The admin dashboard uses `NEXT_PUBLIC_API_URL`, which should also point to the Render URL when deployed separately.

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
