# AGENTS.md

MERN monorepo, no workspaces. Two independent npm packages: `server/` (Express API) and `client/` (React + Vite). Root `package.json` only has shortcuts (`dev:server`, `dev:client`, `test:server`); always `npm install` / run scripts per package. Node 20 (per CI).

## Commands (run from package dir unless noted)

```bash
npm --prefix server run dev      # API on $PORT; or cd server && npm run dev (node --watch server.js)
npm --prefix client run dev      # Vite on :5173
npm --prefix server test         # Jest + Supertest, full suite
npm --prefix server run lint     # node --check syntax pass only (no ESLint)
```

- Single server test: `cd server && node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand tests/auth.test.js`
- Client `npm run lint` is a placeholder `echo`; client has no tests or typecheck. CI (`ci.yml`) is install → lint → test only, no deploy.
- Client build: `cd client && npm run build` (output `client/dist/`, gitignored). SPA rewrite lives in `client/vercel.json` — keep it for React Router refresh.

## Server quirks (`server/`)

- ESM (`"type": "module"`). Entry `server.js`: loads `.env` next to itself (cwd-independent), fail-fast `validateEnv()`, then `connectDB` → `listen` → `startDailySync()`.
- Required env (all six, `server/.env.example`): `PORT, MONGODB_URI, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, CLIENT_URL, NODE_ENV`. Missing var = immediate `process.exit(1)`. Never commit `.env` (gitignored).
- App factory `createApp()` in `src/app.js`; routes mounted under `/api/auth|problems|stats|goals|projects|sync|public` plus `GET /api/health`. Tests import `createApp`, not the listening server.
- Auth: 15-min Bearer access token + httpOnly 7-day refresh cookie (`withCredentials`). CORS `origin` is exactly `CLIENT_URL` with `credentials: true` — frontend origin must match. Cookie `secure`/`sameSite` flips on `NODE_ENV=production`.
- Tests need no `.env`/DB: `tests/helpers.js` sets dummy env vars and uses `mongodb-memory-server`. Coverage is only `auth` + `problems`; goals/projects/stats/sync have no tests — verify those manually.
- Daily platform sync is an in-process `node-cron` job (`02:00`, `src/jobs/dailySync.js`); no worker to deploy. Sync upserts (no duplicates) with per-user cooldown; manual logging must keep working if platforms are down.

## Client quirks (`client/`)

- API client `src/api.js`: `baseURL = VITE_API_URL` (fallback `http://localhost:5000/api`), `withCredentials: true`, Bearer injection + single-flight 401 → `/auth/refresh` retry queue. Keep `withCredentials` on any new request path.
- Entry `src/main.jsx` → `src/App.jsx`; auth state in `src/context/AuthContext.jsx`, theme in `ThemeContext.jsx`. Protected pages wrap in `AuthenticatedApp`/`ProtectedRoute`; public route is `/u/:username`.
- Env: only `VITE_API_URL` (`client/.env.example`). Must point at `/api` suffix.
