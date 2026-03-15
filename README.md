# Udemy Clone Full-Stack App

This is a full-stack, production-ready Learning Management System that lets users register, browse courses, and watch YouTube lessons linearly.

## Architecture & Tech Stack

**Frontend:**
- Next.js 15 (App Router)
- TailwindCSS v4 with premium design
- Zustand for lightweight local state management
- Axios with interceptors for auth flow
- YouTube Iframe Player seamlessly embedded with progress tracking

**Backend:**
- Node.js + Express
- TypeScript
- MySQL (configured for a standard locally hosted database, perfectly compatible with Aiven MySQL)
- JWT Authentication (Access + Refresh Tokens handled via HttpOnly Cookies & Bearer Headers)

## Setup Locally

### 1. Database Setup
Ensure you have MySQL installed and running.
Use the `backend/schema.sql` file to create the `udemy_clone` database, table structures, and seed data.
```bash
mysql -u root -p < backend/schema.sql
```

### 2. Backend Installation
```bash
cd backend
npm install
npm run dev
```
Create a `.env` in the `backend` folder containing:
```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=udemy_clone
DB_USER=root
DB_PASS=your_db_password
JWT_SECRET=supersecret
JWT_REFRESH_SECRET=supersecret2
CORS_ORIGIN=http://localhost:3000
COOKIE_DOMAIN=localhost
```

### 3. Frontend Installation
```bash
cd frontend
npm install
npm run dev
```
Create a `.env.local` in `frontend`:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

## Deployment

**Frontend (Vercel):**
1. Connect your GitHub repository to Vercel.
2. Select the `frontend` root directory.
3. Add in `NEXT_PUBLIC_API_BASE_URL` pointing to your Render backend URL.

**Backend (Render):**
1. Set the root directory to `backend`.
2. Build Command: `npm run build`
3. Start Command: `npm start`
4. Use standard Aiven MySQL connection details for the ENVs on Render dashboard.
5. Set `CORS_ORIGIN` to your generated Vercel APP URL.

## Features implemented fully:
- Automatic route protection and redirecting based on auth status.
- Strict ordering of course sections and sequential video locking.
- Micro-interaction & macro-animations implemented effectively through premium Tailwind.
- Refresh Token persistence & automatic refresh on unauthorized Axios interception.
- Video progress auto-save locally to the MySQL database on backend.
