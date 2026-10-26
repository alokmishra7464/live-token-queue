# Queue Token App (MERN)

# Live Link : https://live-token-queue-1.onrender.com

Customers log in with a phone OTP, take a token (e.g. `A-042`) and watch their
position update live. An admin calls the next customer, skips no-shows and marks
customers as served.

## Run it

You need Node 18+ and MongoDB running locally (or a MongoDB Atlas URL).

```bash
# Terminal 1 - backend (http://localhost:5000)
cd backend
npm install
npm run dev        # .env is already filled for local use

# Terminal 2 - frontend (http://localhost:5173)
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.
The OTP is printed in the **backend terminal** (`[MOCK SMS] OTP for ...`).
To log in as admin use a number listed in `backend/.env` -> `ADMIN_PHONES`
(default `9999999999`). Any other number logs in as a customer.

## Folder structure

```
backend/
  server.js              start the server
  src/
    app.js               express setup
    socket.js            socket.io (real time)
    config/db.js         MongoDB connection
    models/              Otp, Token, Counter (database shapes)
    services/            business rules (otpService, tokenService)
    controllers/         read request -> call service -> send response
    routes/              URL -> controller (+ auth middleware)
    middleware/          auth (JWT), error handler
    utils/               small helpers
frontend/
  src/
    pages/               Login, Customer, Admin
    components/          Navbar, QueueTable, ErrorMessage
    context/             AuthContext (who is logged in)
    hooks/               useQueueUpdates (socket listener)
    api.js               fetch helper
```

## How each requirement is met

| Requirement | Where / how |
|---|---|
| 6-digit OTP, mocked SMS | `otpService.sendOtp` prints OTP to console |
| Expires in 5 min | `expiresAt` checked in `verifyOtp` |
| 3 wrong attempts | `attempts` counter, then `valid = false` |
| 30 s resend gap, 5/hour | `lastSentAt` and `requestTimes` in `sendOtp` |
| OTP never plain text | only an HMAC-SHA256 hash is saved |
| Admin whitelist | `ADMIN_PHONES` in `.env` decides the role |
| Stay logged in | JWT without expiry, kept in localStorage until Log out |
| No duplicate numbers | atomic `$inc` on a counter + unique index on `number` |
| One active token per phone | partial unique index on `phone` where `active: true` |
| Live updates | server emits `queue:update`; pages re-fetch |
| Survives restart | everything is stored in MongoDB |
| Mobile + desktop | simple responsive CSS, table scrolls on small screens |

## API

| Method | URL | Who |
|---|---|---|
| POST | `/api/auth/request-otp` | anyone |
| POST | `/api/auth/verify-otp` | anyone |
| POST | `/api/tokens` | logged in |
| GET | `/api/tokens/me` | logged in |
| GET | `/api/admin/queue` | admin |
| POST | `/api/admin/next` | admin |
| POST | `/api/admin/:id/done` | admin |
| POST | `/api/admin/:id/skip` | admin |

## Notes
- "People ahead" = active tokens (waiting + the one being served) with a lower number.
- Admin must press Done or Skip on the current customer before Next works.
- Token numbers keep counting up (A-999 is followed by A-1000). A daily reset
  would be a good next step.


## AI Usage

Used Claude to assist with the initial backend and frontend implementation, including OTP authentication, token management, admin queue operations, and real-time updates. Reviewed and tested the generated code, fixing issues identified during integration. AI-generated code was treated as a starting point and verified against the assignment requirements.

## Prompt 
Build a simple Live Token Queue backend using Node.js, Express, and MongoDB. Implement OTP-based authentication, customer token generation, and admin operations for Next, Skip, and Done. Organize the code into routes, controllers, services, models, and middleware.
And a responsive React frontend, Include an OTP login page, a customer dashboard showing token status and queue position, and an admin dashboard with Next, Skip, and Done actions. Use a centralized API module, authentication context, reusable components, loading states, and error messages.
