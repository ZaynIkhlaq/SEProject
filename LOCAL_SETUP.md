# InfluencerHub - Local Setup & Testing Guide

## 🚀 Quick Start (5-10 minutes)

### Prerequisites
- Node.js 20+ installed
- PostgreSQL 15+ running locally
- Git (repository already cloned)

---

## Part 1: Setup Backend

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 2: Setup Database

**Option A: Using PostgreSQL Locally**

1. Start PostgreSQL server (if not running):
```bash
# macOS with Homebrew
brew services start postgresql

# Or check if running:
brew services list
```

2. Create database and user:
```bash
createdb influencerhub
createuser influencerhub_user -P  # Password: set any password
```

3. Grant permissions:
```bash
psql influencerhub
GRANT ALL PRIVILEGES ON DATABASE influencerhub TO influencerhub_user;
\q
```

**Option B: Using Docker (Easier)**

```bash
docker run --name postgres-influencerhub \
  -e POSTGRES_USER=influencerhub_user \
  -e POSTGRES_PASSWORD=testpass123 \
  -e POSTGRES_DB=influencerhub \
  -p 5432:5432 \
  -d postgres:15
```

### Step 3: Configure Environment Variables

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your database connection:

```env
DATABASE_URL="postgresql://influencerhub_user:testpass123@localhost:5432/influencerhub"
JWT_SECRET="dev-secret-key-change-in-production"
JWT_REFRESH_SECRET="dev-refresh-secret-key"
JWT_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"
PORT=5000
NODE_ENV="development"
```

### Step 4: Setup Database Schema

```bash
# Generate Prisma client
npm run prisma:generate

# Create tables (migrations)
npm run prisma:push

# Seed demo data
npm run prisma:seed
```

Expected output:
```
✔ Enter a password (just press enter):
✔ Prisma Client generated successfully
✔ Executing migrations

Data seeded successfully!
- Created demo brand: brand@demo.com / password123
- Created demo influencer: influencer@demo.com / password123
- Created 3 campaigns
- Created messages
- Created reviews
```

### Step 5: Start Backend Server

```bash
npm run dev
```

Expected output:
```
Server running on http://localhost:5000
✓ Backend started with hot reload
```

**Backend is now running!** ✅

---

## Part 2: Setup Frontend

### Step 1: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### Step 2: Configure Environment (Optional)

```bash
cp .env.example .env.development
```

The default dev proxy already points to `http://localhost:5000`, so no changes needed.

### Step 3: Start Frontend Development Server

```bash
npm run dev
```

Expected output:
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  press h to show help
```

**Frontend is now running!** ✅

---

## Part 3: Test the Platform

### Open in Browser

Go to: **http://localhost:5173**

You should see the login page.

---

## Testing Scenarios

### Scenario 1: Test Brand Account

#### 1. Brand Registration
1. Click **Brand Register**
2. Fill in:
   - Email: `brand-test@demo.com`
   - Password: `TestPass123!`
   - Company Name: `My Test Brand`
   - Industry: `Technology`
   - Budget Tier: `TIER_50K_200K`
3. Click **Register**
4. Should redirect to Brand Dashboard

#### 2. Brand Dashboard
- See stats (total campaigns, active, completed)
- Click **Create Campaign** button

#### 3. Create Campaign
1. Fill in campaign form:
   - Title: `Looking for Tech Influencers`
   - Product/Service: `Mobile App Promotion`
   - Required Niche: `Technology`
   - Budget Tier: `TIER_50K_200K`
   - Influencers Needed: `3`
   - Deadline: `2024-12-31`
   - Description: `Help promote our new mobile app`
2. Click **Create Campaign**
3. Should see success message
4. Campaign appears in dashboard

#### 4. View Campaign Details
1. Click on campaign in dashboard
2. See campaign info and stats
3. View applications section (empty for new campaign)

#### 5. Edit Profile
1. Click **Edit Profile** in dashboard
2. Update company bio and website
3. Click **Save**
4. Should see success message

#### 6. Find Recommended Influencers
1. Click **Find Influencers** in dashboard
2. See ranked influencer recommendations with match scores
3. Click **View Full Profile** to see influencer details
4. Click **Interest** button (shows API integration works)

---

### Scenario 2: Test Influencer Account

#### 1. Influencer Registration
1. Logout from brand account (click Logout)
2. Click **Influencer Register**
3. Fill in:
   - Email: `influencer-test@demo.com`
   - Password: `TestPass123!`
   - Niche: `Technology`
   - Platform: `Instagram`
   - Follower Count: `50000`
   - Engagement Rate: `0.08` (8%)
4. Click **Register**
5. Should redirect to Influencer Dashboard

#### 2. Influencer Dashboard
- See stats (total applications, accepted, pending)
- Click **Browse Campaigns** button

#### 3. Browse Campaigns
1. See list of available campaigns
2. Try filters:
   - Filter by Niche: "Technology"
   - Filter by Budget: "TIER_50K_200K"
3. Click **Apply Now** on a campaign
4. Should see success message
5. Button changes to "Applied"

#### 4. View Application Status
1. Go back to Influencer Dashboard
2. See the applied campaign in "My Applications"
3. Status should show "PENDING"

#### 5. Edit Influencer Profile
1. Click **Edit Profile** in dashboard
2. Update bio, location, motto
3. Add portfolio items:
   - Click **Add Portfolio Item**
   - URL: `https://example.com/project1`
   - Description: `Tech app launch campaign`
   - Click **Add**
4. Add up to 10 items
5. Delete items by clicking **Delete**
6. Click **Save Profile**

#### 6. View Campaign Details
1. Click on a campaign in Browse Campaigns
2. See campaign details
3. View brand company info

---

### Scenario 3: Test Brand Reviewing Applications

#### 1. Switch Back to Brand Account
1. Logout as influencer
2. Login as `brand@demo.com` / `password123`

#### 2. View Campaign Applications
1. Go to Brand Dashboard
2. Click on a campaign
3. Should see applications from influencers who applied
4. See influencer profile info (niche, followers, engagement)

#### 3. Accept/Reject Applications
1. Click **Accept** on an application
   - Status changes to green "ACCEPTED"
2. Click **Reject** on another
   - Status changes to red "REJECTED"
3. Accepted count increases in campaign stats

#### 4. Send Message
1. Click **Messages** in navigation
2. Click on an influencer to start chat
3. Type message: "Great work! We'd like to collaborate"
4. Click **Send**
5. Message appears in thread with timestamp

#### 5. View Message History
1. Go to Messages page
2. See thread list on left
3. Click on thread to view conversation
4. See unread badge on threads with new messages

---

### Scenario 4: Test Influencer Messaging

#### 1. Switch to Influencer Account
1. Logout from brand
2. Login as `influencer@demo.com` / `password123`

#### 2. Check Messages
1. Click **Messages** in navigation
2. See brand's message in inbox
3. Unread badge shows number
4. Click message to reply
5. Type: "Thank you! Looking forward to it"
6. Click **Send**

#### 3. Message Polling
- Wait 10 seconds
- Should see new messages appear automatically (polling at 10s intervals)

---

### Scenario 5: Test Admin Features

#### 1. Create Admin Account (Manual DB)

For now, manually create admin via seeded data or API:

```bash
# In backend terminal, check seed file for admin credentials
cat prisma/seed.ts
```

Or update seed.ts to include admin and re-run:
```bash
npm run prisma:seed
```

#### 2. Access Admin Dashboard
1. Login with admin account
2. Should see Admin Dashboard link in nav
3. Click **Admin Dashboard**

#### 3. User Management
1. See list of all users (paginated)
2. Filter by role (Brand, Influencer, Admin)
3. Search by email
4. Click **Deactivate** on a user
   - User status changes to inactive
5. Click **Delete** on a user
   - User permanently removed

---

### Scenario 6: Test Reviews

#### Note: Reviews API exists but not yet fully integrated in UI. Can test via API:

```bash
# Get auth token from login response
TOKEN="your_jwt_token_here"

# Create review
curl -X POST http://localhost:5000/api/reviews \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "campaign-id",
    "reviewedUserId": "user-id",
    "rating": 5,
    "comment": "Great collaboration!"
  }'

# View reviews for a user
curl -X GET http://localhost:5000/api/reviews/user/user-id \
  -H "Authorization: Bearer $TOKEN"
```

---

## Part 4: API Testing with Curl

### Quick API Tests

#### 1. Register Brand
```bash
curl -X POST http://localhost:5000/api/auth/register/brand \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newbrand@test.com",
    "password": "Password123!",
    "companyName": "Test Company",
    "industry": "Technology",
    "budgetTier": "TIER_50K_200K"
  }'
```

Expected: Returns access token and user info

#### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "brand@demo.com",
    "password": "password123"
  }'
```

Expected: Returns tokens and user data

#### 3. Get Brand Profile
```bash
TOKEN="from_login_response"
curl -X GET http://localhost:5000/api/profiles/brand \
  -H "Authorization: Bearer $TOKEN"
```

Expected: Returns brand profile data

#### 4. Create Campaign
```bash
curl -X POST http://localhost:5000/api/campaigns \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Campaign Title",
    "productService": "Product/Service",
    "requiredNiche": "Technology",
    "budgetTier": "TIER_50K_200K",
    "influencersNeeded": 5,
    "deadline": "2024-12-31",
    "description": "Campaign description"
  }'
```

Expected: Returns created campaign

#### 5. Browse Campaigns
```bash
curl -X GET "http://localhost:5000/api/campaigns?niche=Technology&budgetTier=TIER_50K_200K" \
  -H "Authorization: Bearer $TOKEN"
```

Expected: Returns list of matching campaigns

---

## Troubleshooting

### Issue: "DATABASE_URL is not defined"
**Solution**: Make sure `.env` file exists in `/backend` with DATABASE_URL

### Issue: "Port 5000 already in use"
**Solution**: 
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or start on different port
PORT=5001 npm run dev
```

### Issue: "Cannot connect to database"
**Solution**: 
```bash
# Test PostgreSQL connection
psql -U influencerhub_user -d influencerhub -c "SELECT 1"

# Or check if PostgreSQL is running
brew services list | grep postgres
```

### Issue: "Prisma migration failed"
**Solution**:
```bash
# Reset database
npm run prisma:push -- --force-reset

# Re-seed data
npm run prisma:seed
```

### Issue: "Frontend doesn't connect to backend"
**Solution**: 
- Make sure backend is running on http://localhost:5000
- Check browser DevTools → Network tab for API calls
- Look for CORS errors in console

### Issue: "JWT token invalid/expired"
**Solution**: 
- Login again to get new token
- Check browser DevTools → Application → Cookies for refresh token
- Clear cookies and login fresh

---

## Demo Data (Pre-Seeded)

After running `npm run prisma:seed`, you have:

### Accounts
- **Brand**: `brand@demo.com` / `password123`
- **Influencer**: `influencer@demo.com` / `password123`

### Demo Campaigns
- "AI Tool Promotion" - Open
- "Fashion Campaign" - Open
- "Tech Startup Launch" - Open

### Demo Messages
- Existing conversation between demo brand and influencer

### Demo Reviews
- 5-star review from previous collaboration

---

## Testing Checklist

- [ ] Backend server starts without errors
- [ ] Frontend loads in browser
- [ ] Can register brand account
- [ ] Can register influencer account
- [ ] Can login with both accounts
- [ ] Can create campaign (as brand)
- [ ] Can browse campaigns (as influencer)
- [ ] Can apply to campaign
- [ ] Can view applications (as brand)
- [ ] Can accept/reject applications
- [ ] Can send messages
- [ ] Can receive messages with polling
- [ ] Can view public profiles
- [ ] Can edit own profile
- [ ] Can add/delete portfolio items
- [ ] Can view recommendations
- [ ] Can access admin dashboard
- [ ] API endpoints work with curl

---

## Next Steps: Production Deployment

Once everything works locally:

1. **Deploy Backend**: See DEPLOYMENT.md for Render setup
2. **Deploy Frontend**: See DEPLOYMENT.md for Vercel setup
3. **Run Smoke Tests**: Follow smoke test section in DEPLOYMENT.md
4. **Monitor Production**: Setup logs and alerts

---

## Performance Testing

### Measure Page Load Times
```bash
# Frontend build time
cd frontend && npm run build

# Check bundle size
ls -lh dist/assets/
```

### Test API Response Times
```bash
# Login endpoint timing
time curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"brand@demo.com","password":"password123"}'
```

Target: < 1s per API call

---

## Need Help?

- **Backend issues**: Check `backend/src/index.ts` and middleware
- **Frontend issues**: Check `frontend/src/App.tsx` and routing
- **Database issues**: Check `backend/prisma/schema.prisma`
- **API docs**: See `backend/README.md`
- **Deployment**: See `DEPLOYMENT.md`

**Happy testing! 🎉**
