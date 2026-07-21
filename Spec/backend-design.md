# Backend Technical Design — Pickleball Tracking App

**Version:** 1.0  
**Date:** 2026-07-20  
**Status:** Implemented ✅

---

## 1. Overview

The backend is a Node.js REST API following the **MVC (Model-View-Controller)** pattern, separated into the `backend/` folder. It connects to MongoDB via Mongoose and serves JSON responses to the React frontend over HTTP. The app and the HTTP listener are intentionally split — `src/app.js` builds the Express app, and `server.js` connects to MongoDB then calls `app.listen()`. This separation makes the app testable without starting a real server.

---

## 2. Technology Stack

| Layer | Technology | Version | Reason |
|---|---|---|---|
| Runtime | Node.js | ≥ 18 | LTS, native `fetch`, built-in `crypto.randomUUID` |
| Framework | Express | 4.x | Stable, widely supported (v5 is still experimental) |
| ODM | Mongoose | 9.x | Schema validation, middleware hooks, typed queries |
| Database | MongoDB | 6+ | Document model suits game/player data; GeoJSON built-in |
| Security | Helmet | 8.x | Sets 15 security-related HTTP headers in one call |
| Security | express-rate-limit | 7.x | IP-based rate limiting per route group |
| Validation | express-validator | 7.x | Declarative body/param validation chains |
| CORS | cors | 2.x | Origin whitelist from environment variable |
| Compression | compression | 1.x | gzip response bodies |
| Logging | morgan | 1.x | HTTP request logging |
| Config | dotenv | 16.x | `.env` → `process.env` at startup |
| Dev | nodemon | 3.x | File-watch restart in development |

---

## 3. Project Structure

```
backend/
├── server.js                  # Entry point: dotenv → connectDB → app.listen + graceful shutdown
├── .env                       # Local secrets (gitignored)
├── .env.example               # Template committed to source control
├── .gitignore
├── package.json
├── README.md
└── src/
    ├── app.js                 # Express app factory — middleware stack + route mounting
    ├── config/
    │   └── db.js              # Mongoose connection with retry logic
    ├── models/
    │   ├── Player.js          # Player schema + indexes
    │   ├── Game.js            # Game schema + GeoJSON sub-schema + 2dsphere index
    │   └── FriendRequest.js   # FriendRequest schema + compound unique index
    ├── controllers/
    │   ├── playerController.js
    │   ├── gameController.js
    │   └── friendController.js
    ├── routes/
    │   ├── playerRoutes.js    # Router: validators → validate middleware → controller
    │   ├── gameRoutes.js
    │   └── friendRoutes.js
    ├── middleware/
    │   ├── errorHandler.js    # 4-param central error handler (last in stack)
    │   ├── validate.js        # express-validator result runner → 422
    │   └── notFound.js        # Catch-all 404 (before errorHandler)
    ├── validators/
    │   ├── playerValidators.js
    │   ├── gameValidators.js
    │   └── friendValidators.js
    └── scripts/
        └── seed.js            # CLI script: wipe + insert 10 players + 20 games
```

---

## 4. Architecture

### 4.1 Request Lifecycle

```
HTTP Request
    │
    ├─► helmet()           — set security headers
    ├─► cors()             — check Origin header against whitelist
    ├─► rateLimit()        — check request count per IP per window
    ├─► compression()      — wrap response stream with gzip
    ├─► express.json()     — parse JSON body (max 10kb)
    ├─► morgan()           — log method, url, status, response time
    │
    ├─► Router (e.g. /api/players)
    │       ├─► [validators]   — express-validator chains (body/param)
    │       ├─► validate()     — check validationResult → 422 if errors
    │       └─► controller()   — business logic + DB query → JSON response
    │
    ├─► notFound()         — 404 for unmatched routes
    └─► errorHandler()     — catches all next(err) calls → JSON error
```

### 4.2 App vs Server Separation

```
server.js
  ├── require('dotenv').config()     // load .env into process.env
  ├── connectDB()                    // retry-based Mongoose connect
  ├── app.listen(PORT)               // start HTTP server
  └── process.on('SIGTERM'/'SIGINT') // graceful drain + exit

src/app.js
  ├── middleware stack
  ├── route mounting
  └── module.exports = app          // exported for testing — no listen() here
```

### 4.3 Error Handling Flow

All controller functions follow this pattern:

```js
async function controllerFn(req, res, next) {
  try {
    // ... business logic
    res.json(result);
  } catch (err) {
    next(err);  // → errorHandler middleware
  }
}
```

Explicit application errors attach a `status` property before calling `next(err)`:

```js
const err = new Error('Player not found');
err.status = 404;
return next(err);
```

The central error handler:

```js
module.exports = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error',
    // stack only in development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
```

---

## 5. Data Models

### 5.1 Player

```
Collection: players

Field         Type      Required  Default   Constraint
────────────────────────────────────────────────────────
_id           ObjectId  auto      —         MongoDB primary key
uid           String    ✅        —         unique
displayName   String    ✅        —         min length 2
avatarURL     String    No        —         —
rankScore     Number    No        1500      0 – 9999
winRate       Float     No        0.5       0.0 – 1.0
gamesPlayed   Integer   No        0         ≥ 0
createdAt     Date      auto      now       Mongoose timestamps
updatedAt     Date      auto      now       Mongoose timestamps

Indexes:
  { rankScore: -1 }          — leaderboard sort (descending)
  { uid: 1 }  (unique: true) — player lookup by UID
```

### 5.2 Game

```
Collection: games

Field                    Type       Required  Default   Constraint
──────────────────────────────────────────────────────────────────
_id                      ObjectId   auto      —         MongoDB primary key
players                  [String]   ✅        —         min 2 UIDs
location.type            String     ✅        —         must equal "Point"
location.coordinates     [Number]   ✅        —         [longitude, latitude]
timestamp                Date       No        now       indexed
score.homeTeam           Number     No        0         integer ≥ 0
score.awayTeam           Number     No        0         integer ≥ 0
mediaURL                 String     No        —         optional URL
createdAt                Date       auto      now       Mongoose timestamps
updatedAt                Date       auto      now       Mongoose timestamps

Indexes:
  { location: '2dsphere' }   — geospatial queries
  { timestamp: 1 }           — time-based sort
```

### 5.3 FriendRequest

```
Collection: friendrequests

Field         Type      Required  Default    Constraint
────────────────────────────────────────────────────────
_id           ObjectId  auto      —          MongoDB primary key
senderUID     String    ✅        —          —
receiverUID   String    ✅        —          must ≠ senderUID
status        String    No        "pending"  enum: pending | accepted
createdAt     Date      auto      now        Mongoose timestamps
updatedAt     Date      auto      now        Mongoose timestamps

Indexes:
  { senderUID: 1, receiverUID: 1 }  unique: true  — prevent duplicates at DB level
```

---

## 6. API Reference

### Base URL
- Development: `http://localhost:3001`
- Health check: `GET /health`

### 6.1 Players — `/api/players`

#### GET /api/players
Returns a paginated, sorted list of all players.

**Query Parameters**

| Param | Type | Default | Description |
|---|---|---|---|
| `sort` | string | `rankScore` | Sort field: `rankScore`, `winRate`, `gamesPlayed` |
| `order` | string | `desc` | Sort direction: `asc`, `desc` |
| `page` | integer | `1` | Page number (1-indexed) |
| `limit` | integer | `20` | Items per page (max 100) |

**Response 200**
```json
{
  "data": [ ...Player ],
  "total": 42,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

---

#### GET /api/players/:uid
**Response 200** — Player object  
**Response 404** — `{ "error": "Player not found" }`

---

#### POST /api/players
**Body (required)**
```json
{
  "uid": "player_001",
  "displayName": "Alex Rivera",
  "rankScore": 1600,
  "winRate": 0.65,
  "gamesPlayed": 20
}
```

**Response 201** — Created Player  
**Response 409** — `{ "error": "Player with uid 'X' already exists" }`  
**Response 422** — `{ "errors": [ { "msg": "...", "path": "..." } ] }`

---

#### PATCH /api/players/:uid
Partial update — only fields present in the body are updated.

**Body (all optional)**
```json
{
  "displayName": "Updated Name",
  "rankScore": 1750,
  "winRate": 0.70,
  "gamesPlayed": 30,
  "avatarURL": "https://example.com/avatar.jpg"
}
```

**Response 200** — Updated Player  
**Response 404** — Player not found  
**Response 422** — Validation errors

---

#### DELETE /api/players/:uid
**Response 204** — No content  
**Response 404** — Player not found

---

### 6.2 Games — `/api/games`

#### GET /api/games

**Query Parameters**

| Param | Type | Default | Description |
|---|---|---|---|
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Items per page (max 100) |
| `playerUID` | string | — | Filter to games containing this player |

**Response 200**
```json
{
  "data": [ ...Game ],
  "total": 150,
  "page": 1,
  "limit": 20,
  "totalPages": 8
}
```

---

#### GET /api/games/:id
**Response 200** — Game object  
**Response 404** — `{ "error": "Game not found" }`  
**Response 422** — Invalid MongoDB ObjectId

---

#### POST /api/games
**Body (required)**
```json
{
  "players": ["player_001", "player_002"],
  "location": {
    "type": "Point",
    "coordinates": [-122.4194, 37.7749]
  },
  "score": {
    "homeTeam": 11,
    "awayTeam": 7
  },
  "timestamp": "2026-07-20T18:00:00Z",
  "mediaURL": "https://example.com/game.mp4"
}
```

**Response 201** — Created Game  
**Response 422** — Validation errors

---

#### DELETE /api/games/:id
**Response 204** — No content  
**Response 404** — Game not found  
**Response 422** — Invalid ObjectId

---

### 6.3 Friend Requests — `/api/friends`

#### GET /api/friends

**Query Parameters**

| Param | Type | Default | Description |
|---|---|---|---|
| `uid` | string | — | Return requests where this user is sender or receiver |

**Response 200** — Array of FriendRequest objects (sorted by `createdAt` desc)

---

#### POST /api/friends
**Body (required)**
```json
{
  "senderUID": "player_001",
  "receiverUID": "player_002"
}
```

**Response 201** — Created FriendRequest  
**Response 409** — Request already exists between these users  
**Response 422** — Validation errors (missing fields, or senderUID = receiverUID)

---

#### PATCH /api/friends/:id
Accept a pending request. Only `"accepted"` is a valid status value.

**Body**
```json
{ "status": "accepted" }
```

**Response 200** — Updated FriendRequest  
**Response 404** — Request not found  
**Response 422** — Invalid ObjectId or invalid status value

---

#### DELETE /api/friends/:id
**Response 204** — No content  
**Response 404** — Request not found  
**Response 422** — Invalid ObjectId

---

### 6.4 Standard Error Response Shape

```json
{
  "error": "Human-readable message",
  "stack": "Error: ...\n    at ..."   ← development only
}
```

```json
{
  "errors": [
    {
      "type": "field",
      "msg": "players must be an array with at least 2 entries",
      "path": "players",
      "location": "body",
      "value": ["alice"]
    }
  ]
}
```

---

## 7. Validation Rules Summary

### Players
| Field | Rule |
|---|---|
| `uid` | Required, non-empty string |
| `displayName` | Required, string, min 2 chars |
| `rankScore` | Optional, float 0–9999 |
| `winRate` | Optional, float 0.0–1.0 |
| `gamesPlayed` | Optional, integer ≥ 0 |

### Games
| Field | Rule |
|---|---|
| `players` | Required array, min 2 string elements |
| `location.type` | Required, must equal `"Point"` |
| `location.coordinates` | Required, array of exactly 2 floats `[lon, lat]` |
| `score.homeTeam` | Required, integer ≥ 0 |
| `score.awayTeam` | Required, integer ≥ 0 |

### Friend Requests
| Field | Rule |
|---|---|
| `senderUID` | Required, non-empty string |
| `receiverUID` | Required, non-empty string, must ≠ `senderUID` |
| `status` (PATCH) | Required, must equal `"accepted"` |

---

## 8. Security Measures

| Measure | Implementation | Purpose |
|---|---|---|
| Security headers | `helmet()` | XSS, clickjacking, MIME sniffing protection |
| Framework fingerprint | `app.disable('x-powered-by')` | Hide Express version from attackers |
| CORS whitelist | `cors({ origin: [...] })` from env | Prevent cross-origin requests from unknown domains |
| Rate limiting | `express-rate-limit` on `/api/*` | Prevent brute-force and DoS |
| Body size limit | `express.json({ limit: '10kb' })` | Prevent payload-based memory attacks |
| Input validation | `express-validator` chains | Reject malformed/dangerous input before DB queries |
| DB-level uniqueness | Compound index on FriendRequest | Prevent race-condition duplicates |
| Secret management | `dotenv` + `.env.example` | No secrets in source control |
| Error information | Stack stripped in production | Prevent internal path/logic leakage |

---

## 9. Database Indexes

| Collection | Index | Type | Purpose |
|---|---|---|---|
| `players` | `{ uid: 1 }` | unique | Fast player lookup by UID |
| `players` | `{ rankScore: -1 }` | standard | Leaderboard queries |
| `games` | `{ location: '2dsphere' }` | geospatial | Geo proximity queries |
| `games` | `{ timestamp: 1 }` | standard | Time-sorted game list |
| `friendrequests` | `{ senderUID: 1, receiverUID: 1 }` | unique | Prevent duplicate requests |

---

## 10. Startup & Shutdown

### Startup Sequence

```
node server.js
  1. require('dotenv').config()          → load .env
  2. connectDB()                         → attempt MongoDB connect (up to 5 retries, 3s apart)
  3. app.listen(PORT)                    → begin accepting HTTP requests
  4. Log: "Server running in X mode on port Y"
```

### Graceful Shutdown

```
SIGTERM or SIGINT received
  1. server.close(callback)             → stop accepting new connections
  2. In-flight requests drain           → wait for active requests to finish
  3. callback fires: process.exit(0)   → clean exit
```

---

## 11. Development Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start with nodemon — auto-restarts on file changes |
| `npm start` | Start for production — no file watching |
| `npm run seed` | Wipe DB and insert 10 seed players + 20 seed games |

---

## 12. Future Enhancements

| Feature | Notes |
|---|---|
| JWT Authentication | Add `jsonwebtoken` + auth middleware to protect write endpoints |
| Rank recalculation | Cloud Function / cron job: recalculate `rankScore` and `winRate` after each game |
| Real-time updates | Add `socket.io` for live leaderboard push events |
| Avatar upload | Add `multer` + S3/Cloudinary integration for player profile images |
| Search | Add `$text` index on `displayName` for full-text player search |
| Rate limit per user | Replace IP-based limit with token-based once auth is added |
| Docker | Add `Dockerfile` + `docker-compose.yml` for containerised deployment |
