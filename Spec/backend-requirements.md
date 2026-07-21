# Backend Requirements — Pickleball Tracking App

**Version:** 1.0  
**Date:** 2026-07-20  
**Status:** Implemented ✅

---

## 1. Introduction

The Pickleball Tracking App backend is a production-ready REST API that serves player statistics, game history, and social friend-request features to the React frontend. It is built on Node.js + Express + MongoDB and deployed as a standalone service.

---

## 2. Glossary

| Term | Definition |
|---|---|
| **Player** | A registered pickleball player identified by a unique `uid` string |
| **Game** | A logged pickleball match between 2 or more players at a geo-located court |
| **FriendRequest** | A directional social connection request between two players |
| **RankScore** | An integer (default 1500) representing a player's computed skill ranking |
| **WinRate** | A float 0.0–1.0 representing the ratio of wins to games played |
| **GeoJSON Point** | A location encoded as `{ type: "Point", coordinates: [longitude, latitude] }` |
| **UID** | A caller-supplied string identifier for a player (not MongoDB's `_id`) |
| **Pagination** | Server-side data slicing via `page` and `limit` query parameters |

---

## 3. Functional Requirements

### 3.1 Player Management

| ID | Requirement |
|---|---|
| P-01 | The API SHALL expose `GET /api/players` returning a paginated, sortable list of all players |
| P-02 | The API SHALL support sorting players by `rankScore`, `winRate`, or `gamesPlayed` in ascending or descending order |
| P-03 | The API SHALL expose `GET /api/players/:uid` returning a single player by their `uid` field |
| P-04 | The API SHALL return HTTP 404 when a requested player UID does not exist |
| P-05 | The API SHALL expose `POST /api/players` to create a new player |
| P-06 | The API SHALL return HTTP 409 if a player with the same `uid` already exists |
| P-07 | The API SHALL expose `PATCH /api/players/:uid` for partial updates (only provided fields are updated) |
| P-08 | The API SHALL prevent patching immutable fields: `uid`, `_id`, `__v`, `createdAt`, `updatedAt` |
| P-09 | The API SHALL expose `DELETE /api/players/:uid` returning HTTP 204 on success |
| P-10 | Player creation SHALL require `uid` (non-empty string) and `displayName` (min 2 chars) |
| P-11 | `rankScore` SHALL default to 1500, `winRate` to 0.5, `gamesPlayed` to 0 if not provided |

### 3.2 Game Management

| ID | Requirement |
|---|---|
| G-01 | The API SHALL expose `GET /api/games` returning a paginated list sorted by `timestamp` descending |
| G-02 | The API SHALL support filtering games by `playerUID` query param (returns games that include that player) |
| G-03 | The API SHALL expose `GET /api/games/:id` by MongoDB ObjectId |
| G-04 | The API SHALL return HTTP 404 when a requested game ID does not exist |
| G-05 | The API SHALL expose `POST /api/games` to log a new game |
| G-06 | Game creation SHALL require `players` (array of at least 2 UIDs), `location` (GeoJSON Point), and `score` (homeTeam + awayTeam integers ≥ 0) |
| G-07 | The API SHALL return HTTP 422 if `players` has fewer than 2 entries |
| G-08 | The API SHALL return HTTP 422 if `location.type` is not `"Point"` or `coordinates` is not an array of exactly 2 numbers |
| G-09 | The API SHALL return HTTP 422 if scores are not non-negative integers |
| G-10 | `timestamp` SHALL default to the current server time if not provided |
| G-11 | The API SHALL expose `DELETE /api/games/:id` returning HTTP 204 on success |
| G-12 | The API SHALL validate that the `:id` path param is a valid MongoDB ObjectId before querying |

### 3.3 Friend Request Management

| ID | Requirement |
|---|---|
| F-01 | The API SHALL expose `GET /api/friends` returning all friend requests |
| F-02 | The API SHALL support filtering by `uid` query param (returns requests where user is sender or receiver) |
| F-03 | The API SHALL expose `POST /api/friends` to create a new friend request with default `status: "pending"` |
| F-04 | The API SHALL return HTTP 409 if a request already exists between the two UIDs in either direction |
| F-05 | The API SHALL return HTTP 422 if `senderUID` and `receiverUID` are the same value |
| F-06 | The API SHALL expose `PATCH /api/friends/:id` to accept a request (only `status: "accepted"` is permitted) |
| F-07 | The API SHALL return HTTP 404 if the friend request ID does not exist on PATCH or DELETE |
| F-08 | The API SHALL expose `DELETE /api/friends/:id` returning HTTP 204 on success |
| F-09 | The API SHALL validate that `:id` path params are valid MongoDB ObjectIds |

### 3.4 Cross-Cutting Requirements

| ID | Requirement |
|---|---|
| X-01 | The API SHALL expose `GET /health` returning `{ status: "ok", timestamp: ISO8601 }` |
| X-02 | All validation failures SHALL return HTTP 422 with a structured `{ errors: [...] }` body |
| X-03 | All server errors SHALL return a JSON `{ error: message }` body — never raw HTML |
| X-04 | Stack traces SHALL only appear in `development` mode — never in `production` |
| X-05 | All endpoints SHALL be rate-limited (default: 100 requests per 15-minute window per IP) |
| X-06 | The server SHALL respond to CORS requests from configured origins only |
| X-07 | The server SHALL hide the `X-Powered-By: Express` header |
| X-08 | All routes not matching a defined path SHALL return HTTP 404 with a descriptive JSON error |
| X-09 | The server SHALL handle `SIGTERM` and `SIGINT` with a graceful shutdown (drain in-flight requests before exit) |
| X-10 | MongoDB connection SHALL retry up to 5 times before exiting the process |

---

## 4. Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|
| NF-01 | Performance | List responses SHALL use server-side pagination (max 100 items per page) |
| NF-02 | Performance | Response bodies SHALL be gzip-compressed |
| NF-03 | Security | All request bodies SHALL be limited to 10 KB to prevent payload flooding |
| NF-04 | Security | Security headers SHALL be set via `helmet` |
| NF-05 | Security | The MongoDB connection string SHALL be read from environment variables, never hardcoded |
| NF-06 | Reliability | Database indexes SHALL exist on `rankScore` (leaderboard), `timestamp` (games), and GeoJSON `2dsphere` (location queries) |
| NF-07 | Maintainability | Duplicate friend requests SHALL be enforced at the database level via a compound unique index |
| NF-08 | Observability | HTTP requests SHALL be logged via `morgan` in `dev` format (development) and `combined` format (production) |
| NF-09 | Compatibility | The server SHALL require Node.js >= 18 |
| NF-10 | Developer Experience | The server SHALL support hot-reload via `nodemon` in development |

---

## 5. Environment Configuration

All configuration is injected via environment variables. No secrets are hardcoded.

| Variable | Default | Required | Description |
|---|---|---|---|
| `NODE_ENV` | `development` | No | Runtime environment |
| `PORT` | `3001` | No | HTTP port |
| `MONGODB_URI` | — | **Yes** | Full MongoDB connection string |
| `CORS_ORIGINS` | `http://localhost:5173` | No | Comma-separated allowed origins |
| `RATE_LIMIT_WINDOW_MS` | `900000` (15 min) | No | Rate-limit window in ms |
| `RATE_LIMIT_MAX` | `100` | No | Max requests per window per IP |

---

## 6. Out of Scope (v1.0)

- User authentication / JWT tokens
- Player rank recalculation after game creation
- Real-time WebSocket updates
- File upload for avatars or media
- Tournament bracket management
- Admin dashboard / role-based access
