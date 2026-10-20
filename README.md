# Sri Lanka HRMS — Frontend Web Application

Production-ready web application for the Sri Lanka HRMS & Payroll system built with **React 19**, **Vite**, **TypeScript**, **Tailwind CSS v4**, and **shadcn/ui**.

---

## Tech Stack

- **Framework**: React 19 + Vite 6 + TypeScript
- **Styling**: Tailwind CSS v4 + Lucide Icons + Radix UI
- **State Management**: TanStack Query v5 (server cache) + Zustand (client state)
- **Tables & Forms**: TanStack Table v8 + Formik + Zod validation
- **Routing**: React Router v7
- **Deployment**: Nginx Alpine Docker container

---

## Local Development

### Prerequisites
- Node.js >= 20
- `pnpm` (recommended) or `npm`

### Installation
```bash
# Install dependencies
pnpm install
```

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure `VITE_API_BASE_URL` points to your backend instance:
```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### Start Development Server
```bash
pnpm dev
```
The application will be accessible at `http://localhost:5173`.

### Typecheck & Build
```bash
# Typecheck
pnpm run typecheck

# Production build
pnpm run build
```

---

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
5. (Optional) Set Build Arguments or Environment Variables:
   - `VITE_API_BASE_URL`: e.g. `https://api.yourdomain.com/api/v1` or `/api/v1`
6. Under **Domains**, add your domain (e.g. `hrms.yourdomain.com` or `app.yourdomain.com`). Set container port to `80`.
7. Click **Deploy**.

The Docker container runs a lightweight Nginx server configured with SPA routing, gzip compression, asset caching, and security headers.
