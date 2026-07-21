# Pickleball Tracking App

A full-stack app for tracking pickleball games, player rankings, and friend networks.

## Project Structure

```
pickleball_app/
├── backend/     — Node.js + Express + MongoDB REST API
└── frontend/    — React + Vite + TypeScript web app
```

---

## Quick Start

### 1. Start the Backend

```bash
cd backend
cp .env.example .env   # configure your MongoDB URI if needed
npm install
npm run dev            # starts on http://localhost:3001
```

Seed the database with sample data:

```bash
npm run seed
```

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev            # starts on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## Tech Stack

### Backend (`/backend`)
- **Runtime**: Node.js 18+
- **Framework**: Express 4
- **Database**: MongoDB via Mongoose
- **Security**: Helmet, CORS, rate limiting, input validation
- **Dev**: nodemon, dotenv

### Frontend (`/frontend`)
- **Framework**: React 19 + Vite + TypeScript
- **Styling**: Tailwind CSS v4
- **State**: Zustand
- **Data fetching**: TanStack React Query
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Routing**: React Router v6

---

## API Overview

| Method | Endpoint            | Description                  |
|--------|---------------------|------------------------------|
| GET    | /health             | Health check                 |
| GET    | /api/players        | List players (paginated)     |
| POST   | /api/players        | Create player                |
| PATCH  | /api/players/:uid   | Update player                |
| DELETE | /api/players/:uid   | Delete player                |
| GET    | /api/games          | List games (paginated)       |
| POST   | /api/games          | Log a new game               |
| DELETE | /api/games/:id      | Delete a game                |
| GET    | /api/friends        | List friend requests         |
| POST   | /api/friends        | Send a friend request        |
| PATCH  | /api/friends/:id    | Accept a friend request      |
| DELETE | /api/friends/:id    | Remove a friend request      |

See `backend/README.md` for full API docs.
