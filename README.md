# Sri Lanka HRMS — Frontend Web Application

Frontend demo for the Sri Lanka HRMS & Payroll system built with **React 19**, **Vite**, **TypeScript**, **Tailwind CSS v4**, and **shadcn/ui**. All feature data comes from a browser-local mock layer; no backend is required.

---

## Tech Stack

- **Framework**: React 19 + Vite 6 + TypeScript
- **Styling**: Tailwind CSS v4 + Lucide Icons + Radix UI
- **State Management**: TanStack Query v5 (async data cache) + Zustand (client state)
- **Tables & Forms**: TanStack Table v8 + Formik + Zod validation
- **Routing**: React Router v7
- **Deployment**: Nginx Alpine Docker container

---

## Local Development

### Prerequisites
- Node.js 22.12+ and `npm`

### Installation
```bash
# Install dependencies
npm ci
```

Use npm for this project and commit `package-lock.json` whenever dependencies change. Keep it as the only package-manager lockfile so local and hosted builds install the same dependency versions.

### Environment Configuration
No environment configuration is required. `.env.example` contains only the optional application title.

### Demo data and login

Use **Auto-fill Admin** on the login page, then sign in:

- Email: `admin@ceylonholdings.lk`
- Password: `Admin@2026!Secure`

The account is available immediately. Authentication and permissions are simulated for UI exploration.

Feature hooks live in `src/features/*/data`. They use `src/mocks/store.ts`, which reads and edits local records without HTTP requests. Customize the example records in `src/mocks/seed.ts`; `defaults.ts` supplies record shapes and `operations.json` lists supported operations.

Edits persist in this browser under `peoples-hrm-mock-v1`. To restore the seed, remove that key in browser developer tools and reload, or call `resetMockData()` in development and clear the query cache. The demo login session uses the separate `sri-lanka-hrms-mock-auth` key.

File uploads are stored locally as data URLs (2 MB per file, subject to browser storage capacity). Email, storage connection tests, notifications, webhooks, payroll and statutory calculations are simulations; they do not contact services, send messages, or perform production financial calculations. Use sample data only.

### Start Development Server
```bash
npm run dev
```
The application will be accessible at `http://localhost:5173`.

### Typecheck & Build
```bash
# Typecheck
npm run typecheck

# Production build
npm run build
```

---

## Deploying to Vercel

The committed `vercel.json` configures the Vite build with `npm ci`, `npm run build`, and the `dist` output directory. Commit and push dependency changes together with `package-lock.json`, then deploy the new commit. No backend environment variables are required.

## Deploying to Dokploy

Dokploy allows 1-click deployment from GitHub using the included `Dockerfile`.

### Step 1: Create a New GitHub Repository
1. Initialize git in this `frontend` directory:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit for frontend application"
   git branch -M main
   git remote add origin https://github.com/<your-username>/hrms-frontend.git
   git push -u origin main
   ```

### Step 2: Configure Dokploy Application
1. In your Dokploy dashboard, navigate to your Project/Environment.
2. Click **Create Application**.
3. Select **GitHub** as the source provider and select your `hrms-frontend` repository.
4. Set Build Type to **Dockerfile** (Dokploy will automatically detect `Dockerfile` in the repository root).
5. No backend URL or API build arguments are needed.
6. Under **Domains**, add your domain (e.g. `hrms.yourdomain.com` or `app.yourdomain.com`). Set container port to `80`.
7. Click **Deploy**.

The Docker container runs a lightweight Nginx server configured with SPA routing, gzip compression, asset caching, and security headers.
