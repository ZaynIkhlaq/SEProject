# InfluencerHub — 72-Hour Sprint Documentation

This repository contains the complete plan, architecture, and task breakdown for building a **full influencer-brand collaboration platform in 72 hours** with 2 developers.

## 📚 Documents

### 1. **SPRINT_PLAN_72H.md** (Comprehensive Master Plan)
The high-level strategic plan covering:
- **Phase Breakdown** (8 phases, 3 waves of parallel development)
- **Architecture Decisions** (DB schema, API structure, state management)
- **Dependency Map** (task dependencies and parallelization opportunities)
- **Risk Mitigation** (what could go wrong and how to prevent it)
- **Demo Data Strategy** (pre-seeded data + live creation approach)
- **Quality Checkpoints** (daily milestones and critical flow tests)
- **Per-Developer Task Assignments** (36 hours each, clearly defined)
- **Git Commit Strategy** (atomic commits linked to user story IDs)
- **Code Scaffolding Examples** (middleware, Context hooks, Protected routes)

**Audience**: Tech lead, project manager, development team for understanding the big picture.

**When to use**: 
- Read first for understanding the complete vision
- Reference for dependency decisions
- Review for risk mitigation strategies

---

### 2. **TASK_BREAKDOWN_DEV_ACTIONLIST.md** (Immediate Action List)
The detailed task-level breakdown that developers copy-paste to start coding:
- **Shared Infrastructure Setup** (Git, DB schema, types, auth middleware, base setup)
- **Recommended Work Order** (parallel tracks for max efficiency)
- **Per-Developer Daily Sprint Breakdown** (what each dev does hours 0-24, 24-48, 48-72)
- **All 23 User Stories Detailed** (US-1.1 through US-6.3):
  - Acceptance criteria checklist
  - Backend tasks (API endpoints, DB changes, tests)
  - Frontend tasks (React components, routing, tests)
  - Integration tests
  - Estimated hours
  - Owner assignment
  - Dependencies
  - Definition of Done checklist
- **Quick Reference Tables**:
  - All API endpoints (method, path, request/response schema)
  - React component tree (all components and hierarchy)
  - Database migrations commands
  - Testing commands
  - Deployment URLs
  - Demo credentials
  - Git commands
- **Troubleshooting Guide** (common issues and solutions)

**Audience**: Dev 1 (Backend Lead) & Dev 2 (Frontend Lead).

**When to use**: 
- Read Task 0 (Shared Infrastructure) first
- Dev 1 reads all Backend tasks and Day-by-day breakdown
- Dev 2 reads all Frontend tasks and Day-by-day breakdown
- Copy-paste code scaffolding into your project
- Reference API endpoint table while coding
- Use "Definition of Done" to verify completion

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Read the Master Plan (15 min)
```bash
# Read high-level overview
cat SPRINT_PLAN_72H.md | head -200
```

### Step 2: Set Up Shared Infrastructure (Start here!)
```bash
# Read and follow Phase 0 (Shared Infrastructure Setup)
# Opens: TASK_BREAKDOWN_DEV_ACTIONLIST.md → "Shared Infrastructure Setup" section
# Follow tasks 0.0 through 0.4
# Expected time: 3 hours (both devs)
```

### Step 3: Assign Daily Work (Dev 1 & Dev 2)
```bash
# Read the Per-Developer Daily Sprint Breakdown section
# Dev 1: Follow backend track
# Dev 2: Follow frontend track
# Start with hours 0-6 while Phase 0 is happening
```

### Step 4: Reference During Development
```bash
# Keep these open in separate tabs:
1. TASK_BREAKDOWN_DEV_ACTIONLIST.md → "Quick Reference: All API Endpoints"
2. TASK_BREAKDOWN_DEV_ACTIONLIST.md → "Quick Reference: React Component Tree"
3. SPRINT_PLAN_72H.md → "Risk Mitigation" (check issues as they arise)
```

---

## 📊 Structure Overview

### SPRINT_PLAN_72H.md Contents
1. Executive Summary
2. Phase Breakdown (8 phases with time allocations)
3. Dependency Map & Critical Path
4. Architecture & Technical Decisions
5. Risk Mitigation
6. Demo Data Strategy
7. Quality Checkpoints
8. Git Commit Strategy
9. Per-Developer Task Assignments
10. Success Metrics & Acceptance Criteria
11. Tools & Tech Stack

**Size**: ~10,000 words | **Read Time**: 45-60 minutes

---

### TASK_BREAKDOWN_DEV_ACTIONLIST.md Contents
1. Shared Infrastructure Setup (code samples included)
2. Recommended Work Order & Parallelization
3. Per-Developer Daily Sprint Breakdown
4. Quick Reference: All API Endpoints (table)
5. Quick Reference: React Component Tree (ASCII)
6. Detailed Story Breakdown (US-1.1 through US-6.3):
   - 6 stories in EPIC 1 (Auth)
   - 4 stories in EPIC 2 (Profiles)
   - 4 stories in EPIC 3 (Campaigns)
   - 2 stories in EPIC 4 (Recommendations)
   - 3 stories in EPIC 5 (Messaging)
   - 3 stories in EPIC 6 (Reviews)
7. Definition of Done Checklists
8. Testing Commands
9. Troubleshooting Guide

**Size**: ~3,200 lines | **Read Time**: 2-3 hours (while starting to code)

---

## 🗓️ 72-Hour Timeline

```
HOUR 0-6      (WAVE 1): Setup + Shared Infrastructure
              ├─ Git + Monorepo structure
              ├─ PostgreSQL + Prisma schema
              ├─ Shared TypeScript types
              ├─ Backend auth middleware
              └─ Frontend auth context + routing

HOUR 6-24     (WAVE 2A): Auth + Profiles (Parallel tracks)
              ├─ Dev 1: Auth endpoints + tests
              ├─ Dev 2: Auth UI (login, register)
              ├─ Dev 1: Profile endpoints
              ├─ Dev 2: Profile setup + edit UI
              └─ Both: Integration testing

HOUR 24-36    (WAVE 2B): Campaigns (Parallel tracks)
              ├─ Dev 1: Campaign CRUD endpoints
              ├─ Dev 2: Campaign UI (brand + influencer)
              └─ Both: Integration & polish

HOUR 36-50    (WAVE 3): Advanced Features (Parallel tracks)
              ├─ Dev 1: Recommendations engine + endpoints
              ├─ Dev 1: Testing & integration
              ├─ Dev 2: Messaging UI + polling
              ├─ Dev 2: Reviews UI
              └─ Both: E2E tests + performance benchmarks

HOUR 50-60    (WAVE 4A): Demo Prep & Testing
              ├─ Demo data seed script
              ├─ Smoke tests on production
              └─ Both: Demo rehearsal

HOUR 60-72    (WAVE 4B): Deployment & Final Polish
              ├─ Backend deployment (Render/Railway)
              ├─ Frontend deployment (Vercel)
              ├─ Production verification
              └─ Final polish + buffer
```

---

## 🎯 Success Metrics

### End of Day 1 (24h): Foundation Complete
- [ ] All shared infrastructure set up
- [ ] Auth system working (register → login → JWT)
- [ ] Profile setup flow working
- [ ] 20+ passing tests
- [ ] All developers can register, login, see dashboard

### End of Day 2 (48h): Core Features Complete
- [ ] Campaigns CRUD working
- [ ] Messaging endpoints + UI complete
- [ ] Recommendations algorithm implemented
- [ ] Reviews system working
- [ ] 50+ passing tests
- [ ] E2E tests for 5 main flows passing

### End of Day 3 (72h): Production Ready
- [ ] All 23 stories marked DONE
- [ ] Demo data seeded
- [ ] Deployed to production (Render + Vercel)
- [ ] Smoke tests passing
- [ ] Demo rehearsal complete
- [ ] >80% test coverage

---

## 📝 For Each Developer

### Dev 1 (Backend Lead) — Start Here
1. Read SPRINT_PLAN_72H.md → "Architecture Decisions" section (15 min)
2. Open TASK_BREAKDOWN_DEV_ACTIONLIST.md
3. Go to → "Shared Infrastructure Setup" → Tasks 0.0 to 0.4 (3 hours)
4. Then follow → "Per-Developer Daily Sprint Breakdown" → "Dev 1" track
5. Keep "Quick Reference: All API Endpoints" table open while coding
6. Use "Definition of Done" checklist to verify each story is complete

### Dev 2 (Frontend Lead) — Start Here
1. Read SPRINT_PLAN_72H.md → "Architecture Decisions" section (15 min)
2. Open TASK_BREAKDOWN_DEV_ACTIONLIST.md
3. Assist with → "Shared Infrastructure Setup" → Tasks 0.0 to 0.4 (3 hours)
4. Then follow → "Per-Developer Daily Sprint Breakdown" → "Dev 2" track
5. Keep "Quick Reference: React Component Tree" open while coding
6. Use "Definition of Done" checklist to verify each story is complete

---

## 🔧 Key Decisions

### Technology Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (Supabase/Neon)
- **Deployment**: Vercel (frontend) + Render/Railway (backend)
- **Auth**: JWT (jsonwebtoken package)
- **Testing**: Jest (backend) + Vitest (frontend)
- **ORM**: Prisma

### Architecture Highlights
- **Shared types** in monorepo (`packages/shared/`) to prevent API mismatches
- **Context API** for state management (AuthContext, ProfileContext, MessageContext)
- **Middleware-first** backend (auth, logging, error handling)
- **Weighted scoring algorithm** for recommendations (niche 40%, follower tier 30%, completeness 20%, reviews 10%)
- **Server-side polling** for message notifications (10-sec interval with exponential backoff)
- **Database indexes** on high-query columns (niche, status, budget, followerCount, createdAt)

---

## ⚠️ Critical Paths & Dependencies

### Most Critical (Blocks Everything)
1. Phase 0 (Shared Infrastructure) — **must complete first** (6 hours)
2. Auth endpoints + UI — **must work before dashboards** (12 hours)
3. Database schema — **must be correct to avoid mid-sprint migrations** (3 hours)

### Next Critical
4. Campaign endpoints + UI — **foundation for recommendations & reviews**
5. Recommendation algorithm — **demonstrates platform value at demo**
6. Messaging system — **shows real-time capability**

### Nice-to-Haves (Deferred if needed)
- Advanced search filters (can use basic search)
- Profile analytics (can show static data)
- Message threading UI (can use flat list)
- Review moderation features (US-6.3, deferred post-demo)

---

## 🚨 Risk Mitigation Quick Reference

| Risk | Mitigation | Owner |
|---|---|---|
| **DB performance issues** | Add indexes on day 1, load test with 50 concurrent users | Dev 1 |
| **API-Frontend mismatch** | Share TypeScript types, daily integration tests | Both |
| **Messaging too slow** | Cache unread count, polling with backoff, test <5s response | Dev 2 |
| **Deployment fails** | Deploy to staging 24h before demo, have rollback plan | Dev 1 |
| **Token expires during demo** | Use 7-day refresh tokens, refresh before demo starts | Dev 2 |
| **Git merge conflicts** | Strict file ownership, merge to main daily | Both |
| **Feature incomplete** | All 23 stories listed upfront, no scope creep | Both |

---

## 📞 Questions? Troubleshooting?

### Common Issues (See troubleshooting guide)
- CORS errors → Check backend CORS config
- Cannot find @influencerhub/shared → Check monorepo setup
- DB connection refused → Verify DATABASE_URL
- JWT expired → Use refresh token flow

### Running Locally
```bash
# 1. Install dependencies
npm install

# 2. Create .env files (see TASK_BREAKDOWN_DEV_ACTIONLIST.md)
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.example packages/frontend/.env

# 3. Start dev servers
npm run dev

# Backend: http://localhost:5000
# Frontend: http://localhost:5173
```

### Testing
```bash
cd packages/backend && npm test        # Backend tests
cd packages/frontend && npm test       # Frontend tests
```

---

## 📋 Checklist: Before You Start

- [ ] Read SPRINT_PLAN_72H.md (45 min)
- [ ] Read TASK_BREAKDOWN_DEV_ACTIONLIST.md sections 1-4 (30 min)
- [ ] Dev 1 has backend assigned, Dev 2 has frontend assigned
- [ ] Database credentials ready (Supabase/Neon)
- [ ] Render/Railway account set up (for backend)
- [ ] Vercel account set up (for frontend)
- [ ] Git repo initialized locally
- [ ] Node.js 18.x+ installed
- [ ] PostgreSQL client or managed instance ready
- [ ] Slack/Discord channel for team sync ready
- [ ] Timer set for daily checkpoints (EOD each day)

---

## 🎬 Let's Build!

You have everything you need. 

**Start with Phase 0 (Shared Infrastructure Setup) in TASK_BREAKDOWN_DEV_ACTIONLIST.md.**

Good luck, and ship fast! 🚀

---

*Last Updated: Day 1, Hour 0*  
*Total Scope: 23 user stories, 6 epics, 72 hours, 2 developers, production-grade quality.*
