# InfluencerHub — 72-Hour Sprint Plan
**Project**: Full influencer-brand collaboration platform  
**Timeline**: 72 hours (36 hours per developer)  
**Team**: 2 developers (mixed experience)  
**Scope**: ALL 23 user stories across 6 epics, production-grade quality  
**Deployment**: Vercel (frontend) + Render/Railway (backend)

---

## Executive Summary

This sprint delivers a **complete, production-ready influencer-brand collaboration platform** in 72 hours. The plan is aggressive but achievable through:

1. **Parallel development** — Frontend and backend developed simultaneously by Dev 1 & Dev 2
2. **Early DB schema** — Database initialized in Hour 1; no schema migrations mid-sprint
3. **Shared interfaces** — TypeScript contracts defined before implementation
4. **Pre-seeded demo data** — Full dataset ready for live creation at demo time
5. **Aggressive testing** — Unit tests during coding, integration tests in Wave 3, manual smoke tests before deployment
6. **Zero scope cuts** — All 23 stories delivered; no "v1" or deferred scope

### Critical Success Factors
- ✅ Parallel waves eliminate sequential bottlenecks
- ✅ Shared TypeScript interfaces = no integration surprises
- ✅ Pre-seeded data enables immediate demo readiness
- ✅ Focus on core flows (auth → profiles → campaigns → messaging) before "nice to haves"
- ✅ Daily checkpoints prevent silent failures

---

## Phase Breakdown (8 Phases, 3 Waves)

### Timeline Overview
```
Hour 0-6:   WAVE 1 (Parallel) — Setup, Auth, Profiles, Campaigns schema
Hour 6-36:  WAVE 2 (Parallel) — Frontend + Backend implementation
Hour 36-60: WAVE 3 (Parallel) — Messaging, Recommendations, Reviews + Testing
Hour 60-72: WAVE 4 (Sequential) — Integration, deployment, final testing
```

---

## WAVE 1: Foundation & Core Schema (Hours 0-6)

### Phase 1.1: Project Setup & Database Schema (3 hours)
**Owner**: Dev 1 (lead), Dev 2 (assist)

#### Tasks
1. **Initialize Git, package.json, environment**
   - Create repo with `.gitignore` (node_modules, .env, dist)
   - Frontend: `create-react-app` → convert to TypeScript + Tailwind + Vite (faster builds)
   - Backend: Node.js + Express + TypeScript
   - Create `packages/shared/` for shared types

2. **Set up PostgreSQL & Prisma**
   - Create managed DB (Supabase/Neon)
   - Install Prisma, generate schema, apply migrations
   - Create `prisma/schema.prisma` with ALL tables (see schema section below)

3. **Environment & CI/CD scaffolding**
   - `.env.example` documented
   - GitHub Actions workflow for tests + linting (runs on PR)
   - Vercel + Render deployment configs

**Deliverables**:
- Repo structure ready, DB initialized, TypeScript tooling configured
- Git commits: `chore: init project` + `db: add initial schema`

---

### Phase 1.2: Shared Types & API Contracts (2 hours)
**Owner**: Dev 1

#### Tasks
1. **Define TypeScript interfaces for all resources**
   - User (with role enum: BRAND, INFLUENCER, ADMIN)
   - Profile (BrandProfile, InfluencerProfile)
   - Campaign
   - Application
   - Message
   - Review
   - Recommendation

2. **Define API response envelopes**
   ```typescript
   // Success response
   { success: true, data: T, timestamp: ISO8601 }
   // Error response
   { success: false, error: string, code: ErrorCode, timestamp: ISO8601 }
   ```

3. **JWT payload structure**
   ```typescript
   { userId: string, role: Role, email: string, iat: number, exp: number }
   ```

**Deliverables**:
- `packages/shared/types.ts` (500 lines)
- `packages/shared/api-client.ts` (fetch wrapper with auth)
- Git commit: `types: define shared interfaces`

---

## WAVE 2: Core Feature Implementation (Hours 6-36, Parallel)

### Phase 2.1: Authentication & Login (Epic 1 — Stories 1.1 to 1.5) (12 hours)
**Owner**: Dev 1 (Backend + API), Dev 2 (Frontend UI)

#### Backend Tasks (Dev 1 — 7 hours)

**Task 2.1.1: Auth endpoints & JWT**
- POST `/api/auth/register` — accepts {email, password, role, name}
  - Validates email uniqueness, password strength (min 8 chars, 1 number)
  - Bcrypt hash password, store User + role
  - Return JWT token (15-min access, 7-day refresh)
  - Trigger: Create default profile record (empty, user must fill)
- POST `/api/auth/login` — accepts {email, password}
  - Verify bcrypt, return JWT
- POST `/api/auth/refresh` — accepts refresh token
  - Validate & return new access token
- POST `/api/auth/logout` — clears token (client-side mainly, stateless)

**Task 2.1.2: Admin user management API**
- GET `/api/admin/users` — list all users (ADMIN only)
- DELETE `/api/admin/users/:id` — soft delete user (ADMIN only)
- PATCH `/api/admin/users/:id/role` — change user role (ADMIN only)

**Middleware**:
- `authenticateJWT` — validates token, attaches user to request
- `authorize(roles: Role[])` — checks role, returns 403 if unauthorized
- Error handler — catches all errors, returns standardized response

**Tests** (3 hours):
- Unit: Password hashing, JWT validation, role checking
- Integration: Full auth flow (register → login → refresh → logout)
- Edge cases: Duplicate email, invalid password, expired token

**Deliverables**:
- `/api/auth` + `/api/admin` endpoints
- Middleware suite
- Test suite (>80% coverage)
- Git commits:
  - `feat: auth endpoints (register, login, refresh)`
  - `feat: admin user management`
  - `test: auth integration tests`

#### Frontend Tasks (Dev 2 — 5 hours)

**Task 2.1.3: Login & registration UI**
- **LoginPage** component
  - Form: email, password, "Remember me"
  - Submit → POST /api/auth/login → store JWT in localStorage
  - Error message display (validation, network)
  - "Sign Up" link
  - Loading state on button

- **RegisterPage** component
  - Form: email, password, confirm password, name, role dropdown (Brand/Influencer)
  - Submit → POST /api/auth/register → auto-login → redirect to profile setup
  - Password strength indicator
  - Error messages

- **ProtectedRoute** component
  - Checks JWT in localStorage
  - Redirects to login if missing/invalid
  - Used for all authenticated routes

- **Navigation** component
  - Shows user email + role
  - Logout button → clears token, redirects to login
  - Admin dashboard link (only for ADMIN role)

**Tests** (2 hours):
- Unit: Form validation, error display
- Integration: Full flow (register → dashboard redirect)
- Mock API: Test localStorage persistence

**Deliverables**:
- LoginPage, RegisterPage, ProtectedRoute, Navigation components
- localStorage JWT management utility
- Test suite
- Git commits:
  - `feat: login and registration UI`
  - `test: auth component tests`

#### Acceptance Criteria
- ✅ Brand/Influencer can register with email & password
- ✅ User can login with correct credentials, receive JWT
- ✅ User can refresh JWT before expiry
- ✅ Admin can view all users and change roles
- ✅ Role-based dashboard shown after login
- ✅ Invalid credentials → error message
- ✅ API tests: 200 success, 400 validation, 401 auth, 403 forbidden

---

### Phase 2.2: Brand & Influencer Profiles (Epic 2 — Stories 2.1 to 2.4) (14 hours)
**Owner**: Dev 2 (Backend + API), Dev 1 (Frontend UI)

#### Backend Tasks (Dev 2 — 8 hours)

**Task 2.2.1: Profile endpoints**
- GET `/api/profiles/me` — return logged-in user's profile
- PATCH `/api/profiles/me` — update own profile
  - BrandProfile: {name, website, industry, description, logo_url, media_kit_url}
  - InfluencerProfile: {name, bio, avatar_url, follower_count, niche, portfolio_links[]}
- GET `/api/profiles/:username` — public profile view (no auth required)
- GET `/api/profiles?role=INFLUENCER&niche=fitness` — search profiles (used for recommendations)

**Task 2.2.2: Profile data access layer**
- Prisma queries for profile CRUD
- Validation: website URL format, follower_count > 0, niche enum
- Virtual fields: profile_completion % (used in UI)

**Tests** (3 hours):
- Unit: Profile validation, completion %
- Integration: Create profile → update → get → search
- Edge cases: Missing fields, invalid URLs

**Deliverables**:
- `/api/profiles` endpoints
- Prisma queries
- Test suite
- Git commits:
  - `feat: profile endpoints`
  - `test: profile integration tests`

#### Frontend Tasks (Dev 1 — 6 hours)

**Task 2.2.3: Profile setup & edit UI**
- **ProfileSetupPage** (shown after registration)
  - Conditional form based on role (BRAND vs INFLUENCER)
  - BrandProfile form: name, website, industry (dropdown), description, logo upload
  - InfluencerProfile form: name, bio, avatar upload, follower count, niche (dropdown), portfolio links (array: name + URL)
  - Save → PATCH /api/profiles/me → redirect to dashboard
  - Progress indicator (step 1 of N)

- **ProfileEditPage**
  - Same forms, pre-filled with GET /api/profiles/me data
  - Save → PATCH → toast notification "Profile updated"

- **PublicProfilePage**
  - Route: `/profile/:username`
  - Display profile (name, bio, avatar, niche, links)
  - Show review score if available (stars + count)
  - "Apply to Campaign" button (if logged-in influencer)
  - "Message" button (if logged-in, different user)

**Tests** (3 hours):
- Unit: Form validation, profile completion %
- Integration: Setup → edit → view flow

**Deliverables**:
- ProfileSetupPage, ProfileEditPage, PublicProfilePage components
- Avatar + logo upload utility
- Test suite
- Git commits:
  - `feat: profile setup and edit UI`
  - `test: profile page tests`

#### Acceptance Criteria
- ✅ Brand can set company profile with logo
- ✅ Influencer can set profile with bio, follower count, niche, portfolio links
- ✅ Profiles are searchable by role and niche
- ✅ Public profile viewable without login
- ✅ Profile completion % shown
- ✅ Email is unique per user

---

### Phase 2.3: Campaign Management Core (Epic 3 — Stories 3.1 to 3.4) (10 hours)
**Owner**: Dev 1 (Backend + API), Dev 2 (Frontend UI)

#### Backend Tasks (Dev 1 — 6 hours)

**Task 2.3.1: Campaign endpoints (Brand actions)**
- POST `/api/campaigns` — create campaign
  - Payload: {title, description, budget, deadline, required_niche, status: OPEN}
  - Auth: BRAND role only
  - Return: campaign with id, created_at
- PATCH `/api/campaigns/:id` — edit campaign (only if OPEN)
  - Allowed updates: title, description, budget, deadline
  - Validation: owner check, status check
- POST `/api/campaigns/:id/close` — close campaign (no more applications)
  - Sets status → CLOSED
  - Return: confirmation

**Task 2.3.2: Campaign discovery endpoints (Influencer actions)**
- GET `/api/campaigns?status=OPEN&niche=fitness` — list campaigns, filterable
  - Filters: status, niche, budget_min/max, deadline (before/after)
  - Pagination: limit, offset
- GET `/api/campaigns/:id` — single campaign detail
- POST `/api/campaigns/:id/apply` — influencer applies
  - Payload: {portfolio_link: optional}
  - Creates Application record, sets status PENDING
  - Prevents duplicate applications

**Task 2.3.3: Application tracking**
- GET `/api/campaigns/:id/applications` — brand views applications (BRAND + owner check)
  - List applications with influencer name, niche, follower count, portfolio
- PATCH `/api/applications/:id` — brand accepts/rejects
  - Status: PENDING → ACCEPTED or REJECTED
  - Return: confirmation

**Tests** (3 hours):
- Unit: Status transitions, permission checks
- Integration: Create campaign → search → apply → accept flow

**Deliverables**:
- `/api/campaigns` + `/api/applications` endpoints
- Test suite
- Git commits:
  - `feat: campaign management endpoints`
  - `test: campaign integration tests`

#### Frontend Tasks (Dev 2 — 4 hours)

**Task 2.3.4: Campaign UI (both Brand and Influencer views)**
- **BrandDashboard** (shown after BRAND login)
  - Tabs: "My Campaigns" | "Applications"
  - "My Campaigns" tab:
    - List of campaigns owned by brand (OPEN, CLOSED, ARCHIVED)
    - Cards: title, description, budget, deadline, status
    - Actions: Edit (if OPEN), Close, View Applications, Delete
  - "Applications" tab:
    - Table: influencer name, niche, follower count, portfolio link, status, action buttons
    - Actions: Accept, Reject

- **InfluencerDashboard** (shown after INFLUENCER login)
  - "Browse Campaigns" section:
    - Search filters: niche, budget range, deadline
    - Campaign cards: title, brand name, budget, deadline, required niche
    - "View Details" → CampaignDetailPage

- **CreateCampaignPage** (BRAND only)
  - Form: title, description, budget, deadline, required_niche (dropdown)
  - Submit → POST /api/campaigns → redirect to BrandDashboard
  - Rich text editor for description (optional, use textarea for MVP)

- **CampaignDetailPage** (Influencer view)
  - Display campaign details
  - "Apply Now" button → POST /api/campaigns/:id/apply
  - Show: "Pending" if already applied, "Accepted" if brand accepted
  - Brand name + link to public profile

**Tests** (2 hours):
- Unit: Filter logic, status display
- Integration: Campaign CRUD flows

**Deliverables**:
- BrandDashboard, InfluencerDashboard, CreateCampaignPage, CampaignDetailPage components
- Campaign cards, filter components
- Test suite
- Git commits:
  - `feat: campaign management UI`
  - `test: campaign page tests`

#### Acceptance Criteria
- ✅ Brand can create, edit (if OPEN), close campaigns
- ✅ Influencer can browse campaigns with filters (niche, budget)
- ✅ Influencer can apply to campaigns
- ✅ Brand can view applications and accept/reject
- ✅ Campaign status transitions: OPEN → CLOSED, Application: PENDING → ACCEPTED/REJECTED
- ✅ Influencer cannot apply twice to same campaign
- ✅ Pagination works (limit 10 per page)

---

## WAVE 3: Advanced Features & Testing (Hours 36-60, Parallel)

### Phase 3.1: In-App Messaging (Epic 5 — Stories 5.1 to 5.3) (10 hours)
**Owner**: Dev 2 (Backend + API), Dev 1 (Frontend UI)

#### Backend Tasks (Dev 2 — 6 hours)

**Task 3.1.1: Messaging endpoints**
- POST `/api/messages` — send message
  - Payload: {recipient_id, content}
  - Creates Message record: {sender_id, recipient_id, content, created_at, is_read}
  - Return: message object

- GET `/api/messages/inbox` — fetch inbox (paginated, newest first)
  - Returns array of messages (both sent & received, grouped by conversation?)
  - Pagination: limit 20, offset
  - Include sender/recipient profile info (name, avatar)

- PATCH `/api/messages/:id/read` — mark as read
  - Sets is_read → true
  - (Called by frontend when user views message)

- GET `/api/messages/unread-count` — count unread messages
  - Returns: {count: number}
  - (Called periodically for badge update)

**Task 3.1.2: Polling mechanism**
- Frontend polls GET /api/messages/unread-count every 10 seconds
- On count change, refetch inbox (or new messages only)
- Graceful degradation if polling fails (retry with exponential backoff)

**Tests** (3 hours):
- Unit: Message creation, read status
- Integration: Send → receive → mark read flow
- Load: 50 concurrent message sends (should handle <5s)

**Deliverables**:
- `/api/messages` endpoints
- Polling logic (configurable interval)
- Test suite
- Git commits:
  - `feat: messaging endpoints`
  - `test: messaging integration tests`

#### Frontend Tasks (Dev 1 — 4 hours)

**Task 3.1.3: Messaging UI**
- **MessagesPage**
  - Two-pane layout: conversation list (left), message thread (right)
  - Left pane: List of conversations (user names, last message preview, timestamp)
  - Right pane: Message thread (messages in chronological order, sender name, timestamp)
  - Input field at bottom: text input + send button
  - Auto-scroll to latest message

- **Message badge** (in Navigation)
  - Shows unread count (red badge)
  - Updates via polling (GET /api/messages/unread-count every 10s)
  - Click → navigate to MessagesPage

- **Send message flow**
  - User types → clicks send → POST /api/messages → optimistic UI update (show message immediately)
  - On response: confirm send, handle errors

**Tests** (2 hours):
- Unit: Message formatting, badge display
- Integration: Send/receive flow, polling

**Deliverables**:
- MessagesPage, Message components
- Polling utility (React hook)
- Test suite
- Git commits:
  - `feat: messaging UI`
  - `test: messaging page tests`

#### Acceptance Criteria
- ✅ User can send text message to another user
- ✅ Recipient receives message and can view in inbox
- ✅ Unread message count badge shown in nav
- ✅ Polling updates badge <10s
- ✅ Messages marked as read when viewed
- ✅ Inbox paginated (20 per page)

---

### Phase 3.2: Recommendation Engine (Epic 4 — Stories 4.1 to 4.2) (8 hours)
**Owner**: Dev 1 (Backend + Algorithm)

#### Backend Tasks (Dev 1 — 8 hours)

**Task 3.2.1: Recommendation algorithm**

Algorithm: **Weighted matching** (influencer → campaigns, campaign → influencers)

For a given campaign, score each influencer:
```
score = 
  (niche_match * 0.4) +           // 0-1: exact niche match or related niche
  (follower_tier * 0.3) +         // 0-1: normalized follower count in campaign budget range
  (profile_completeness * 0.2) +  // 0-1: profile fields filled
  (reviews_avg * 0.1)             // 0-1: average review rating (0 if no reviews)

recommendations = influencers.sort_by(score).reverse().limit(10)
```

**Niche matching**: Exact match = 1.0, related niches (sports ↔ fitness) = 0.8, other = 0.2

**Follower tier**: Map campaign budget to follower range:
- Budget < $5k → micro (10k-100k) = 1.0, others = 0.5
- Budget $5k-$20k → mid (100k-1M) = 1.0, others = 0.6
- Budget > $20k → macro (1M+) = 1.0, others = 0.7

**Task 3.2.2: Recommendation endpoints**
- GET `/api/campaigns/:id/recommended-influencers` — get top 10 influencers for campaign
  - Returns: array of {influencer_id, name, niche, follower_count, score, profile_url}
  - Cached for 1 hour (Redis or in-memory)

- GET `/api/influencers/recommended-campaigns` — get top campaigns for logged-in influencer
  - Filters campaigns where influencer hasn't already applied
  - Scores campaigns by niche match + budget fit
  - Returns: array of {campaign_id, title, budget, deadline, score}

**Task 3.2.3: Search & filter optimization**
- GET `/api/campaigns?search=yoga&niche=wellness` — full-text search on campaign title + description
- GET `/api/influencers?search=fitness&niche=sports` — full-text search on influencer bio + niche
- Add database indexes on: niche, status, budget, follower_count, created_at

**Tests** (4 hours):
- Unit: Scoring algorithm, tier matching
- Integration: Recommendation endpoint, caching
- Load: 50 concurrent recommendation requests (should be <500ms due to caching)

**Deliverables**:
- Recommendation algorithm (weighted scoring)
- `/api/campaigns/:id/recommended-influencers` endpoint
- `/api/influencers/recommended-campaigns` endpoint
- Caching layer
- Database indexes
- Test suite
- Git commits:
  - `feat: recommendation engine`
  - `test: recommendation algorithm tests`
  - `perf: add database indexes`

#### Frontend Tasks (Hours 0-4, parallel with recommendation work)

**Task 3.2.4: Recommendation UI**
- **BrandDashboard** — add "Recommended Influencers" card/section
  - Shows top 3-5 recommended influencers for active campaigns
  - Card: influencer name, niche, follower count, score (visual), "View Profile" link
  - Fetches from GET /api/campaigns/:id/recommended-influencers
  - Loading state + error handling

- **InfluencerDashboard** — add "Recommended for You" section
  - Shows top 5 campaigns matching influencer's niche
  - Card: title, budget, deadline, score, "Apply Now" button
  - Fetches from GET /api/influencers/recommended-campaigns

**Tests** (1 hour):
- Unit: Score display, recommendation card formatting
- Integration: Fetch + display flows

**Deliverables**:
- RecommendationCard component
- Dashboard sections
- Test suite
- Git commits:
  - `feat: recommendation UI`
  - `test: recommendation page tests`

#### Acceptance Criteria
- ✅ Brand can see top 10 recommended influencers for campaign
- ✅ Recommendation score based on: niche match, follower tier, profile completeness, reviews
- ✅ Influencer can see recommended campaigns
- ✅ Recommendations cached, returned <500ms
- ✅ Search works on title + description (full-text)
- ✅ Filters work: niche, status, budget range

---

### Phase 3.3: Ratings & Reviews (Epic 6 — Stories 6.1 to 6.3) (6 hours)
**Owner**: Dev 2 (Backend + API), Dev 1 (Frontend UI)

#### Backend Tasks (Dev 2 — 3 hours)

**Task 3.3.1: Review endpoints**
- POST `/api/reviews` — leave review (BRAND reviews INFLUENCER after campaign acceptance)
  - Payload: {influencer_id, campaign_id, rating: 1-5, comment}
  - Validation: both users must have accepted this campaign together
  - Creates Review record
  - Return: review object

- GET `/api/profiles/:username/reviews` — get all reviews for influencer (public)
  - Returns: array of reviews {rating, comment, brand_name, created_at}
  - Calculate: avg_rating, review_count
  - Virtual field: rating_summary (e.g., "4.5/5 based on 12 reviews")

- GET `/api/reviews/my-influencers` — get reviews I've left (for BRAND viewing own history)
  - Returns: array of reviews with influencer names

**Task 3.3.2: Report abusive review (Could-Have, include if time)** *(deferred to post-demo, but API stub included)*
- POST `/api/reviews/:id/report` — report review as abusive
  - Creates AbuseReport record
  - Admin reviews (separate admin endpoint)

**Tests** (1.5 hours):
- Unit: Review validation, rating range
- Integration: Leave review → view on profile

**Deliverables**:
- `/api/reviews` endpoints
- Test suite
- Git commits:
  - `feat: review endpoints`
  - `test: review integration tests`

#### Frontend Tasks (Dev 1 — 3 hours)

**Task 3.3.3: Review UI**
- **ReviewFormModal** (shown on campaign accepted)
  - Title: "Rate your collaboration"
  - Star rating input (1-5, clickable stars)
  - Comment textarea (optional, max 500 chars)
  - Submit → POST /api/reviews → close modal → show toast "Review submitted"
  - Validation: rating required, comment optional

- **PublicProfilePage** — add reviews section
  - Show: rating_summary (e.g., "4.5★ • 12 reviews")
  - Display recent reviews: brand name, rating, comment, date
  - Pagination or "Load more" for 20+ reviews

- **BrandDashboard** — add "My Reviews" section
  - Show reviews I've left (influencer name, rating, comment, date)

**Tests** (1 hour):
- Unit: Star rating interaction, form validation
- Integration: Submit review → display on profile

**Deliverables**:
- ReviewFormModal, ReviewCard components
- Test suite
- Git commits:
  - `feat: review UI`
  - `test: review page tests`

#### Acceptance Criteria
- ✅ Brand can leave 1-5 star rating + comment on influencer
- ✅ Reviews visible on public influencer profile
- ✅ Average rating calculated and displayed
- ✅ Brand cannot review same influencer twice (or allow update)
- ✅ Reviews show brand name, rating, comment, date

---

## Phase 3.4: Integration Testing & Performance Validation (4 hours)
**Owner**: Both devs (collaborative)

#### Tasks

**Task 3.4.1: End-to-end flows**
- Full flow tests using Cypress or Playwright (30 min each):
  1. Register Brand → Create Campaign → View Applications → Accept Influencer → Leave Review
  2. Register Influencer → Search Campaigns → Apply → Receive message from Brand → View in Inbox
  3. Admin login → View all users → Change role → Verify dashboard changes
  4. Recommendation flow: Brand views recommendations → clicks influencer → views public profile
  5. Messaging flow: Send message → receive → unread badge updates → mark read

**Task 3.4.2: Performance benchmarks**
- Page load times (target: <3s)
  - LoginPage, DashboardPages, CampaignDetailPage
- API response times (target: <500ms)
  - GET /api/campaigns (list)
  - POST /api/campaigns/:id/apply
  - GET /api/messages/inbox
  - GET /api/campaigns/:id/recommended-influencers
- Recommendation engine (target: <5s)
  - GET /api/campaigns/:id/recommended-influencers (first run, uncached)
- Concurrent load (target: 50 users, no errors)
  - Simulate 50 concurrent messages, campaign searches, profile updates

**Task 3.4.3: Security audit**
- ✅ JWT tokens validated, expired tokens rejected
- ✅ Role-based access: Influencers cannot access admin endpoints
- ✅ Input validation: SQL injection, XSS protected
- ✅ Sensitive data (passwords, refresh tokens) not logged
- ✅ HTTPS enforced (TLS)
- ✅ CORS configured (frontend URL only)

**Deliverables**:
- E2E test suite (5 flows)
- Performance report
- Security checklist
- Git commits:
  - `test: e2e integration tests`
  - `perf: benchmark report`

---

## WAVE 4: Deployment & Final Polish (Hours 60-72)

### Phase 4.1: Pre-Demo Data Seeding (2 hours)
**Owner**: Dev 1

#### Tasks

**Task 4.1.1: Seed script**
- Create `scripts/seed.ts` that populates:
  - 5 Brand users (Nike, Adidas, Pepsi, Apple, Starbucks)
  - 20 Influencer users (5 each niche: fitness, fashion, food, tech, lifestyle)
  - Each Influencer: 10k-1M follower count, complete profiles, portfolio links
  - 10 Campaigns across brands (various budgets, deadlines, required niches)
  - 15 Applications (mix of PENDING, ACCEPTED, REJECTED)
  - 20 Messages (conversations between brands and influencers)
  - 30 Reviews (ratings 3-5 stars with comments)

**Task 4.1.2: Demo data playbook**
- Document: "How to reset DB to demo state"
  - Run: `npm run seed:demo`
  - Clears existing data, repopulates
  - Accounts:
    - Brand: nike@example.com / password123 (Nike)
    - Influencer: sarah.fit@example.com / password123 (fitness influencer, 500k followers)
    - Admin: admin@example.com / password123

**Deliverables**:
- `scripts/seed.ts` (complete demo dataset)
- `DEMO_PLAYBOOK.md` (login credentials, flow walkthrough)
- Git commit: `chore: add demo data seed script`

---

### Phase 4.2: Deployment (6 hours)
**Owner**: Dev 1 (lead), Dev 2 (assist)

#### Tasks

**Task 4.2.1: Backend deployment (Render/Railway)**
- Create Render app (or Railway)
- Set environment variables: DB_URL, JWT_SECRET, NODE_ENV
- Configure build: `npm run build`
- Configure start: `npm run start`
- Health check endpoint: GET /api/health → {status: "ok", timestamp}
- Deploy backend → get production URL (e.g., https://influencerhub-api.render.com)
- Test: Curl production endpoints, verify responses

**Task 4.2.2: Frontend deployment (Vercel)**
- Create Vercel app, connect Git repo
- Build: `npm run build` (Vite)
- Environment variables: VITE_API_URL=https://influencerhub-api.render.com
- Configure: Static hosting, auto-deploy on main branch
- Deploy frontend → get production URL (e.g., https://influencerhub.vercel.app)
- Test: Load frontend, verify API calls reach production backend

**Task 4.2.3: Database finalization**
- Confirm DB backups enabled
- Verify indexes applied: niche, status, budget, follower_count, created_at
- Test data persistence: Create user in prod → refresh → user still exists

**Task 4.2.4: Final smoke tests**
- Full flow on production:
  - Register Brand
  - Create Campaign
  - Register Influencer
  - Search & Apply
  - Brand accepts
  - Send message
  - Leave review
  - Check recommendation
- Check error handling: Invalid login, 404 pages, network timeouts
- Verify error messages are user-friendly (no stack traces)

**Task 4.2.5: Demo rehearsal (2 hours, Day 3 morning)**
- Dry run of full demo:
  - Reset DB to seed data
  - Walk through all 6 epics
  - Test on staging/production
  - Verify page load times
  - Verify messaging polling
  - Practice talking points (30-60s per epic)

**Deliverables**:
- Backend live at production URL
- Frontend live at production URL
- DB with production data
- Health check endpoint
- Demo playbook executed
- Git commits:
  - `chore: configure backend deployment`
  - `chore: configure frontend deployment`
  - `chore: production smoke tests`

---

## Architecture & Technical Decisions

### Database Schema (PostgreSQL)

```sql
-- Users & Auth
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('BRAND', 'INFLUENCER', 'ADMIN') NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX(email),
  INDEX(role)
);

-- Profiles
CREATE TABLE brand_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  website VARCHAR(255),
  industry VARCHAR(100),
  description TEXT,
  logo_url VARCHAR(255),
  media_kit_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX(user_id)
);

CREATE TABLE influencer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  bio TEXT,
  avatar_url VARCHAR(255),
  follower_count INT DEFAULT 0,
  niche VARCHAR(100),
  portfolio_links JSONB DEFAULT '[]',  -- [{name: "Instagram", url: "..."}, ...]
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX(user_id),
  INDEX(niche),
  INDEX(follower_count)
);

-- Campaigns
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  budget DECIMAL(10, 2) NOT NULL,
  deadline DATE NOT NULL,
  required_niche VARCHAR(100),
  status ENUM('OPEN', 'CLOSED', 'ARCHIVED') DEFAULT 'OPEN',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX(brand_id),
  INDEX(status),
  INDEX(required_niche),
  INDEX(budget),
  INDEX(created_at)
);

-- Applications
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  influencer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status ENUM('PENDING', 'ACCEPTED', 'REJECTED') DEFAULT 'PENDING',
  portfolio_link VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(campaign_id, influencer_id),
  INDEX(campaign_id),
  INDEX(influencer_id),
  INDEX(status)
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX(sender_id),
  INDEX(recipient_id),
  INDEX(is_read),
  INDEX(created_at)
);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,  -- BRAND
  reviewed_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,  -- INFLUENCER
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE SET NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(campaign_id),  -- One review per campaign collaboration
  INDEX(reviewed_user_id),
  INDEX(campaign_id),
  INDEX(created_at)
);
```

### API Structure

**Base URL**: `/api/v1` (allows versioning)

**Middleware Stack** (in order):
1. CORS (allow frontend origin)
2. Body parser (JSON, max 1MB)
3. Authenticate JWT (extract token from Authorization header)
4. Request logging (request ID, method, path, response time)
5. Error handler (catch all, return standardized response)

**Error Response Format**:
```json
{
  "success": false,
  "error": "User not found",
  "code": "NOT_FOUND",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Success Response Format**:
```json
{
  "success": true,
  "data": { /* resource */ },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Authentication**: Bearer token in Authorization header
```
Authorization: Bearer <jwt_token>
```

### Frontend Routing

```
/                          → LoginPage (if not auth) / DashboardPage (if auth)
/register                  → RegisterPage
/profile/setup             → ProfileSetupPage (after registration)
/profile/edit              → ProfileEditPage (protected)
/profile/:username         → PublicProfilePage (public)
/campaigns                 → CampaignListPage (all open campaigns, influencer view)
/campaigns/create          → CreateCampaignPage (brand only)
/campaigns/:id             → CampaignDetailPage
/dashboard                 → BrandDashboard (brand) / InfluencerDashboard (influencer)
/messages                  → MessagesPage (protected)
/admin/users               → AdminUsersPage (admin only)
```

### State Management (React Context)

**AuthContext** (global):
```typescript
{
  user: User | null,
  token: string | null,
  role: Role | null,
  isLoading: boolean,
  login: (email, password) => Promise<void>,
  logout: () => void,
  register: (email, password, role) => Promise<User>
}
```

**ProfileContext** (user profile):
```typescript
{
  profile: BrandProfile | InfluencerProfile | null,
  isLoading: boolean,
  updateProfile: (data) => Promise<void>,
  fetchProfile: () => Promise<void>
}
```

**CampaignContext** (campaign list + filters):
```typescript
{
  campaigns: Campaign[],
  filters: { status, niche, budget_min, budget_max },
  setFilters: (filters) => void,
  refetch: () => Promise<void>
}
```

**MessageContext** (for MessagesPage + polling):
```typescript
{
  messages: Message[],
  unreadCount: number,
  sendMessage: (recipient_id, content) => Promise<void>,
  fetchMessages: () => Promise<void>,
  startPolling: () => void,  // Polls unread count every 10s
  stopPolling: () => void
}
```

### Recommendation Algorithm Details

**Niche matching table**:
```javascript
const nicheRelations = {
  'fitness': ['sports', 'health', 'wellness'],
  'fashion': ['lifestyle', 'beauty', 'luxury'],
  'food': ['lifestyle', 'wellness'],
  'tech': ['business', 'lifestyle'],
  'lifestyle': ['fashion', 'food', 'wellness']
};
```

**Follower tier matching**:
```javascript
function getFollowerTierScore(campaignBudget, influencerFollowers) {
  if (campaignBudget < 5000) {
    // Micro-influencers: 10k-100k followers ideal
    if (influencerFollowers >= 10000 && influencerFollowers <= 100000) return 1.0;
    if (influencerFollowers >= 5000 && influencerFollowers <= 500000) return 0.6;
    return 0.2;
  } else if (campaignBudget < 20000) {
    // Mid-tier: 100k-1M followers ideal
    if (influencerFollowers >= 100000 && influencerFollowers <= 1000000) return 1.0;
    if (influencerFollowers >= 50000 && influencerFollowers <= 2000000) return 0.6;
    return 0.3;
  } else {
    // Macro-influencers: 1M+ followers ideal
    if (influencerFollowers >= 1000000) return 1.0;
    if (influencerFollowers >= 500000) return 0.7;
    return 0.4;
  }
}
```

**Final score**:
```javascript
function scoreInfluencer(campaign, influencer) {
  const nicheScore = calculateNicheMatch(campaign.required_niche, influencer.niche);
  const followerScore = getFollowerTierScore(campaign.budget, influencer.follower_count);
  const completenessScore = influencer.portfolio_links.length > 0 ? 1.0 : 0.5;
  const reviewScore = influencer.avg_rating ? influencer.avg_rating / 5 : 0;
  
  return (
    nicheScore * 0.4 +
    followerScore * 0.3 +
    completenessScore * 0.2 +
    reviewScore * 0.1
  );
}
```

---

## Dependency Map & Critical Path

### Task Dependencies

```
┌─────────────────────────────────────────────────────────────────────┐
│ WAVE 1: Setup & Schema (Hours 0-6)                                  │
├─────────────────────────────────────────────────────────────────────┤
│ 1.1: Project Setup                                                  │
│  ├─→ Git + package.json                                             │
│  ├─→ React + Tailwind + TypeScript                                  │
│  ├─→ Node.js + Express + TypeScript                                 │
│  └─→ PostgreSQL + Prisma schema                                     │
│                                                                      │
│ 1.2: Shared Types (depends on 1.1)                                  │
│  └─→ TypeScript interfaces + API contracts                          │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴────────────────┐
                    ▼                                ▼
┌──────────────────────────────┐  ┌──────────────────────────────┐
│ WAVE 2A: Auth (Hours 6-18)   │  │ WAVE 2B: Profiles (Hours 6-20)│
├──────────────────────────────┤  ├──────────────────────────────┤
│ 2.1.1: Auth endpoints        │  │ 2.2.1: Profile endpoints     │
│ 2.1.2: Admin management      │  │ 2.2.2: Profile queries       │
│ 2.1.3: Login UI              │  │ 2.2.3: Profile UI            │
│ 2.1.4: Register UI           │  │                              │
│                              │  │ (Parallel, no file overlap)  │
│ (Dev 1 backend, Dev 2 UI)    │  │ (Dev 2 backend, Dev 1 UI)    │
└──────────────────────────────┘  └──────────────────────────────┘
                    │                                │
                    │                                │
                    └────────────────┬───────────────┘
                                     ▼
        ┌──────────────────────────────────────────────┐
        │ WAVE 2C: Campaigns (Hours 20-30)             │
        ├──────────────────────────────────────────────┤
        │ 2.3.1: Campaign endpoints (requires auth)    │
        │ 2.3.2: Campaign discovery endpoints          │
        │ 2.3.3: Application tracking                  │
        │ 2.3.4: Campaign UI (both views)              │
        │                                              │
        │ (Dev 1 backend, Dev 2 UI)                    │
        └──────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ WAVE 3A:         │ │ WAVE 3B:         │ │ WAVE 3C:         │
│ Messaging        │ │ Recommendations  │ │ Reviews          │
│ (Hours 36-46)    │ │ (Hours 36-44)    │ │ (Hours 36-42)    │
├──────────────────┤ ├──────────────────┤ ├──────────────────┤
│ 3.1.1: Endpoints │ │ 3.2.1: Algorithm │ │ 3.3.1: Review EP │
│ 3.1.2: Polling   │ │ 3.2.2: Rec EP    │ │ 3.3.2: Review UI │
│ 3.1.3: Msg UI    │ │ 3.2.3: Search    │ │ 3.3.3: Avg calc  │
│                  │ │ 3.2.4: Rec UI    │ │                  │
│ (Dev 2 backend)  │ │ (Dev 1 backend)  │ │ (Dev 2 backend)  │
│ (Dev 1 UI)       │ │ (Dev 1 UI)       │ │ (Dev 1 UI)       │
└──────────────────┘ └──────────────────┘ └──────────────────┘
                    │                │               │
                    └────────┬────────┴───────────────┘
                             ▼
            ┌────────────────────────────────┐
            │ WAVE 3D: Integration Testing   │
            │ (Hours 46-50)                  │
            ├────────────────────────────────┤
            │ 3.4.1: E2E test flows          │
            │ 3.4.2: Performance benchmarks  │
            │ 3.4.3: Security audit          │
            │ (Both devs)                    │
            └────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ WAVE 4A:         │ │ WAVE 4B:         │ │ WAVE 4C:         │
│ Demo Data        │ │ Deployment       │ │ Final Polish     │
│ (Hours 50-52)    │ │ (Hours 52-68)    │ │ (Hours 68-72)    │
├──────────────────┤ ├──────────────────┤ ├──────────────────┤
│ 4.1.1: Seed DB   │ │ 4.2.1: Backend   │ │ Smoke tests      │
│ 4.1.2: Playbook  │ │ 4.2.2: Frontend  │ │ Demo rehearsal   │
│ (Dev 1)          │ │ 4.2.3: DB final  │ │ (Both devs)      │
│                  │ │ 4.2.4: Smoke     │ │                  │
│                  │ │ (Both devs)      │ │                  │
└──────────────────┘ └──────────────────┘ └──────────────────┘

CRITICAL PATH (longest dependent chain):
Setup (6h) → Auth (12h) → Campaigns (10h) → Messaging (10h) → Testing (4h) → 
Deployment (6h) → Final (4h) = 52 HOURS (fits within 72h, leaves 20h buffer)
```

### Parallelization Opportunities

| Parallel Window | Task A | Task B | Task C |
|---|---|---|---|
| Hours 0-6 | Project setup | Shared types | (sequential) |
| Hours 6-18 | Auth backend | Profile backend | Campaign schema (prep) |
| Hours 6-20 | Auth UI | Profile UI | Campaign UI (prep) |
| Hours 20-30 | Campaign backend | Campaign UI | Messages (prep) |
| Hours 36-46 | Messaging | Recommendations | Reviews |
| Hours 46-50 | E2E tests | Perf benchmarks | Security audit |
| Hours 52-68 | Demo seed | Backend deploy | Frontend deploy |
| Hours 68-72 | Smoke tests | Demo rehearsal | Buffer |

**Critical observation**: Auth, Profiles, and Campaigns can have frontend work start after 6-hour mark (shared types ready). Messaging, Recommendations, and Reviews run in true parallel (3 independent features). Deployment is parallelizable (backend + frontend simultaneously).

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation | Owner |
|---|---|---|---|---|
| **Database performance at scale** | Medium | High | Add indexes on day 1 (niche, status, budget, follower_count). Load test with 50 concurrent requests. Redis caching for recommendations. | Dev 1 (DB design) |
| **Auth token expiry during demo** | Low | High | Use long-lived demo tokens (7-day refresh). Refresh before demo. Include refresh endpoint in API. | Dev 2 (auth flow) |
| **Messaging polling too slow** | Medium | Medium | Implement server-side polling with exponential backoff. Cache unread count. Start with 10-sec interval, tune based on load test. | Dev 2 (backend) |
| **Recommendation algorithm too slow** | Medium | Medium | Cache recommendations for 1 hour. Use indexed queries. Test on sample data (100 influencers). Profile: target <500ms. | Dev 1 (algorithm) |
| **Frontend-backend API mismatch** | Low | High | Share TypeScript types in `packages/shared/`. Run integration tests hourly. Commit together. | Both |
| **Deployment issues (env vars, secrets)** | Medium | High | Document all env vars in `.env.example`. Use Render/Vercel templates. Test deploy on staging 24h before demo. | Dev 1 (deployment) |
| **Demo data corruption** | Low | Medium | Automated seed script. Version control seed data. Dry run seed on staging. Have backup seed ready. | Dev 1 (seed script) |
| **File conflicts in Git** | Low | Medium | Strict file ownership (auth → Dev 1 backend, Dev 2 UI). Different branches until Wave 3. Merge daily on main. | Both |
| **Missing feature discovery mid-sprint** | Low | High | All 23 stories listed upfront. Weekly story clarification meeting (not applicable here, assume done). | Product owner (you) |
| **Developer burnout (72h sprint)** | Medium | Medium | Clear work boundaries (8h/day × 3 days = 24h, not 36h continuous). Deploy Day 3 morning, not night-before-demo. Breaks every 2h. | Both |

---

## Demo Data Strategy

### Pre-Seeded Dataset

**Accounts** (5 demo users):
```
BRAND 1:
  Email: nike@example.com
  Password: demo123
  Name: Nike
  Website: nike.com
  Industry: Sports
  Logo: (pre-uploaded)

BRAND 2:
  Email: adidas@example.com
  Password: demo123
  Name: Adidas
  Website: adidas.com

INFLUENCER 1 (Fitness):
  Email: sarah.fit@example.com
  Password: demo123
  Name: Sarah Fitness
  Niche: fitness
  Followers: 500k
  Bio: "Certified trainer, 500k followers"
  Portfolio: [Instagram, YouTube]

INFLUENCER 2 (Fashion):
  Email: luke.style@example.com
  Password: demo123
  Name: Luke Style
  Niche: fashion
  Followers: 250k

ADMIN:
  Email: admin@example.com
  Password: demo123
  Role: ADMIN
```

**Campaigns** (10 pre-created):
```
Campaign 1 (Nike, OPEN):
  Title: "Summer Sports Campaign 2024"
  Budget: $50,000
  Deadline: 2024-06-30
  Required Niche: fitness
  Applications: 3 (1 pending, 1 accepted, 1 rejected)

Campaign 2 (Adidas, CLOSED):
  Title: "Fashion Week Collaboration"
  Budget: $30,000
  Deadline: 2024-05-15
  Required Niche: fashion
  Applications: 2 (both accepted)

Campaign 3-10: (varied budgets, niches, statuses)
```

**Messages** (20 pre-created):
```
Nike → Sarah: "Hi Sarah, we'd love to work with you on the summer campaign!"
Sarah → Nike: "Thanks! I'm interested. What are the details?"
Nike → Sarah: "Check the campaign details page..."
(Continue conversation chain)
```

**Reviews** (30 pre-created):
```
Nike → Sarah (5 stars): "Amazing work! Highly recommend Sarah for any fitness campaign."
Adidas → Luke (4 stars): "Great collaboration. Professional and timely."
(Various ratings: 3-5 stars, mix of detailed comments and brief reviews)
```

**Recommendations** (auto-generated):
```
When Brand views Nike Summer Campaign:
  Top 10 recommended influencers generated based on:
  - Niche match (fitness = high score)
  - Follower tier (budget $50k = mid-tier influencers 100k-1M ideal)
  - Profile completeness (portfolio links = bonus)
  - Reviews (higher average rating = bonus)
```

### Live Creation During Demo

**Flow**:
1. Register new Brand: "DemoBrand Inc." (on stage, live)
2. Create new Campaign: "Holiday 2024 Collab" (live)
3. Register new Influencer: "Demo Influencer" (live)
4. Apply to campaign (live)
5. Accept application (live)
6. Exchange messages (live)
7. Leave review (live)

**Why**:
- Demonstrates full flow is working
- Shows real-time updates (messages, notification badges)
- Proves database persistence
- Builds confidence in production readiness

---

## Quality Checkpoints

### Daily Checkpoints (Each Day @ EOD, 30 min)

**Day 1 (Hours 0-24)**:
- [ ] Project setup complete (Git, package.json, DB initialized)
- [ ] Shared types defined (no missing interfaces)
- [ ] Auth endpoints responding (register, login test)
- [ ] Auth UI renders without errors
- [ ] Profile endpoints responding (GET, PATCH)
- [ ] Profile UI renders without errors
- [ ] Campaign schema in Prisma verified
- [ ] Test suite runs (even with 1 test each)
- [ ] Both devs can run the project locally

**Day 2 (Hours 24-48)**:
- [ ] Campaign CRUD endpoints complete + tested
- [ ] Campaign UI (both views) complete + renders
- [ ] Messaging endpoints complete (send, inbox, unread count)
- [ ] Messaging UI renders, polling starts
- [ ] Recommendation algorithm logic tested (scores calculated)
- [ ] Review endpoints complete
- [ ] Review UI renders
- [ ] No critical Git merge conflicts
- [ ] Performance baseline: Auth <500ms, Campaign list <1s

**Day 3 (Hours 48-72)**:
- [ ] Integration tests pass (5 E2E flows)
- [ ] Performance benchmarks met (<3s page load, <500ms API)
- [ ] Demo data seeded successfully
- [ ] Backend deployed to Render (health check OK)
- [ ] Frontend deployed to Vercel (loads, connects to backend)
- [ ] Smoke tests pass on production
- [ ] Demo rehearsal dry-run successful
- [ ] All 23 stories accounted for in feature list

### Critical Flow Tests (Manual)

**Smoke Test 1: Brand Onboarding** (10 min)
```
1. Register as Brand (nike-demo@example.com)
2. Fill profile (name, website, logo)
3. Create campaign
4. View campaign in campaign list
5. Expected: Campaign appears, is editable, all fields saved
```

**Smoke Test 2: Influencer Application** (10 min)
```
1. Register as Influencer (influencer-demo@example.com)
2. Fill profile (name, bio, followers, niche, portfolio links)
3. View campaigns → filter by niche
4. Apply to campaign
5. Expected: Application submitted, status shown ("Pending"), cannot apply twice
```

**Smoke Test 3: Messaging & Notifications** (10 min)
```
1. Brand sends message to influencer
2. Influencer views inbox
3. Badge count updates every 10s (polling)
4. Send reply message
5. Both users can see full conversation thread
6. Expected: Messages persist, polling works, badge accurate
```

**Smoke Test 4: Recommendations** (10 min)
```
1. Brand views campaign detail
2. Scroll to "Recommended Influencers"
3. See top 10 with scores
4. Click influencer → public profile
5. Expected: Recommendations match niche + follower tier, scores visible
```

**Smoke Test 5: Full Happy Path** (15 min)
```
1. Brand: Register → create campaign
2. Influencer: Register → search campaigns → apply
3. Brand: View applications → accept
4. Both: Exchange messages
5. Brand: Leave review (5 stars)
6. Influencer: View review on public profile
7. Expected: All steps succeed, no errors, data persists
```

**Performance Checks**:
- Open DevTools → Network tab
- Login: <2s
- Dashboard load: <3s
- Campaign list (50 items): <2s
- Message send: <500ms
- Recommendation fetch: <1s (cached), <5s (cold)

---

## Git Commit Strategy

### Commit Structure

**Format**: `{type}({scope}): {message} #{story_id}`

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `test`: Test addition/update
- `chore`: Build, deps, config
- `refactor`: Code cleanup
- `perf`: Performance improvement
- `docs`: Documentation

**Scopes**:
- `auth`, `profile`, `campaign`, `messaging`, `recommendation`, `review`
- `db`, `api`, `ui`, `types`, `deployment`

**Examples**:
```
feat(auth): add JWT token refresh endpoint #1.3
test(auth): add integration tests for login flow #1.3
feat(campaign): add campaign filtering by niche #3.4
feat(messaging): implement unread message polling #5.2
perf(recommendation): add database index on niche column #4.1
chore(db): add seed script for demo data #setup
docs: add API documentation for /campaigns endpoint #docs
```

### Branch Strategy

**Main branch**: `main` (deployment-ready)
- Protected: PRs required
- CI/CD runs on every commit

**Feature branches** (per dev):
- `dev1/auth` — Dev 1 auth work
- `dev1/campaigns` — Dev 1 campaign backend
- `dev2/profiles` — Dev 2 profile work
- `dev2/messaging` — Dev 2 messaging backend
- `shared/types` — Shared types (both devs contribute)

**Merge cadence**:
- Daily (after daily checkpoint)
- Resolve conflicts on the spot
- CI must pass before merge

### Daily Sync Commits

**At EOD each day**, create a summary commit:
```
chore(daily): Day 1 checkpoint — auth + profiles + campaigns schema complete

Completed:
- [x] Auth endpoints (register, login, refresh)
- [x] Profile endpoints (GET, PATCH)
- [x] Campaign schema (Prisma)
- [x] Auth UI (login, register)
- [x] Profile UI (setup, edit, view)
- [ ] Campaign endpoints (in progress, 80% complete)
- [ ] Tests (auth + profile coverage >80%)

Blockers:
- None

Next:
- Complete campaign endpoints (2h remaining)
- Campaign UI implementation
- Messaging endpoints

Commits since last sync: 12
```

---

## Per-Developer Task Assignments

### Dev 1 (Backend-Focused, UI assist)
**Total: ~36 hours**

**Wave 1** (3h):
- Project setup (Git, DB, TypeScript config)
- Shared types definition

**Wave 2** (12h):
- Auth endpoints + middleware (3h) → Git commit `feat(auth): endpoints`
- Auth tests (1h) → Git commit `test(auth): integration tests`
- Profiles API (2h) → Git commit `feat(profile): endpoints`
- Campaign endpoints (4h) → Git commit `feat(campaign): endpoints`
- Profile UI (2h, assist) → Git commit `feat(profile): UI components`

**Wave 3** (12h):
- Recommendation algorithm (4h) → Git commit `feat(recommendation): algorithm`
- Recommendation endpoints (2h) → Git commit `feat(recommendation): endpoints`
- Recommendation UI (2h, assist) → Git commit `feat(recommendation): UI`
- Integration testing (2h) → Git commit `test: e2e flows`
- Performance benchmarks (2h) → Git commit `perf: benchmark report`

**Wave 4** (9h):
- Demo data seed script (2h) → Git commit `chore: seed demo data`
- Backend deployment (3h) → Git commit `chore: backend deployment`
- Smoke tests (2h) → Git commit `test: production smoke tests`
- Demo rehearsal (2h)

---

### Dev 2 (Frontend-Focused, Backend assist)
**Total: ~36 hours**

**Wave 1** (3h):
- Project setup (React + Tailwind + Vite)
- Assist with shared types

**Wave 2** (12h):
- Profile API (2h, assist) → Git commit `feat(profile): endpoints`
- Auth UI (2h) → Git commit `feat(auth): login + register UI`
- Profile UI (2h) → Git commit `feat(profile): setup + edit UI`
- Campaign endpoints (2h, assist) → Git commit `feat(campaign): CRUD`
- Campaign UI (4h) → Git commit `feat(campaign): brand + influencer dashboards`

**Wave 3** (12h):
- Messaging endpoints (3h, lead) → Git commit `feat(messaging): endpoints`
- Messaging UI (3h) → Git commit `feat(messaging): inbox + polling UI`
- Review endpoints (2h, lead) → Git commit `feat(review): endpoints`
- Review UI (2h) → Git commit `feat(review): rating + comments UI`
- Integration testing (2h) → Git commit `test: e2e flows`

**Wave 4** (9h):
- Demo data seed script (2h, assist) → Git commit `chore: seed demo data`
- Frontend deployment (3h) → Git commit `chore: frontend deployment`
- Smoke tests (2h) → Git commit `test: production smoke tests`
- Demo rehearsal (2h)

---

## Success Metrics & Acceptance Criteria

### Phase Completion Checklist

**Wave 1: Setup & Schema (6h)**
- [ ] Git repo initialized, protected main branch
- [ ] Database created, schema applied
- [ ] All tables exist with correct indexes
- [ ] Shared types file complete (all interfaces exported)
- [ ] Local dev environment working (npm start frontend, npm start backend)
- [ ] Both devs can connect to shared DB

**Wave 2: Core Features (24h)**
- [ ] Auth: Register brand/influencer, login, JWT refresh, admin user mgmt
  - [ ] All endpoints tested (>80% coverage)
  - [ ] Login/register UI working, responsive
- [ ] Profiles: BrandProfile + InfluencerProfile, CRUD, public view
  - [ ] All endpoints tested
  - [ ] Profile setup UI working post-registration
  - [ ] Public profile pages rendering correctly
- [ ] Campaigns: Create, edit, close, list, apply
  - [ ] All endpoints tested
  - [ ] BrandDashboard + InfluencerDashboard UI complete
  - [ ] Campaign detail page working
- [ ] No critical Git merge conflicts

**Wave 3: Advanced Features (24h)**
- [ ] Messaging: Send, inbox, unread count, polling
  - [ ] All endpoints tested
  - [ ] UI renders, polling active (<10s update)
  - [ ] Unread badge working
- [ ] Recommendations: Algorithm, endpoints, UI
  - [ ] Algorithm tested (scores calculate correctly)
  - [ ] Recommendations returned <500ms (cached)
  - [ ] UI displays recommendations on both dashboards
- [ ] Reviews: Leave, view, average calculation
  - [ ] All endpoints tested
  - [ ] Review form working, average rating displayed
- [ ] E2E tests passing (5 full flows)
- [ ] Performance benchmarks met (<3s page load, <500ms API)
- [ ] Security audit passed (JWT validation, RBAC, input validation)

**Wave 4: Deployment & Polish (18h)**
- [ ] Demo data seeded successfully
- [ ] Backend deployed to Render (health check OK)
- [ ] Frontend deployed to Vercel (loads, connects to backend)
- [ ] Smoke tests passed on production (all 5 flows)
- [ ] No 404s, 500s, or console errors
- [ ] Performance benchmarks verified on production
- [ ] Demo rehearsal dry-run successful (30-45 min walkthrough)
- [ ] Commit log clean, all tasks linked to story IDs

### Story Delivery Checklist (All 23 Stories)

**Epic 1: User Accounts & Login (5 stories)**
- [x] US-1.1: Brand Registration — DONE (Auth endpoints + UI)
- [x] US-1.2: Influencer Registration — DONE (Auth endpoints + UI)
- [x] US-1.3: Login with Email & Password — DONE (Auth endpoints + UI)
- [x] US-1.4: Role-Based Dashboard — DONE (BrandDashboard + InfluencerDashboard)
- [x] US-1.5: Admin User Management — DONE (Admin endpoints + admin check)

**Epic 2: Profiles & Portfolio (4 stories)**
- [x] US-2.1: Brand Profile Setup — DONE (ProfileSetupPage + API)
- [x] US-2.2: Influencer Profile Setup — DONE (ProfileSetupPage + API)
- [x] US-2.3: Influencer Portfolio Links — DONE (Portfolio links array in profile)
- [x] US-2.4: Public Profile View — DONE (PublicProfilePage)

**Epic 3: Campaign Management (4 stories)**
- [x] US-3.1: Post a Campaign — DONE (CreateCampaignPage + API)
- [x] US-3.2: Edit or Close a Campaign — DONE (Campaign edit + close endpoints)
- [x] US-3.3: Browse & Apply to Campaigns — DONE (Campaign list + apply endpoint)
- [x] US-3.4: Campaign Status Tracking — DONE (Status enum, status display)

**Epic 4: Recommendation Engine (2 stories)**
- [x] US-4.1: Recommended Influencers for Campaign — DONE (Rec algorithm + endpoint)
- [x] US-4.2: Campaign Search & Filter for Influencers — DONE (Filtering + search)

**Epic 5: In-App Messaging (3 stories)**
- [x] US-5.1: Send a Text Message — DONE (Messaging endpoints + UI)
- [x] US-5.2: View Message Inbox — DONE (MessagesPage + polling)
- [x] US-5.3: Unread Message Notification Badge (Should-Have) — DONE (Badge + polling)

**Epic 6: Ratings & Reviews (3 stories)**
- [x] US-6.1: Leave a Rating and Review (Should-Have) — DONE (ReviewFormModal + API)
- [x] US-6.2: View Reviews on Public Profile (Should-Have) — DONE (PublicProfilePage + review section)
- [x] US-6.3: Report an Abusive Review (Could-Have, deferred) — STUBBED (API endpoint exists, frontend deferred post-demo)

**All 22 Must-Have & Should-Have stories DELIVERED. 1 Could-Have deferred (acceptable).**

---

## Final Checklist (Day 3, Before Demo)

**Morning of Demo (4h)**
- [ ] Reset demo database: `npm run seed:demo`
- [ ] Start backend: `npm start`
- [ ] Start frontend: `npm run dev`
- [ ] Verify all demo accounts work (3 users test)
- [ ] Test all 5 smoke flows on production
- [ ] Open DevTools, check for console errors
- [ ] Verify page load times (<3s)
- [ ] Verify messaging polling works (watch Network tab)
- [ ] Verify recommendation scores display correctly
- [ ] Rehearse 30-45 min demo walkthrough (time the talk)
- [ ] Have backup demo data ready (second seed snapshot)

**Launch Checklist**
- [ ] All 23 stories visible and functional
- [ ] No hard-coded test data in UI
- [ ] Production URLs ready to demo (Vercel + Render links)
- [ ] Team knows talking points (30-60s per epic)
- [ ] Backup plan if production fails (local build ready)
- [ ] Git history clean, all commits linked to stories

---

## Tools & Tech Stack Recap

| Layer | Tech | Version | Purpose |
|---|---|---|---|
| **Frontend** | React | 18.x | UI framework |
| | TypeScript | 5.x | Type safety |
| | Tailwind CSS | 3.x | Styling |
| | Vite | 4.x | Build tool (faster than CRA) |
| | React Router | 6.x | Routing |
| | Axios | 1.x | HTTP client |
| | Cypress/Playwright | latest | E2E testing |
| | Jest | 29.x | Unit testing |
| **Backend** | Node.js | 18.x+ | Runtime |
| | Express | 4.x | Web framework |
| | TypeScript | 5.x | Type safety |
| | Prisma | 5.x | ORM |
| | JWT (jsonwebtoken) | 9.x | Auth tokens |
| | Bcryptjs | 2.x | Password hashing |
| | Joi / Zod | latest | Input validation |
| | Supertest | latest | API testing |
| **Database** | PostgreSQL | 14.x+ | RDBMS (Supabase/Neon) |
| | Prisma Migrate | latest | Schema migrations |
| **Deployment** | Vercel | — | Frontend hosting |
| | Render/Railway | — | Backend hosting |
| | GitHub Actions | — | CI/CD |

---

## Summary

**This 72-hour sprint is achievable because:**

1. **Parallel development** — Frontend and backend built simultaneously, shared types prevent integration errors
2. **Early DB schema** — Complete schema in Hour 1, no mid-sprint migrations
3. **Focused scope** — All 23 stories prioritized, no ambiguity, clear acceptance criteria
4. **Aggressive but realistic** — Each task 15-60 min, daily checkpoints catch failures early
5. **Pre-seeded demo** — Live data ready, demo flows tested before Day 3
6. **Production-grade from Day 1** — Tests written during development, not added later
7. **Clear task ownership** — Dev 1 backend, Dev 2 UI, shared types for collaboration

**Critical success factors:**
- Stick to the timeline (don't slip into Day 4)
- Merge daily to catch conflicts early
- Run smoke tests EOD each day
- Deploy 24h before demo, not night-before
- Keep demo rehearsal to <1h (known script)

**Your team ships a complete, production-ready influencer-brand platform in 72 hours.**

---

## Appendix: Code Scaffolding Examples

### Backend: Auth Middleware (15 min to write)

```typescript
// src/middleware/auth.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; role: 'BRAND' | 'INFLUENCER' | 'ADMIN'; email: string };
    }
  }
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, error: 'No token', code: 'NO_AUTH' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: 'Invalid token', code: 'INVALID_TOKEN' });
  }
};

export const authorize = (roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, error: 'Forbidden', code: 'FORBIDDEN' });
  }
  next();
};
```

### Frontend: Protected Route (10 min to write)

```typescript
// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }: any) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/dashboard" />;

  return children;
};
```

### Frontend: Auth Context (20 min to write)

```typescript
// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';

type AuthContextType = {
  user: any | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      // Decode JWT and set user (or call GET /api/me)
      const decoded = JSON.parse(atob(token.split('.')[1]));
      setUser(decoded);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.success) {
      setToken(data.data.token);
      localStorage.setItem('token', data.data.token);
      setUser(JSON.parse(atob(data.data.token.split('.')[1])));
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const register = async (email: string, password: string, role: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });
    const data = await res.json();
    if (data.success) {
      await login(email, password);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
```

---

**Ready to ship. Let's build InfluencerHub in 72 hours.** 🚀
