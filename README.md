# InfluencerHub

A modern full-stack influencer-brand collaboration platform built with React, Node.js, Express, and SQLite.

## 🎯 What is InfluencerHub?

InfluencerHub connects brands with influencers for campaign collaborations. Brands create campaigns and discover top creators, while influencers browse opportunities and apply to campaigns that match their niche.

## 📋 Features

- **Brand Dashboard**: Create campaigns, manage applications, discover influencers
- **Influencer Dashboard**: Browse campaigns, apply to opportunities, track application status
- **Campaign Management**: Create, edit, close campaigns with detailed requirements
- **Messaging System**: Direct communication between brands and influencers
- **Recommendations**: AI-powered influencer matching based on niche and engagement
- **Admin Dashboard**: User management and platform moderation
- **Authentication**: JWT-based auth with role-based access control (Brand/Influencer/Admin)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm

### Setup (Local)

```bash
# 1. Clone the repository
git clone <repo-url>
cd SEProject

# 2. Setup backend
cd backend
npm install
npx prisma db push  # Creates SQLite database
npx prisma db seed   # Seeds demo data

# 3. Start backend (in new terminal)
npm run dev          # Runs on http://localhost:5001

# 4. Setup frontend (in new terminal from root)
cd frontend
npm install
npm run dev          # Runs on http://localhost:5173
```

### Demo Credentials

**Brand Account**
- Email: `brand@demo.com`
- Password: `password123`

**Influencer Account**
- Email: `influencer@demo.com`
- Password: `password123`

### Access the App

Open http://localhost:5173 in your browser and login with demo credentials.

## 📁 Project Structure

```
SEProject/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── index.ts        # Express app entry
│   │   ├── middleware/     # Auth, error handling, logging
│   │   ├── services/       # Business logic (8 services)
│   │   ├── routes/         # API routes (8 route files)
│   │   └── shared/         # Shared types
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts         # Demo data seeding
│   └── package.json
│
├── frontend/               # React + TypeScript frontend
│   ├── src/
│   │   ├── pages/         # Page components by role
│   │   ├── components/    # Reusable components
│   │   ├── context/       # Auth context & state
│   │   ├── shared/        # Shared types & utilities
│   │   └── App.tsx        # Router config
│   ├── tailwind.config.js # Design tokens
│   └── package.json
│
├── README.md              # This file
└── QUICKSTART.md          # Quick reference guide
```

## 🏗️ Architecture

### Backend Stack
- **Express.js** - REST API framework
- **TypeScript** - Type safety
- **Prisma** - ORM for database
- **SQLite** - Local database
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Frontend Stack
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling with Ramp design system
- **Vite** - Build tool
- **Axios** - HTTP client

## 🔌 API Endpoints

All endpoints are prefixed with `/api/v1`

### Authentication
- `POST /auth/register/brand` - Register brand
- `POST /auth/register/influencer` - Register influencer
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token

### Campaigns
- `GET /campaigns` - List all campaigns
- `POST /campaigns` - Create campaign (Brand only)
- `GET /campaigns/:id` - Get campaign details
- `PATCH /campaigns/:id` - Update campaign (Brand only)
- `PATCH /campaigns/:id/close` - Close campaign (Brand only)

### Applications
- `POST /applications` - Apply to campaign (Influencer only)
- `PATCH /applications/:id/accept` - Accept application (Brand only)
- `PATCH /applications/:id/reject` - Reject application (Brand only)
- `GET /applications/influencer/my-applications` - Get my applications (Influencer only)

### Messaging
- `GET /messages/inbox` - Get message threads
- `POST /messages` - Send message
- `GET /messages/thread/:campaignId/:userId` - Get message thread
- `GET /messages/unread/count` - Get unread count

### Profiles
- `GET /profiles/brand` - Get brand profile
- `PUT /profiles/brand` - Update brand profile
- `GET /profiles/influencer` - Get influencer profile
- `PUT /profiles/influencer` - Update influencer profile

## 📊 Database Schema

### Core Models
- **User** - Authentication and role management
- **BrandProfile** - Brand information
- **InfluencerProfile** - Influencer details and portfolio
- **Campaign** - Brand campaigns
- **CampaignApplication** - Influencer applications
- **Message** - Direct messages between users
- **Review** - Campaign reviews and ratings

## 🎨 Design System

The frontend follows **Ramp's design philosophy**:
- Modern, professional aesthetic
- Dark mode support
- Smooth animations and micro-interactions
- Responsive design (mobile-first)
- High contrast for accessibility

### Color Palette
- **Primary**: Purple (#8b5cf6)
- **Accent**: Teal (#06b6d4)
- **Surface**: Black (#0a0a0a) for dark mode
- **Neutral**: Gray scale for text and borders

## 🧪 Testing

### Backend
```bash
cd backend
npm run test              # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

### Frontend
```bash
cd frontend
npm run test              # Run tests
npm run build             # Production build
```

## 🚀 Deployment

### To Vercel (Frontend)
```bash
cd frontend
vercel --prod
```

### To Render (Backend)
```bash
# Connect Render to GitHub repository
# Backend will auto-deploy on push to main
```

### Production Database
Switch to PostgreSQL on Neon:
1. Update `DATABASE_URL` in backend `.env`
2. Change Prisma provider from `sqlite` to `postgresql`
3. Push schema: `npx prisma db push`

See `QUICKSTART.md` for detailed deployment steps.

## 📝 Development

### Commit Strategy
- Use atomic commits with clear messages
- Follow pattern: `type(scope): message`
- Examples:
  - `feat(auth): implement JWT refresh token`
  - `fix(campaign): correct budget tier filter`
  - `refactor: redesign login page with Ramp aesthetic`

### Code Style
- TypeScript for all new code
- Prettier formatting (automatic on commit)
- ESLint for linting

## 📚 Additional Documentation

- **QUICKSTART.md** - Quick reference for common tasks
- **backend/README.md** - Backend API documentation
- **frontend/README.md** - Frontend component guide

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make atomic commits
3. Push to branch: `git push origin feature/your-feature`
4. Create a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🎯 Next Steps

1. Run the local setup above
2. Login with demo credentials
3. Test end-to-end flows
4. Explore the code structure
5. Refer to `QUICKSTART.md` for common tasks
