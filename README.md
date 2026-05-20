# PyLearn — Gamified Coding Tutorial Platform

A full-stack research platform built to investigate whether gamification mechanics — experience points (XP), achievement badges, daily streaks, and leaderboards — improve learner engagement and retention compared to a standard, non-gamified coding tutorial experience.

Built as a dissertation artefact for **QHO634 Dissertation Project** at **Southampton Solent University** (2025–26).

---

## Research Context

The platform runs two functionally identical modes from the same codebase:

- **Standard mode** — clean lesson delivery with no game elements
- **Gamified mode** — same content with XP, badges, streaks, and a leaderboard layered on top

Users are assigned to one mode at registration. All activity is automatically logged to an analytics backend, enabling a controlled comparison of engagement metrics (lesson completions, session duration, return visits) and perceived usability (SUS scores) between the two groups.

**Research question:** *To what extent do gamification mechanics improve user retention and engagement on a coding tutorial platform compared to a standard equivalent?*

---

## Features

- JWT authentication with role-based access (user / admin)
- Ten progressive Python lessons with embedded quizzes, rendered from Markdown
- Sequential lesson unlocking — each lesson requires the previous to be completed
- **Gamified mode only:** XP points with streak multipliers, seven achievement badges, daily streak tracking, and a real-time leaderboard
- Profile page with personal progress charts (Chart.js)
- Post-study SUS survey (10-item Likert + open-ended questions)
- Admin dashboard — user management, lesson management, analytics charts
- Automatic analytics event logging for every user interaction
- Rate limiting (200 req / 15 min), Helmet security headers, CORS

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 19 |
| UI library | Material UI (MUI) | v7 |
| Build tool | Vite | v8 |
| Routing | React Router | v7 |
| Charts | Chart.js + react-chartjs-2 | v4 |
| HTTP client | Axios | v1 |
| Backend | Node.js + Express | v18 / v4 |
| Database | MongoDB + Mongoose | v8 |
| Auth | JWT + bcryptjs | — |
| Security | Helmet, express-rate-limit | — |
| Client tests | Vitest + React Testing Library | v4 |
| Server tests | Jest | v30 |
| E2E tests | Cypress | v15 |

---

## Project Structure

```
gamify-platform/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── pages/           # Dashboard, Lessons, Login, Register, Survey, etc.
│   │   ├── components/
│   │   │   ├── common/      # Shared UI components
│   │   │   ├── gamified/    # XP bar, badge notifications, streak counter
│   │   │   └── standard/    # Clean, non-gamified variants
│   │   ├── context/         # Auth and user context providers
│   │   ├── hooks/           # Custom data-fetching hooks
│   │   ├── services/        # Axios API wrappers
│   │   └── theme/           # MUI theme configuration
│   ├── cypress/             # End-to-end tests
│   └── vercel.json          # Vercel SPA rewrite config
└── server/                  # Node.js / Express API
    ├── controllers/         # Route handlers
    ├── models/              # Mongoose schemas (User, Lesson, Progress, etc.)
    ├── routes/              # API route definitions
    ├── middleware/          # Auth, admin guard, analytics tracking
    ├── services/            # XP, streak, badge business logic
    ├── config/              # DB connection
    ├── tests/               # Jest unit tests
    └── vercel.json          # Vercel serverless function config
```

---

## Local Development

### Prerequisites

- Node.js v18+
- A MongoDB connection string (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Clone the repository

```bash
git clone <repo-url>
cd gamify-platform
```

### 2. Configure the server

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env` with your values:

```env
PORT=5001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=a_long_random_secret
JWT_EXPIRES_IN=7d
NODE_ENV=development
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=YourAdminPassword123
```

Start the server:

```bash
npm run dev        # runs on http://localhost:5001
```

### 3. Start the client

Open a second terminal:

```bash
cd client
npm install
npm run dev        # runs on http://localhost:5173
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register a new user |
| POST | `/api/auth/login` | — | Login, receive JWT + session ID |
| POST | `/api/auth/logout` | ✓ | End session, record duration |
| GET | `/api/auth/me` | ✓ | Get current user profile |
| GET | `/api/lessons` | ✓ | Fetch all lessons (ordered) |
| GET | `/api/lessons/:slug` | ✓ | Fetch single lesson by slug |
| GET | `/api/progress/me` | ✓ | Get current user's completions |
| POST | `/api/progress` | ✓ | Record a lesson completion |
| GET | `/api/gamification` | ✓ | Get XP, badges, streak (gamified) |
| GET | `/api/leaderboard` | ✓ | Top 10 users by XP |
| POST | `/api/survey` | ✓ | Submit SUS survey response |
| GET | `/api/survey/me` | ✓ | Get own survey submission |
| GET | `/api/analytics` | Admin | Aggregated analytics data |
| GET | `/api/admin/users` | Admin | All users with stats |
| GET | `/api/health` | — | Health check |

---

## Running Tests

```bash
# Client unit tests
cd client && npm test

# Client test coverage report
cd client && npm run test:coverage

# Server unit tests
cd server && npm test

# Cypress E2E (interactive)
cd client && npm run cypress:open

# Cypress E2E (headless CI)
cd client && npm run cypress:run
```

---

## Deployment to Vercel

The client and server are deployed as two separate Vercel projects. Both include a `vercel.json` — no additional configuration files are needed.

### Step 1 — Deploy the server (API)

1. Go to [vercel.com](https://vercel.com) and click **Add New Project**
2. Import your GitHub repository and set the **Root Directory** to `server`
3. Vercel will auto-detect the `vercel.json` and deploy it as a serverless Node.js function
4. Under **Settings → Environment Variables**, add:

   | Variable | Value |
   |----------|-------|
   | `MONGO_URI` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | A long, random secret string |
   | `JWT_EXPIRES_IN` | `7d` |
   | `NODE_ENV` | `production` |
   | `CLIENT_URL` | Your frontend Vercel URL (add after step 2) |
   | `ADMIN_EMAIL` | Admin account email |
   | `ADMIN_PASSWORD` | Admin account password |

5. Deploy — note the API URL (e.g. `https://gamify-server.vercel.app`)

### Step 2 — Deploy the client (frontend)

1. Add another **New Project** from the same repository, setting **Root Directory** to `client`
2. Vercel detects Vite automatically — no build command changes needed
3. Under **Settings → Environment Variables**, add:

   | Variable | Value |
   |----------|-------|
   | `VITE_API_URL` | Your server Vercel URL from Step 1 |

4. Deploy — your frontend is live

### Step 3 — Update CORS

Go back to the **server** Vercel project → Environment Variables and set:

```
CLIENT_URL=https://your-frontend.vercel.app
```

Trigger a redeploy for the change to take effect.

### Automatic deploys

Once connected to GitHub, Vercel automatically redeploys both projects on every push to `main`.

---

## Environment Variables Reference

| Variable | Required in | Description |
|----------|------------|-------------|
| `MONGO_URI` | Server | MongoDB connection string |
| `JWT_SECRET` | Server | Secret for signing JWTs |
| `JWT_EXPIRES_IN` | Server | Token expiry (e.g. `7d`) |
| `NODE_ENV` | Server | `development` or `production` |
| `CLIENT_URL` | Server | Frontend origin for CORS |
| `ADMIN_EMAIL` | Server | Email for the seeded admin account |
| `ADMIN_PASSWORD` | Server | Password for the seeded admin account |
| `VITE_API_URL` | Client | Backend API base URL |

A template is available at `server/.env.example`.

---

## Notes

- Users are assigned to a mode (gamified or standard) at registration. The assignment is random by default and does not change.
- The admin dashboard is protected by role-based middleware — only accounts with `role: admin` can access it.
- All API routes are rate-limited to 200 requests per 15 minutes per IP.
- Lesson content is sequential — completing lesson N requires lesson N−1 to be done first.
- The SUS survey can only be submitted once per user account.

---
