# InfluencerHub Backend

Node.js/Express API server for the InfluencerHub platform.

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Installation

```bash
cd backend
npm install
```

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Update with your database URL:
```
DATABASE_URL="postgresql://user:password@localhost:5432/influencerhub"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
PORT=5000
NODE_ENV=development
```

### Database Setup

Run migrations:
```bash
npx prisma migrate dev
```

Seed demo data:
```bash
npm run prisma:seed
```

### Running

Development with hot reload:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register/brand` - Brand registration
- `POST /api/v1/auth/register/influencer` - Influencer registration
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `GET /api/v1/auth/me` - Get current user

### Profiles
- `GET /api/v1/profiles/brand` - Get brand profile
- `PUT /api/v1/profiles/brand` - Update brand profile
- `GET /api/v1/profiles/influencer` - Get influencer profile
- `PUT /api/v1/profiles/influencer` - Update influencer profile
- `POST /api/v1/profiles/portfolio` - Add portfolio item
- `GET /api/v1/profiles/portfolio` - Get portfolio items
- `GET /api/v1/profiles/public/brand/:userId` - Get public brand profile
- `GET /api/v1/profiles/public/influencer/:userId` - Get public influencer profile

### Campaigns
- `POST /api/v1/campaigns` - Create campaign (Brand)
- `GET /api/v1/campaigns` - Browse campaigns
- `GET /api/v1/campaigns/:campaignId` - Get campaign details
- `PUT /api/v1/campaigns/:campaignId` - Edit campaign (Brand)
- `POST /api/v1/campaigns/:campaignId/close` - Close campaign (Brand)
- `GET /api/v1/campaigns/:campaignId/status` - Get campaign status

### Applications
- `POST /api/v1/applications` - Apply to campaign (Influencer)
- `PATCH /api/v1/applications/:applicationId/accept` - Accept application (Brand)
- `PATCH /api/v1/applications/:applicationId/reject` - Reject application (Brand)
- `GET /api/v1/applications/campaign/:campaignId` - Get campaign applications (Brand)
- `GET /api/v1/applications/influencer/my-applications` - Get my applications (Influencer)

### Messaging
- `POST /api/v1/messages` - Send message
- `GET /api/v1/messages/inbox` - Get inbox
- `GET /api/v1/messages/thread/:campaignId/:otherUserId` - Get message thread
- `GET /api/v1/messages/unread/count` - Get unread count

### Reviews
- `POST /api/v1/reviews` - Leave review
- `GET /api/v1/reviews/user/:userId` - Get user reviews
- `GET /api/v1/reviews/stats/:userId` - Get review stats
- `POST /api/v1/reviews/:reviewId/report` - Report review

### Recommendations
- `GET /api/v1/recommendations/:campaignId` - Get recommended influencers
- `GET /api/v1/recommendations/search/campaigns` - Search campaigns (Influencer)

### Admin
- `GET /api/v1/admin/users` - Get all users (pagination)
- `GET /api/v1/admin/users/:userId` - Get user details
- `PATCH /api/v1/admin/users/:userId/deactivate` - Deactivate user
- `DELETE /api/v1/admin/users/:userId` - Delete user

## Testing

Run all tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Database Schema

### Users
- id (String, PK)
- email (String, unique)
- password (String, bcrypt hashed)
- role (BRAND | INFLUENCER | ADMIN)
- isActive (Boolean)
- createdAt
- updatedAt

### Profiles
- BrandProfile: company info, budget, industry
- InfluencerProfile: niche, platform, followers, engagement
- PortfolioItem: links to past work (max 10 per influencer)

### Campaigns
- title, description, budget tier, niche
- status: OPEN | IN_PROGRESS | COMPLETED | CLOSED
- influencersNeeded, deadline

### Campaign Applications
- status: PENDING | ACCEPTED | REJECTED

### Messages
- campaignId, senderId, receiverId
- text, isRead

### Reviews
- campaignId, reviewerId, reviewedUserId
- rating (1-5), comment
- isReported flag

## Architecture

- **Routes**: Express routers for each feature
- **Services**: Business logic separated from routes
- **Middleware**: Auth, error handling, logging
- **Database**: Prisma ORM with PostgreSQL
- **Security**: JWT auth, bcrypt passwords, input validation

## Performance

- Database indexes on frequently queried fields (niche, status, budget, followerCount)
- Stateless backend for horizontal scaling
- Message polling at 10-second intervals
- Recommendation caching (1 hour TTL)

## Deployment

### Render/Railway

1. Connect GitHub repo
2. Set environment variables
3. Run migrations: `npx prisma migrate deploy`
4. Deploy

### Vercel Functions (Optional)

For serverless deployment, move routes to `/api` functions.

## Troubleshooting

### Database Connection Error
- Check DATABASE_URL format
- Verify PostgreSQL is running
- Check network connection

### JWT Errors
- Ensure JWT_SECRET is set
- Check token expiry (default 15m)
- Use refresh token endpoint

### Prisma Issues
- Run `npx prisma generate` after schema changes
- Delete node_modules and reinstall
- Check .prisma/client generation

## Support

For issues, check the main README.md or create an issue on GitHub.
