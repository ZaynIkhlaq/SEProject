# InfluencerHub Deployment Guide

This guide covers deploying the InfluencerHub platform to production using **Render** (backend) and **Vercel** (frontend).

## Prerequisites

- GitHub repository connected (https://github.com/ZaynIkhlaq/SEProject)
- Render account (https://render.com)
- Vercel account (https://vercel.com)
- PostgreSQL database (Render provides this)

## Deployment Architecture

```
┌─────────────────┐
│   GitHub Repo   │ (source code)
└────────┬────────┘
         │
    ┌────┴──────┐
    │            │
┌───▼────┐  ┌──▼────────┐
│Render  │  │  Vercel   │
│Backend │  │ Frontend  │
│(Node)  │  │(React)    │
└────┬───┘  └──┬────────┘
     │         │
     │    ┌────┴────┐
     │    │Internet │
     └────┤         │
          └─────────┘
```

---

## Part 1: Backend Deployment (Render)

### Step 1: Prepare Backend for Deployment

1. Create `.env` file in `/backend` with production values:

```bash
cd backend
cp .env.example .env
```

2. Edit `.env` with production values (you'll get DATABASE_URL from Render):

```env
DATABASE_URL="postgresql://user:password@hostname:5432/influencerhub"
JWT_SECRET="generate-secure-random-string-here"
JWT_REFRESH_SECRET="generate-another-secure-random-string-here"
JWT_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"
PORT="5000"
NODE_ENV="production"
```

3. Make sure `npm run build` succeeds locally:

```bash
npm run build
```

4. Verify database is ready:

```bash
npm run prisma:generate
npm run prisma:push
```

### Step 2: Deploy Backend on Render

1. Go to https://dashboard.render.com/
2. Click **New +** → **Web Service**
3. Connect GitHub repository
4. Select the repository
5. Configure:
   - **Name**: `influencerhub-api`
   - **Repository**: `ZaynIkhlaq/SEProject`
   - **Branch**: `main`
   - **Build Command**: `cd backend && npm install && npm run build && npm run prisma:generate`
   - **Start Command**: `cd backend && npm run start`
   - **Environment**: Node
   - **Instance Type**: Standard (or Free tier for testing)

6. Add Environment Variables in Render dashboard:
   - `DATABASE_URL` - PostgreSQL connection string
   - `JWT_SECRET` - Secure random string
   - `JWT_REFRESH_SECRET` - Another secure random string
   - `NODE_ENV` - `production`
   - `PORT` - `5000` (Render assigns automatically, but set for clarity)

7. Click **Create Web Service**
8. Wait for deployment to complete (5-10 minutes)
9. Copy the backend URL from Render (e.g., `https://influencerhub-api.onrender.com`)

### Step 3: Setup Database on Render

1. Go to https://dashboard.render.com/
2. Click **New +** → **PostgreSQL**
3. Configure:
   - **Name**: `influencerhub-db`
   - **Database**: `influencerhub`
   - **User**: `influencerhub_user`
   - **Region**: Same as backend service
   - **PostgreSQL Version**: 15

4. Click **Create Database**
5. Copy the **Internal Database URL** into backend environment variables as `DATABASE_URL`
6. The web service will automatically redeploy with the database URL

---

## Part 2: Frontend Deployment (Vercel)

### Step 1: Prepare Frontend for Deployment

1. Make sure environment file is set up:

```bash
cd frontend
cp .env.example .env.production
```

2. Edit `.env.production`:

```env
VITE_API_URL=https://influencerhub-api.onrender.com/api
```

(Replace with your actual Render backend URL)

3. Build frontend locally to verify:

```bash
npm run build
```

Output should show:
```
✓ built in XXms
```

### Step 2: Deploy Frontend on Vercel

1. Go to https://vercel.com/new
2. Connect GitHub repository
3. Select the repository
4. Configure:
   - **Project Name**: `influencerhub-frontend`
   - **Framework**: React
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variables:
   - `VITE_API_URL` = `https://influencerhub-api.onrender.com/api`

6. Click **Deploy**
7. Wait for deployment to complete (2-5 minutes)
8. Copy the frontend URL (e.g., `https://influencerhub-frontend.vercel.app`)

---

## Part 3: Post-Deployment Configuration

### Update Backend CORS Settings

If CORS errors occur, update backend CORS in `backend/src/index.ts`:

```typescript
const app = express();
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://influencerhub-frontend.vercel.app']
    : 'http://localhost:5173',
  credentials: true
}));
```

Commit and push - Render will auto-redeploy.

### Test Production Deployment

1. Open frontend URL in browser: `https://influencerhub-frontend.vercel.app`
2. Try registering a new account (Brand or Influencer)
3. Create a campaign and verify API calls work
4. Test messaging, profile updates, and application flows

---

## Part 4: Production Smoke Tests

### Authentication Flow

```bash
# 1. Register Brand
curl -X POST https://influencerhub-api.onrender.com/api/auth/register/brand \
  -H "Content-Type: application/json" \
  -d '{
    "email": "brand@test.com",
    "password": "TestPass123!",
    "companyName": "Test Company",
    "industry": "Tech",
    "budgetTier": "TIER_50K_200K"
  }'

# 2. Login
curl -X POST https://influencerhub-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "brand@test.com",
    "password": "TestPass123!"
  }'

# 3. Get Profile (use token from login response)
curl -X GET https://influencerhub-api.onrender.com/api/profiles/brand \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### API Health Check

```bash
# Should return 404 (no auth) - that's OK
curl https://influencerhub-api.onrender.com/api/campaigns
```

---

## Part 5: Monitoring & Maintenance

### Render Logs

1. Go to Render dashboard
2. Select the web service
3. Click **Logs** tab to view real-time logs

### Vercel Analytics

1. Go to Vercel dashboard
2. Select the project
3. View **Analytics** for performance metrics

### Database Backups

Render automatically backs up PostgreSQL. To restore:
1. Go to Render Dashboard → PostgreSQL
2. Click **Backups**
3. Restore if needed

---

## Part 6: Troubleshooting

### Backend Deployment Issues

**Problem**: `npm ERR! code ETARGET`
- **Solution**: Update package.json versions and commit before deploying

**Problem**: `Database connection error`
- **Solution**: Verify DATABASE_URL in Render environment variables includes the full connection string

**Problem**: `Build failed`
- **Solution**: Check Render logs → scroll to build step for specific error

### Frontend Deployment Issues

**Problem**: `API calls return 404 or CORS error`
- **Solution**: Verify `VITE_API_URL` matches backend URL in Vercel environment variables

**Problem**: `Cannot find module errors`
- **Solution**: Make sure `npm install` ran, check `package.json` dependencies

### Runtime Issues

**Problem**: `401 Unauthorized on protected routes`
- **Solution**: JWT tokens might not be refreshing - check browser DevTools → Network → check Authorization headers

**Problem**: `Message polling not working`
- **Solution**: Check browser console for errors, verify API endpoint `/messages/unread` exists

---

## Deployment Checklist

- [ ] Backend repository pushed to GitHub
- [ ] Frontend repository pushed to GitHub  
- [ ] `.env` files created with production values
- [ ] Database created on Render
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] CORS configured correctly
- [ ] Environment variables set in both services
- [ ] Tested registration flow
- [ ] Tested login flow
- [ ] Tested campaign creation
- [ ] Tested messaging
- [ ] API health check passes
- [ ] Frontend loads without errors
- [ ] Database backups configured

---

## Production URLs

Once deployed:
- **Frontend**: `https://influencerhub-frontend.vercel.app`
- **Backend API**: `https://influencerhub-api.onrender.com/api`
- **Database**: Managed by Render (internal only)

---

## Environment Variables Reference

### Backend (.env)
```
DATABASE_URL=postgresql://user:pwd@host:5432/db
JWT_SECRET=[random-256-bit-string]
JWT_REFRESH_SECRET=[random-256-bit-string]
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
PORT=5000
NODE_ENV=production
```

### Frontend (.env.production)
```
VITE_API_URL=https://influencerhub-api.onrender.com/api
```

---

## Support & Next Steps

For more information:
- Render docs: https://render.com/docs
- Vercel docs: https://vercel.com/docs
- GitHub: https://github.com/ZaynIkhlaq/SEProject

**Questions?** Check the main README.md or SPRINT_PLAN_72H.md for architecture details.
