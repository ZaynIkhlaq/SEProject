# ⚡ InfluencerHub - 1-Minute Quick Start

**Prerequisites**: Node.js 20+, PostgreSQL (or Docker)

## Copy-Paste Setup (Pick ONE terminal setup below)

### Option 1: With Docker PostgreSQL (Easiest)

```bash
# 1. Start database in background (one-time)
docker run --name postgres-influencerhub -e POSTGRES_USER=influencerhub_user -e POSTGRES_PASSWORD=testpass123 -e POSTGRES_DB=influencerhub -p 5432:5432 -d postgres:15

# 2. Terminal 1: Backend
cd /Users/zain/Cooking/SEProject/backend
npm install
cp .env.example .env
# Edit .env: DATABASE_URL="postgresql://influencerhub_user:testpass123@localhost:5432/influencerhub"
npm run prisma:generate && npm run prisma:push && npm run prisma:seed
npm run dev

# 3. Terminal 2: Frontend  
cd /Users/zain/Cooking/SEProject/frontend
npm install
npm run dev

# 4. Browser
open http://localhost:5173
```

### Option 2: With Local PostgreSQL (macOS)

```bash
# 1. Start PostgreSQL (one-time)
brew services start postgresql

# 2. Setup database (one-time)
createdb influencerhub
createuser influencerhub_user -P
# Enter password: testpass123
psql influencerhub -c "GRANT ALL PRIVILEGES ON DATABASE influencerhub TO influencerhub_user;"

# 3-4. Same as above (Backend & Frontend setup)
```

---

## Login Credentials (Pre-seeded)

```
Brand Account:
  Email: brand@demo.com
  Password: password123

Influencer Account:
  Email: influencer@demo.com
  Password: password123
```

---

## What to Test

1. **Login** with brand account → See dashboard
2. **Create Campaign** → Fill form, submit
3. **Logout** → Switch to influencer account
4. **Browse Campaigns** → Apply to campaign you created
5. **Logout** → Switch back to brand
6. **Review Applications** → Accept/reject the application
7. **Try Messaging** → Send message to influencer
8. **Explore Everything** → Check out profiles, recommendations, etc.

---

## Ports

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Database: localhost:5432

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 5000 in use | `lsof -ti:5000 \| xargs kill -9` |
| DB connection error | Check DATABASE_URL in .env |
| No login page shown | Check backend running on :5000 |
| Auth token invalid | Logout & login again |

---

## Full Docs

- **LOCAL_SETUP.md** - Complete guide with 6 testing scenarios
- **DEPLOYMENT.md** - Production deployment to Render + Vercel
- **PROJECT_STATUS.md** - Feature list & architecture
- **README.md** - Main overview

---

**That's it! You now have a fully functional influencer collaboration platform. 🚀**
