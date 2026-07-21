# Frontend Requirements — Pickleball Tracking App

**Version:** 1.0  
**Date:** 2026-07-20  
**Status:** Implemented ✅

---

## 1. Introduction

The Pickleball Tracking App frontend is a React web application that connects to the Node.js/Express backend over HTTP. It enables players to view their standings, browse game history, manage social connections, and log new matches — all through a polished, mobile-first, accessible interface.

---

## 2. Glossary

| Term | Definition |
|---|---|
| **Player** | A registered user with a `uid`, `displayName`, `rankScore`, `winRate`, `gamesPlayed`, and optional `avatarURL` |
| **Game** | A logged pickleball match with players, location, score, and optional media |
| **FriendRequest** | A client-side social connection request between two players (`pending` or `accepted`) |
| **RankScore** | An integer representing a player's skill ranking (default 1500) |
| **WinRate** | A float 0.0–1.0 representing win percentage |
| **Theme** | The active color mode — `"light"` or `"dark"` |
| **Toast** | A brief non-blocking notification shown after a user action |
| **SkeletonLoader** | Animated placeholder UI shown while data is fetching |
| **EmptyState** | A contextual illustration + message shown when a list has no items |
| **GeoPoint** | A GeoJSON Point: `{ type: "Point", coordinates: [longitude, latitude] }` |
| **QueryCache** | TanStack React Query's in-memory cache of server data |
| **SortKey** | One of `rankScore`, `winRate`, or `gamesPlayed` — used to sort the leaderboard |

---

## 3. Functional Requirements

### 3.1 Navigation

| ID | Requirement |
|---|---|
| N-01 | The app SHALL provide a `BottomTabBar` with 5 tabs on mobile: Dashboard, Leaderboard, Games, Friends, Add Game |
| N-02 | The app SHALL replace the `BottomTabBar` with a top `NavBar` on viewports ≥ 768px |
| N-03 | The active tab/link SHALL have a distinct visual indicator (brand green color + heavier icon stroke) |
| N-04 | Navigating between tabs SHALL use React Router v6 client-side routing — no full page reloads |
| N-05 | All route transitions SHALL animate with Framer Motion (fade + slide, 250ms) |
| N-06 | All screen components SHALL be lazy-loaded via `React.lazy()` and wrapped in `Suspense` |
| N-07 | Navigating to an undefined route SHALL render a 404 Not Found page with a link back to Dashboard |

### 3.2 Theme

| ID | Requirement |
|---|---|
| T-01 | The app SHALL support `"light"` and `"dark"` themes |
| T-02 | Toggling the theme SHALL update all UI components immediately by toggling `class="dark"` on `<html>` |
| T-03 | The selected theme SHALL be persisted to `localStorage` under the key `pb-theme` |
| T-04 | On first load with no stored preference, the app SHALL default to the system `prefers-color-scheme` |
| T-05 | A theme toggle button (Sun/Moon icon) SHALL be available in the desktop `NavBar` |

### 3.3 Dashboard Screen (`/`)

| ID | Requirement |
|---|---|
| D-01 | The Dashboard SHALL fetch players from `GET /api/players` and games from `GET /api/games` via React Query |
| D-02 | The Dashboard SHALL display 3 hero stat cards: total players, total games, top-ranked player name + score |
| D-03 | The Dashboard SHALL display a leaderboard preview of the top 5 players sorted by `rankScore` descending |
| D-04 | The Dashboard SHALL display a recent games feed showing the 5 most recently created games |
| D-05 | While data is loading, ALL sections SHALL display `SkeletonLoader` placeholders |
| D-06 | If a query errors, the affected section SHALL display an inline error message with a Retry button |
| D-07 | Clicking a player in the leaderboard preview SHALL navigate to `/players/:uid` |
| D-08 | Hero stat cards SHALL use glassmorphism styling |

### 3.4 Leaderboard Screen (`/leaderboard`)

| ID | Requirement |
|---|---|
| L-01 | The Leaderboard SHALL fetch all players from `GET /api/players` |
| L-02 | Players SHALL be displayed sorted descending by the active `SortKey` (default: `rankScore`) |
| L-03 | Each player row SHALL show: rank number, avatar, display name, rank score, win rate %, games played |
| L-04 | The Leaderboard SHALL provide a text search input that filters players by `displayName` (case-insensitive) |
| L-05 | The Leaderboard SHALL provide a sort dropdown with options: Rank Score, Win Rate, Games Played |
| L-06 | When the filtered list is empty, the screen SHALL show an `EmptyState` with a relevant icon and message |
| L-07 | Clicking a player row SHALL navigate to `/players/:uid` |
| L-08 | While loading, the screen SHALL show 8 `SkeletonLoader` list-item placeholders |

### 3.5 Player Profile Screen (`/players/:uid`)

| ID | Requirement |
|---|---|
| PR-01 | The Profile screen SHALL read the `:uid` param from the URL |
| PR-02 | The Profile screen SHALL fetch all players and all games, then filter client-side by UID |
| PR-03 | The Profile screen SHALL display the player's avatar (or an initial-based fallback), display name, and UID |
| PR-04 | The Profile screen SHALL display 3 stat cards: Rank Score, Win Rate, Games Played |
| PR-05 | The Profile screen SHALL display a game history list filtered to games containing this player's UID, sorted by timestamp descending |
| PR-06 | Each game history entry SHALL show: score, formatted timestamp, and count of other players |
| PR-07 | If the player UID is not found, the screen SHALL show a "Player not found" message with a link back to Leaderboard |
| PR-08 | While loading, the screen SHALL show a profile `SkeletonLoader` |

### 3.6 Games Screen (`/games`)

| ID | Requirement |
|---|---|
| G-01 | The Games screen SHALL fetch all games from `GET /api/games` |
| G-02 | Games SHALL be displayed sorted by `timestamp` descending |
| G-03 | Each `GameCard` SHALL show: home/away score, player count, formatted date/time, and location coordinates |
| G-04 | If a game has a `mediaURL`, the `GameCard` SHALL render a clickable media link |
| G-05 | On mobile viewports, each `GameCard` SHALL support horizontal swipe (left) to reveal a Details action via Framer Motion `drag="x"` |
| G-06 | Cards SHALL animate in with staggered entry (opacity + slide up, 50ms stagger) |
| G-07 | When the list is empty, the screen SHALL show an `EmptyState` with a "Log a Game" button navigating to `/add-game` |
| G-08 | While loading, the screen SHALL show 5 `SkeletonLoader` card placeholders |

### 3.7 Friends Screen (`/friends`)

| ID | Requirement |
|---|---|
| FR-01 | Friend request state SHALL be managed entirely client-side in Zustand, persisted to `localStorage` under key `pb-friends` |
| FR-02 | The Friends screen SHALL display the current session UID (default: `"player-1"`) |
| FR-03 | The Friends screen SHALL list all accepted friend requests involving the current user |
| FR-04 | The Friends screen SHALL list all pending incoming requests where `receiverUID === currentUID` |
| FR-05 | Each pending request SHALL have Accept and Reject buttons |
| FR-06 | Accepting a request SHALL update its `status` to `"accepted"` in the store and show a success Toast |
| FR-07 | Rejecting a request SHALL remove it from the store and show an info Toast |
| FR-08 | The Friends screen SHALL provide a UID input form to send a new friend request |
| FR-09 | Sending a request SHALL validate that the UID exists in the fetched players list |
| FR-10 | Sending a duplicate request (same pair in either direction) SHALL be blocked with an inline error |
| FR-11 | Sending a request to oneself SHALL be blocked with an inline error |
| FR-12 | When the accepted friends list is empty, the screen SHALL show an `EmptyState` |

### 3.8 Add Game Screen (`/add-game`)

| ID | Requirement |
|---|---|
| AG-01 | The Add Game form SHALL fetch all players to populate the player selector |
| AG-02 | The form SHALL include: multi-select player picker, home score input, away score input, location field, optional media URL input |
| AG-03 | The location field SHALL invoke `navigator.geolocation.getCurrentPosition` when the user clicks "Detect My Location" |
| AG-04 | While geolocation is pending, the button SHALL show a spinner |
| AG-05 | If geolocation is denied or unavailable, the form SHALL display an error and show manual latitude/longitude inputs |
| AG-06 | On submit, the form SHALL validate: at least 2 players selected, both scores are non-negative integers, location is set |
| AG-07 | If validation fails, the form SHALL display inline field-level errors and NOT submit |
| AG-08 | On valid submit, the form SHALL call `POST /api/games` via React Query mutation |
| AG-09 | On success, the form SHALL show a success Toast, invalidate the games cache, and navigate to `/games` |
| AG-10 | On API error, the form SHALL show an error Toast and leave the form populated |
| AG-11 | While submitting, the submit button SHALL show a spinner and be disabled |

### 3.9 UI Quality & Accessibility

| ID | Requirement |
|---|---|
| A-01 | The app SHALL use a pickleball-themed color palette centered on brand green (`#22c55e`) |
| A-02 | Glassmorphism styling (`backdrop-blur`, semi-transparent background, subtle border) SHALL be applied to stat cards |
| A-03 | All data-dependent sections SHALL show `SkeletonLoader` while the corresponding query is loading |
| A-04 | All list/data screens SHALL show a contextual `EmptyState` (icon + title + description) when data is absent |
| A-05 | Toast notifications SHALL appear for: game logged, friend request sent, request accepted, request rejected |
| A-06 | All icon-only interactive elements SHALL have an `aria-label` |
| A-07 | All `<img>` elements SHALL have descriptive `alt` attributes |
| A-08 | All form inputs SHALL have associated `<label>` elements (via `htmlFor` or `aria-labelledby`) |
| A-09 | Keyboard navigation SHALL be fully supported with visible `:focus-visible` ring indicators |
| A-10 | Toast notifications SHALL be announced to screen readers via `aria-live="polite"` |
| A-11 | The app SHALL be functional on viewports from 320px (mobile) to 1440px (desktop) |
| A-12 | Color contrast SHALL meet WCAG AA minimum (4.5:1 for normal text) in both themes |

---

## 4. Non-Functional Requirements

| ID | Category | Requirement |
|---|---|---|
| NF-01 | Performance | All screen components SHALL be code-split via `React.lazy()` to minimize initial bundle size |
| NF-02 | Performance | React Query SHALL cache server data for 30 seconds (`staleTime: 30_000`) before refetching |
| NF-03 | Performance | React Query SHALL retry failed requests up to 2 times before surfacing an error |
| NF-04 | Performance | All client-side data operations (sort, filter) SHALL be pure functions that do not mutate the cache |
| NF-05 | Reliability | The app SHALL proxy `/api/*` requests to `http://localhost:3001` via Vite dev server proxy |
| NF-06 | Maintainability | All TypeScript types SHALL be co-located in `src/types/index.ts` |
| NF-07 | Maintainability | All API calls SHALL go through functions in `src/api/` — never inline `fetch()` in components |
| NF-08 | Maintainability | All Zustand stores SHALL be in `src/store/` — one file per domain |
| NF-09 | Testability | The build SHALL produce zero TypeScript compilation errors (`tsc --noEmit`) |
| NF-10 | Testability | Unit and property tests SHALL use Vitest + React Testing Library + fast-check |
| NF-11 | Developer Experience | The dev server SHALL start with `npm run dev` on port 5173 |
| NF-12 | Build | The production build (`npm run build`) SHALL complete without errors |

---

## 5. Out of Scope (v1.0)

- User authentication (login/logout/JWT)
- Player avatar upload
- Real-time score updates via WebSocket
- Push notifications
- Tournament bracket management
- Admin panel
- Server-side rendering (SSR)
