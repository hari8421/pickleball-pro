# Pickleball Backend

Production-ready REST API for the Pickleball Tracking App, built with Node.js, Express, and MongoDB.

## Quick Start

### Prerequisites
- Node.js >= 18
- MongoDB running locally (default: `mongodb://localhost:27017`)

### Setup

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Copy the env template and fill in your values
cp .env.example .env

# 3. Start the development server (with auto-reload)
npm run dev

# 4. (Optional) Seed the database with sample data
npm run seed
```

The server will start on **http://localhost:3001** by default.

---

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.js               # Mongoose connection with retry logic
│   ├── models/
│   │   ├── Player.js
│   │   ├── Game.js
│   │   └── FriendRequest.js
│   ├── controllers/
│   │   ├── playerController.js
│   │   ├── gameController.js
│   │   └── friendController.js
│   ├── routes/
│   │   ├── playerRoutes.js
│   │   ├── gameRoutes.js
│   │   └── friendRoutes.js
│   ├── middleware/
│   │   ├── errorHandler.js     # Central error handler
│   │   ├── validate.js         # express-validator runner
│   │   └── notFound.js         # 404 handler
│   ├── validators/
│   │   ├── playerValidators.js
│   │   ├── gameValidators.js
│   │   └── friendValidators.js
│   ├── scripts/
│   │   └── seed.js             # Database seeder
│   └── app.js                  # Express app setup (no listen)
├── .env                        # Local env vars (not committed)
├── .env.example                # Env template (committed)
├── .gitignore
├── package.json
└── server.js                   # Entry point
```

---

## Environment Variables

| Variable               | Default                              | Description                        |
|------------------------|--------------------------------------|------------------------------------|
| `NODE_ENV`             | `development`                        | Environment (`development`/`production`/`test`) |
| `PORT`                 | `3001`                               | HTTP port                          |
| `MONGODB_URI`          | `mongodb://localhost:27017/pickleball_db` | MongoDB connection string     |
| `CORS_ORIGINS`         | `http://localhost:5173,...`          | Comma-separated allowed origins    |
| `RATE_LIMIT_WINDOW_MS` | `900000` (15 min)                    | Rate-limit window in milliseconds  |
| `RATE_LIMIT_MAX`       | `100`                                | Max requests per window per IP     |

---

## API Reference

### Health Check
| Method | Path      | Description               |
|--------|-----------|---------------------------|
| GET    | /health   | Returns `{ status: 'ok' }` |

### Players — `/api/players`
| Method | Path              | Description                           |
|--------|-------------------|---------------------------------------|
| GET    | /                 | List players (paginated, sortable)    |
| GET    | /:uid             | Get player by UID                     |
| POST   | /                 | Create player                         |
| PATCH  | /:uid             | Partial update player                 |
| DELETE | /:uid             | Delete player                         |

**GET query params:** `sort` (rankScore|winRate|gamesPlayed), `order` (asc|desc), `page`, `limit`

### Games — `/api/games`
| Method | Path   | Description                            |
|--------|--------|----------------------------------------|
| GET    | /      | List games (paginated, filterable)     |
| GET    | /:id   | Get game by MongoDB ID                 |
| POST   | /      | Create game                            |
| DELETE | /:id   | Delete game                            |

**GET query params:** `page`, `limit`, `playerUID` (filter by participant)

### Friends — `/api/friends`
| Method | Path   | Description                          |
|--------|--------|--------------------------------------|
| GET    | /      | List friend requests (filter by uid) |
| POST   | /      | Send a friend request                |
| PATCH  | /:id   | Accept a friend request              |
| DELETE | /:id   | Delete a friend request              |

**GET query params:** `uid` (returns requests where user is sender or receiver)

---

## Error Responses

All errors return JSON in this shape:

```json
{
  "error": "Human-readable message",
  "stack": "..." // development only
}
```

Validation errors (422):

```json
{
  "errors": [
    { "type": "field", "msg": "uid is required", "path": "uid", "location": "body" }
  ]
}
```

---

## Scripts

| Command         | Description                              |
|-----------------|------------------------------------------|
| `npm start`     | Start server (production)                |
| `npm run dev`   | Start with nodemon (development)         |
| `npm run seed`  | Seed DB with 10 players + 20 games       |
