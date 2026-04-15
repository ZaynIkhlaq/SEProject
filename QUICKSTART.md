# ⚡ Quick Start Guide

Get InfluencerHub running in 5 minutes.

## Prerequisites
- Node.js 18+
- npm

## Setup

### 1. Backend Setup
```bash
cd backend
npm install
npx prisma db push      # Creates SQLite database
npx prisma db seed      # Seeds demo data
npm run dev             # Starts on http://localhost:5001
```

### 2. Frontend Setup (new terminal)
```bash
cd frontend
npm install
npm run dev             # Starts on http://localhost:5173
```

### 3. Open Browser
```bash
# Visit the app
open http://localhost:5173
```

## Demo Credentials

```
Brand Account:
  Email: brand@demo.com
  Password: password123

Influencer Account:
  Email: influencer@demo.com
  Password: password123
```

## Test the Platform

1. **Brand Workflow**
   - Login as brand
   - Create a campaign
   - View applications
   - Accept/reject applications

2. **Influencer Workflow**
   - Login as influencer
   - Browse campaigns
   - Apply to a campaign
   - View application status

3. **Messaging**
   - Send messages between brand and influencer
   - View message threads

## Ports

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5001/api/v1
- **Database**: SQLite (backend/prisma/dev.db)

## Troubleshooting

### Port already in use
```bash
# Kill process on port 5001 (backend)
lsof -ti:5001 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

### Database issues
```bash
# Reset database
rm backend/prisma/dev.db
npx prisma db push
npx prisma db seed
```

### Node modules issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Common Commands

### Backend
```bash
npm run dev              # Development server
npm run build            # Production build
npm run start            # Run production build
npm run test             # Run tests
npx prisma studio       # Open database GUI
```

### Frontend
```bash
npm run dev              # Development server
npm run build            # Production build
npm run preview          # Preview production build
```

## Next Steps

- See **README.md** for full documentation
- Check **backend/README.md** for API endpoints
- Check **frontend/README.md** for component guide
