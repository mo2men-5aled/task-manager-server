# Task Manager — Backend

Express + TypeScript API for the Task Manager app (technical assessment project). Handles user registration/login (JWT), and per-user task CRUD with search and filtering.

This is the backend half of a two-repo submission. The frontend lives at: https://github.com/mo2men-5aled/task-manager-client

## Tech Stack

Node.js, Express, TypeScript, Mongoose (MongoDB), JWT (`jsonwebtoken`), `bcrypt`, `zod` for validation, `helmet` + `express-rate-limit` for hardening.

## Project Structure

```
src/
  config/db.ts            MongoDB connection
  models/                 Mongoose schemas (User, Task)
  middleware/              auth (JWT), request validation, error handling
  controllers/              auth and task route handlers
  routes/                  authRoutes, taskRoutes
  validators/               zod schemas for request validation
  utils/                    jwt helpers, async handler, AppError
  app.ts                    Express app wiring
  server.ts                 entrypoint (DB connect + listen)
tests/                      Jest + Supertest API tests
```

Layered structure: `routes` → `middleware` (auth/validation) → `controllers` → `models`.

## Environment Variables

Copy `.env.example` to `.env` and fill in real values:

| Variable | Description |
| --- | --- |
| `PORT` | Port the API listens on (default `5000`) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWTs — set to a long random value |
| `JWT_EXPIRES_IN` | Token lifetime (e.g. `7d`) |
| `FRONTEND_URL` | Deployed frontend origin, used for CORS |

## Running Locally

```bash
npm install
npm run dev
```

Runs on `http://localhost:5000` by default.

## Running Tests

```bash
npm test
```

Jest + Supertest suite (auth flow, task CRUD, and cross-user ownership boundaries) against an in-memory MongoDB — no external DB required.

## Deploying (Render)

1. Create a new Web Service on Render pointing at this repo.
2. Build command: `npm install && npm run build`
3. Start command: `npm start`
4. Set environment variables: `MONGODB_URI` (MongoDB Atlas connection string), `JWT_SECRET`, `JWT_EXPIRES_IN`, `FRONTEND_URL` (the deployed Vercel URL).
5. Once deployed, update the frontend's `VITE_API_URL` to point at this service's URL + `/api`.

## Main API Endpoints

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Log in, returns a JWT |
| GET | `/api/auth/me` | Yes | Get the current authenticated user |
| GET | `/api/tasks?search=&status=&priority=` | Yes | List the current user's tasks, with search/filter |
| POST | `/api/tasks` | Yes | Create a task |
| GET | `/api/tasks/:id` | Yes | Get a single task (must be owned by the requester) |
| PATCH | `/api/tasks/:id` | Yes | Update a task (must be owned by the requester) |
| DELETE | `/api/tasks/:id` | Yes | Delete a task (must be owned by the requester) |

Protected routes require `Authorization: Bearer <token>`.

## Docker

```bash
docker build -t task-manager-server .
docker run -p 5000:5000 --env-file .env task-manager-server
```

## AI Tool Disclosure

Built with the assistance of Claude Code (Anthropic), with the author reviewing and understanding all code prior to submission.

## Known Issues / Not Implemented

- Pagination on the task list is not implemented.
- No refresh-token rotation — a single long-lived access token is used.
