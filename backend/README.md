# Backend API

Node.js/Express REST API for InfluencerHub.

## Setup

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
cd backend
npm install
npx prisma db push      # Create database
npx prisma db seed      # Seed demo data
npm run dev             # Start development server
```

## Running

**Development** (with hot reload):
```bash
npm run dev
```

**Production**:
```bash
npm run build
npm start
```

**Database Management**:
```bash
npx prisma studio      # Open database GUI
npx prisma db push     # Sync schema
npx prisma db seed     # Run seed script
```

## API Endpoints

All endpoints use `/api/v1` prefix and require `Content-Type: application/json`

### Authentication
```
POST   /auth/register/brand         - Brand signup
POST   /auth/register/influencer    - Influencer signup
POST   /auth/login                  - Login (returns JWT)
POST   /auth/refresh                - Refresh access token
GET    /auth/me                     - Get current user
```

### Profiles
```
GET    /profiles/brand              - Get my brand profile
PUT    /profiles/brand              - Update my brand profile
GET    /profiles/influencer         - Get my influencer profile
PUT    /profiles/influencer         - Update my influencer profile
POST   /profiles/portfolio          - Add portfolio item
GET    /profiles/portfolio          - Get my portfolio
GET    /profiles/public/brand/:id   - Get brand profile (public)
GET    /profiles/public/influencer/:id - Get influencer profile (public)
```

### Campaigns
```
GET    /campaigns                   - List all campaigns
POST   /campaigns                   - Create campaign (Brand only)
GET    /campaigns/:id               - Get campaign details
PATCH  /campaigns/:id               - Update campaign (Brand only)
PATCH  /campaigns/:id/close         - Close campaign (Brand only)
```

### Applications
```
POST   /applications                - Apply to campaign (Influencer only)
GET    /applications/campaign/:id   - Get campaign applications (Brand only)
GET    /applications/influencer/my-applications - My applications (Influencer only)
PATCH  /applications/:id/accept     - Accept application (Brand only)
PATCH  /applications/:id/reject     - Reject application (Brand only)
```

### Messages
```
GET    /messages/inbox              - Get message threads
POST   /messages                    - Send message
GET    /messages/thread/:campaignId/:userId - Get thread messages
GET    /messages/unread/count       - Get unread count
```

### Reviews
```
POST   /reviews                     - Create review
GET    /reviews/campaign/:id        - Get campaign reviews
GET    /reviews/user/:id            - Get reviews for user
PATCH  /reviews/:id/report          - Report a review
```

### Admin
```
GET    /admin/users                 - List all users (Admin only)
PATCH  /admin/users/:id/suspend     - Suspend user (Admin only)
PATCH  /admin/users/:id/activate    - Activate user (Admin only)
GET    /admin/reports               - Get flagged content (Admin only)
```

### Recommendations
```
GET    /recommendations/influencers/:campaignId - Get recommended influencers
```

## Authentication

All endpoints (except `/auth/*`) require JWT token in header:

```bash
Authorization: Bearer <access_token>
```

Access tokens expire in 15 minutes. Use refresh token to get new one:

```bash
POST /api/v1/auth/refresh
{
  "refreshToken": "<refresh_token>"
}
```

## Architecture

### Services (Business Logic)
- `AuthService` - User registration & authentication
- `ProfileService` - Profile & portfolio management
- `CampaignService` - Campaign CRUD operations
- `ApplicationService` - Campaign applications
- `MessageService` - Direct messaging
- `ReviewService` - Campaign reviews & ratings
- `AdminService` - User management & moderation
- `RecommendationService` - Influencer recommendations

### Middleware
- `authMiddleware` - JWT verification
- `roleCheck` - Role-based access control
- `errorHandler` - Global error handling
- `requestLogger` - HTTP request logging

### Database
- **ORM**: Prisma
- **DB**: SQLite (development), PostgreSQL (production)
- **Schema**: 7 tables with proper relationships

## Testing

```bash
npm run test              # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

## Environment Variables

```
DATABASE_URL            # Database connection string
JWT_SECRET              # Secret key for access tokens
JWT_REFRESH_SECRET      # Secret key for refresh tokens
JWT_EXPIRY              # Access token expiry (default: 15m)
JWT_REFRESH_EXPIRY      # Refresh token expiry (default: 7d)
PORT                    # Server port (default: 5001)
NODE_ENV                # Environment (development/production)
```

## Development

### Adding an Endpoint

1. Create route handler in `src/routes/*.ts`
2. Create service method if needed
3. Add auth middleware if required
4. Test with curl or Postman
5. Document in this README

### Database Changes

1. Update `prisma/schema.prisma`
2. Run: `npx prisma db push`
3. Update services if needed
4. Run seed if needed: `npx prisma db seed`

## Deployment

### To Render

```bash
# Push to GitHub
git push origin main

# In Render:
# - Create new Web Service
# - Connect to GitHub repository
# - Set build command: npm run build
# - Set start command: npm start
# - Add environment variables (DATABASE_URL, JWT_SECRET, etc.)
```

### Database on Neon (PostgreSQL)

1. Create account at neon.tech
2. Create PostgreSQL project
3. Copy connection string
4. Set DATABASE_URL in environment
5. Update Prisma provider to `postgresql`
6. Run: `npx prisma db push`
