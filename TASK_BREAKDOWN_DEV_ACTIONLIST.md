# InfluencerHub — Developer Action List (Task-Level Breakdown)
**72-Hour Sprint — All 23 User Stories Detailed**

Last Updated: Day 1, Hour 0  
Audience: Dev 1 (Backend Lead) & Dev 2 (Frontend Lead)  
Status: Ready to execute immediately

---

## Table of Contents

1. [Shared Infrastructure Setup](#shared-infrastructure-setup)
2. [Recommended Work Order & Parallelization](#recommended-work-order--parallelization)
3. [Per-Developer Daily Sprint Breakdown](#per-developer-daily-sprint-breakdown)
4. [Quick Reference: All API Endpoints](#quick-reference-all-api-endpoints)
5. [Quick Reference: React Component Tree](#quick-reference-react-component-tree)
6. [Detailed Story Breakdown (US-1.1 through US-6.3)](#detailed-story-breakdown)
7. [Definition of Done Checklists](#definition-of-done-checklists)

---

## Shared Infrastructure Setup

### Phase 0: Project Initialization (BEFORE ALL STORIES — 3 hours, both devs)

#### Task 0.0: Git & Package Structure
**Owner**: Dev 1  
**Time**: 1 hour

```bash
# 1. Initialize Git repo
git init
git config user.email "dev1@influencerhub.local"
git config user.name "Dev 1"

# 2. Create folder structure
mkdir -p packages/shared packages/backend packages/frontend
mkdir -p .github/workflows

# 3. Root package.json (monorepo)
```

**Root `package.json`:**
```json
{
  "name": "influencerhub",
  "version": "0.1.0",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "dev": "npm run dev --workspace=packages/backend & npm run dev --workspace=packages/frontend",
    "build": "npm run build --workspaces",
    "test": "npm test --workspaces",
    "seed": "npm run seed --workspace=packages/backend"
  }
}
```

**Commit**: `chore: init monorepo structure`

---

#### Task 0.1: Database & Prisma Setup
**Owner**: Dev 1  
**Time**: 1.5 hours

**1. Create `packages/backend/prisma/schema.prisma`:**

```prisma
// This is your Prisma schema file. Do NOT edit manually after migrations start.

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// ===== ENUMS =====

enum UserRole {
  BRAND
  INFLUENCER
  ADMIN
}

enum CampaignStatus {
  OPEN
  CLOSED
  ARCHIVED
}

enum ApplicationStatus {
  PENDING
  ACCEPTED
  REJECTED
}

// ===== MODELS =====

model User {
  id            String   @id @default(cuid())
  email         String   @unique @db.VarChar(255)
  passwordHash  String   @db.VarChar(255)
  role          UserRole @default(INFLUENCER)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  brandProfile       BrandProfile?
  influencerProfile  InfluencerProfile?
  campaignsCreated   Campaign[]
  applications       Application[]
  messagesAsSender   Message[] @relation("sender")
  messagesAsRecipient Message[] @relation("recipient")
  reviewsAsReviewer   Review[] @relation("reviewer")
  reviewsAsReviewed   Review[] @relation("reviewed")

  @@index([email])
  @@index([role])
}

model BrandProfile {
  id             String   @id @default(cuid())
  userId         String   @unique
  name           String   @db.VarChar(255)
  website        String?  @db.VarChar(255)
  industry       String?  @db.VarChar(100)
  description    String?
  logoUrl        String?  @db.VarChar(255)
  mediaKitUrl    String?  @db.VarChar(255)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model InfluencerProfile {
  id              String   @id @default(cuid())
  userId          String   @unique
  name            String   @db.VarChar(255)
  bio             String?
  avatarUrl       String?  @db.VarChar(255)
  followerCount   Int      @default(0)
  niche           String?  @db.VarChar(100)
  portfolioLinks  Json     @default("[]")  // [{name: "Instagram", url: "..."}]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([niche])
  @@index([followerCount])
}

model Campaign {
  id              String         @id @default(cuid())
  brandId         String
  title           String         @db.VarChar(255)
  description     String
  budget          Decimal        @db.Decimal(10, 2)
  deadline        DateTime
  requiredNiche   String?        @db.VarChar(100)
  status          CampaignStatus @default(OPEN)
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  brand        User          @relation(fields: [brandId], references: [id], onDelete: Cascade)
  applications Application[]
  reviews      Review[]

  @@index([brandId])
  @@index([status])
  @@index([requiredNiche])
  @@index([budget])
  @@index([createdAt])
}

model Application {
  id            String            @id @default(cuid())
  campaignId    String
  influencerId  String
  status        ApplicationStatus @default(PENDING)
  portfolioLink String?           @db.VarChar(255)
  createdAt     DateTime          @default(now())
  updatedAt     DateTime          @updatedAt

  campaign   Campaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  influencer User     @relation(fields: [influencerId], references: [id], onDelete: Cascade)

  @@unique([campaignId, influencerId])
  @@index([campaignId])
  @@index([influencerId])
  @@index([status])
}

model Message {
  id          String   @id @default(cuid())
  senderId    String
  recipientId String
  content     String
  isRead      Boolean  @default(false)
  createdAt   DateTime @default(now())

  sender    User @relation("sender", fields: [senderId], references: [id], onDelete: Cascade)
  recipient User @relation("recipient", fields: [recipientId], references: [id], onDelete: Cascade)

  @@index([senderId])
  @@index([recipientId])
  @@index([isRead])
  @@index([createdAt])
}

model Review {
  id           String   @id @default(cuid())
  reviewerId   String   // BRAND who reviews
  reviewedId   String   // INFLUENCER being reviewed
  campaignId   String
  rating       Int      // 1-5
  comment      String?
  createdAt    DateTime @default(now())

  reviewer User     @relation("reviewer", fields: [reviewerId], references: [id], onDelete: Cascade)
  reviewed User     @relation("reviewed", fields: [reviewedId], references: [id], onDelete: Cascade)
  campaign Campaign @relation(fields: [campaignId], references: [id], onDelete: SetNull)

  @@unique([campaignId])
  @@index([reviewedId])
  @@index([campaignId])
  @@index([createdAt])
}
```

**2. Backend environment setup:**

Create `packages/backend/.env.example`:
```
DATABASE_URL=postgresql://user:password@localhost:5432/influencerhub
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
```

**3. Initialize Prisma:**

```bash
cd packages/backend
npm install @prisma/client prisma
npx prisma init
npx prisma db push  # Create DB from schema
npx prisma generate
```

**Commit**: `db: add Prisma schema with all models`

---

#### Task 0.2: Shared Types & Interfaces
**Owner**: Dev 1  
**Time**: 1 hour

Create `packages/shared/types.ts`:

```typescript
// ===== ENUMS =====

export type UserRole = 'BRAND' | 'INFLUENCER' | 'ADMIN';
export type CampaignStatus = 'OPEN' | 'CLOSED' | 'ARCHIVED';
export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

// ===== USER TYPES =====

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface BrandProfile {
  id: string;
  userId: string;
  name: string;
  website?: string;
  industry?: string;
  description?: string;
  logoUrl?: string;
  mediaKitUrl?: string;
  profileCompletion: number; // 0-100
  createdAt: string;
  updatedAt: string;
}

export interface InfluencerProfile {
  id: string;
  userId: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  followerCount: number;
  niche?: string;
  portfolioLinks: Array<{ name: string; url: string }>;
  profileCompletion: number; // 0-100
  avgRating?: number; // 0-5
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

// ===== CAMPAIGN TYPES =====

export interface Campaign {
  id: string;
  brandId: string;
  title: string;
  description: string;
  budget: number;
  deadline: string; // ISO8601
  requiredNiche?: string;
  status: CampaignStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  campaignId: string;
  influencerId: string;
  status: ApplicationStatus;
  portfolioLink?: string;
  createdAt: string;
  updatedAt: string;
}

// ===== MESSAGE TYPES =====

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  recipientId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

// ===== REVIEW TYPES =====

export interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  rating: number; // 1-5
  comment?: string;
  campaignId: string;
  createdAt: string;
}

export interface ReviewSummary {
  avgRating: number; // 0-5, or 0 if no reviews
  totalReviews: number;
  reviews: Review[];
}

// ===== RECOMMENDATION TYPES =====

export interface RecommendedInfluencer {
  id: string;
  name: string;
  niche: string;
  followerCount: number;
  profileCompletion: number;
  avgRating: number;
  score: number; // 0-1, display as %
  profileUrl: string;
}

export interface RecommendedCampaign {
  id: string;
  title: string;
  budget: number;
  deadline: string;
  requiredNiche: string;
  brandName: string;
  score: number; // 0-1, display as %
  campaignUrl: string;
}

// ===== API RESPONSE TYPES =====

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  timestamp: string;
}

export interface PaginationParams {
  limit?: number; // default 20, max 100
  offset?: number; // default 0
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  limit: number;
  offset: number;
  timestamp: string;
}

// ===== REQUEST TYPES =====

export interface RegisterRequest {
  email: string;
  password: string;
  role: UserRole;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface CreateCampaignRequest {
  title: string;
  description: string;
  budget: number;
  deadline: string; // ISO8601
  requiredNiche?: string;
}

export interface UpdateCampaignRequest {
  title?: string;
  description?: string;
  budget?: number;
  deadline?: string;
  requiredNiche?: string;
}

export interface ApplyToCampaignRequest {
  portfolioLink?: string;
}

export interface SendMessageRequest {
  recipientId: string;
  content: string;
}

export interface LeaveReviewRequest {
  influencerId: string;
  campaignId: string;
  rating: number; // 1-5
  comment?: string;
}

// ===== FILTER TYPES =====

export interface CampaignFilterOptions {
  status?: CampaignStatus;
  niche?: string;
  budgetMin?: number;
  budgetMax?: number;
  deadlineAfter?: string; // ISO8601
  deadlineBefore?: string; // ISO8601
  search?: string; // full-text search on title + description
}

export interface InfluencerFilterOptions {
  niche?: string;
  followerCountMin?: number;
  followerCountMax?: number;
  search?: string; // full-text search on name + bio
}
```

Create `packages/shared/api-client.ts`:

```typescript
import { ApiResponse, PaginatedResponse } from './types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
    };
  }

  async request<T>(
    method: string,
    endpoint: string,
    body?: any,
    options?: { skipAuth?: boolean }
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      method,
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 401 && !options?.skipAuth) {
      // Token expired, clear and redirect to login (handle in app)
      this.clearToken();
      throw new Error('Unauthorized');
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Request failed');
    }
    return data;
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint);
  }

  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, body);
  }

  async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, body);
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint);
  }
}

export const apiClient = new ApiClient();
```

**Commit**: `types: add shared TypeScript interfaces and API client`

---

#### Task 0.3: Backend Base Setup (Express, Auth Middleware)
**Owner**: Dev 1  
**Time**: 1 hour

Create `packages/backend/src/middleware/auth.ts`:

```typescript
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: 'BRAND' | 'INFLUENCER' | 'ADMIN';
        email: string;
      };
    }
  }
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No token provided',
      code: 'NO_AUTH',
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      email: decoded.email,
    };
    next();
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN',
      timestamp: new Date().toISOString(),
    });
  }
};

export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        code: 'FORBIDDEN',
        timestamp: new Date().toISOString(),
      });
    }
    next();
  };
};
```

Create `packages/backend/src/index.ts`:

```typescript
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json({ limit: '1mb' }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${requestId}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });

  next();
});

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: { status: 'ok' },
    timestamp: new Date().toISOString(),
  });
});

// Error handler (at the end)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
    code: err.code || 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

export { app, prisma };
```

Create `packages/backend/package.json`:

```json
{
  "name": "influencerhub-backend",
  "version": "0.1.0",
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "jest",
    "seed": "ts-node scripts/seed.ts"
  },
  "dependencies": {
    "@prisma/client": "^5.0.0",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.0.0",
    "express": "^4.18.2",
    "jsonwebtoken": "^9.0.0"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.2",
    "@types/express": "^4.17.17",
    "@types/jest": "^29.0.0",
    "@types/node": "^18.0.0",
    "jest": "^29.0.0",
    "prisma": "^5.0.0",
    "ts-node": "^10.0.0",
    "typescript": "^5.0.0"
  }
}
```

**Commit**: `chore: setup backend base with Express and auth middleware`

---

#### Task 0.4: Frontend Base Setup (React, Context, Routing)
**Owner**: Dev 2  
**Time**: 1 hour

Create `packages/frontend/package.json`:

```json
{
  "name": "influencerhub-frontend",
  "version": "0.1.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.12.0"
  },
  "devDependencies": {
    "@tailwindcss/forms": "^0.5.3",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.24",
    "tailwindcss": "^3.3.2",
    "typescript": "^5.0.0",
    "vite": "^4.3.9",
    "vitest": "^0.34.0"
  }
}
```

Create `packages/frontend/src/context/AuthContext.tsx`:

```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@influencerhub/shared';

export interface AuthUser {
  id: string;
  email: string;
  role: 'BRAND' | 'INFLUENCER' | 'ADMIN';
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Decode JWT and set user on mount
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: decoded.userId,
          email: decoded.email,
          role: decoded.role,
        });
        apiClient.setToken(token);
      } catch (err) {
        console.error('Invalid token');
        localStorage.removeItem('token');
        setToken(null);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiClient.post<{ token: string; refreshToken: string }>(
      '/auth/login',
      { email, password }
    );

    if (response.success && response.data) {
      const { token } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      apiClient.setToken(token);

      const decoded = JSON.parse(atob(token.split('.')[1]));
      setUser({
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      });
    }
  };

  const register = async (email: string, password: string, role: string, name: string) => {
    const response = await apiClient.post<{ token: string; refreshToken: string }>(
      '/auth/register',
      { email, password, role, name }
    );

    if (response.success && response.data) {
      const { token } = response.data;
      localStorage.setItem('token', token);
      setToken(token);
      apiClient.setToken(token);

      const decoded = JSON.parse(atob(token.split('.')[1]));
      setUser({
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      });
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    apiClient.clearToken();
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

Create `packages/frontend/src/components/ProtectedRoute.tsx`:

```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import React, { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
```

Create `packages/frontend/src/App.tsx`:

```typescript
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Auth routes */}
          <Route path="/login" element={<div>LoginPage (TODO)</div>} />
          <Route path="/register" element={<div>RegisterPage (TODO)</div>} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Dashboard (TODO)</div>
              </ProtectedRoute>
            }
          />

          {/* Default */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
```

Create `packages/frontend/tailwind.config.js`:

```js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/forms')],
};
```

**Commit**: `chore: setup frontend base with React, Context, Routing`

---

## Recommended Work Order & Parallelization

### Wave 1 (Hours 0-6): Setup Complete

**Both devs** finish shared infrastructure setup above.

**Commit**: `chore: Wave 1 complete — all base setup done`

---

### Wave 2 (Hours 6-30): Auth + Profiles + Campaigns (PARALLEL)

```
PARALLEL TRACK A (Dev 1):          PARALLEL TRACK B (Dev 2):
Hours 6-12: Auth Backend            Hours 6-12: Auth Frontend
  US-1.1, US-1.2, US-1.3             Login UI, Register UI

Hours 12-18: Profile Backend        Hours 12-18: Profile Frontend
  US-2.1, US-2.2                      ProfileSetup UI, ProfileEdit UI

Hours 18-24: Campaign Backend       Hours 18-24: Campaign Frontend
  US-3.1, US-3.2, US-3.3             CampaignCreate UI, CampaignList UI

Hours 24-30: Campaign Polish        Hours 24-30: Campaign Polish
  Testing, refinement                Testing, refinement
```

**Commit after each story**: `feat(story-id): message`

---

### Wave 3 (Hours 30-50): Messaging + Recommendations + Reviews (PARALLEL)

```
PARALLEL TRACK A (Dev 1):          PARALLEL TRACK B (Dev 2):
Hours 30-40: Recommendations        Hours 30-40: Messaging Frontend
  US-4.1, US-4.2 (Algorithm)         US-5.1, US-5.2, US-5.3 UI

Hours 40-50: Testing & Integration  Hours 40-50: Reviews Frontend
                                     US-6.1, US-6.2 UI
                                     + Messaging Polling Integration
```

---

### Wave 4 (Hours 50-72): Testing, Deployment, Polish (BOTH)

- Hours 50-52: Demo data seeding
- Hours 52-68: Backend + Frontend deployment
- Hours 68-72: Final smoke tests, demo rehearsal

---

## Per-Developer Daily Sprint Breakdown

### Day 1 (Hours 0-24)

#### Dev 1 (Backend Lead)
```
Hours 0-3:   Wave 1 setup (Git, DB, Prisma schema)
             Commits: chore: init monorepo, db: add schema

Hours 3-6:   Shared types + Auth middleware setup
             Commits: types: add interfaces, chore: backend setup

Hours 6-12:  Auth endpoints (register, login, refresh, admin)
             Unit tests for auth flow
             Commits: feat(1.1): brand register, feat(1.2): influencer register, 
                      feat(1.3): login, feat(1.5): admin management,
                      test(auth): integration tests

Hours 12-18: Profile endpoints (GET me, PATCH me, GET public, search)
             Unit tests for profiles
             Commits: feat(2.1): brand profile API, feat(2.2): influencer profile API,
                      feat(2.3): portfolio links, feat(2.4): public profiles,
                      test(profile): unit tests

Hours 18-24: Campaign endpoints (POST create, PATCH edit, POST close, GET list, POST apply)
             Unit tests for campaigns
             Commits: feat(3.1): create campaign, feat(3.2): edit/close,
                      feat(3.3): list and apply,
                      test(campaign): unit tests

EOD Sync Commit (24h):
chore(daily): Day 1 checkpoint — Auth + Profile + Campaign endpoints complete (all tested)
```

#### Dev 2 (Frontend Lead)
```
Hours 0-3:   Wave 1 setup (React, Tailwind, Vite)
             Commits: chore: frontend setup

Hours 3-6:   Frontend base (App.tsx, AuthContext, ProtectedRoute)
             Commits: chore: frontend base setup

Hours 6-12:  Auth UI (LoginPage, RegisterPage, Navigation)
             Component tests for forms
             Commits: feat(1.1): register UI, feat(1.3): login UI,
                      feat(1.4): role-based dashboard navigation,
                      test(auth): component tests

Hours 12-18: Profile UI (ProfileSetupPage, ProfileEditPage, PublicProfilePage)
             Component tests
             Commits: feat(2.1): brand profile setup, feat(2.2): influencer profile setup,
                      feat(2.3): portfolio links UI, feat(2.4): public profile view,
                      test(profile): component tests

Hours 18-24: Campaign UI (CreateCampaignPage, CampaignListPage, CampaignDetailPage, BrandDashboard)
             Component tests
             Commits: feat(3.1): create campaign UI, feat(3.3): browse campaigns UI,
                      feat(3.4): campaign detail and status,
                      test(campaign): component tests

EOD Sync Commit (24h):
chore(daily): Day 1 checkpoint — Auth + Profile + Campaign UI complete (all tested)
```

---

### Day 2 (Hours 24-48)

#### Dev 1 (Backend Lead)
```
Hours 24-30: Campaign polish + InfluencerDashboard integration
             Commits: feat(3.4): campaign status tracking

Hours 30-40: Recommendation engine
             Algorithm logic, endpoints
             Unit tests for scoring
             Commits: feat(4.1): recommended influencers algorithm,
                      feat(4.2): campaign search and filtering,
                      test(recommendation): algorithm tests,
                      perf: add database indexes

Hours 40-50: Integration testing (E2E flows)
             Create 5 E2E test cases (Cypress/Playwright setup)
             Commits: test: e2e auth flow, test: e2e campaign flow, etc.

EOD Sync Commit (48h):
chore(daily): Day 2 checkpoint — Recommendations complete, E2E tests in progress
```

#### Dev 2 (Frontend Lead)
```
Hours 24-30: Dashboard refinement + InfluencerDashboard
             Commits: feat(1.4): influencer dashboard

Hours 30-40: Messaging UI (MessagesPage, Message components)
             Polling setup
             Component tests
             Commits: feat(5.1): send message UI, feat(5.2): inbox UI,
                      feat(5.3): unread badge,
                      test(messaging): polling tests

Hours 40-50: Reviews UI (ReviewFormModal, ReviewCard)
             Recommendation UI cards
             Component tests
             Commits: feat(6.1): leave review form, feat(6.2): review display,
                      feat(4.1): recommended influencers display,
                      test(review): component tests

EOD Sync Commit (48h):
chore(daily): Day 2 checkpoint — Messaging + Reviews + Recommendations UI complete
```

---

### Day 3 (Hours 48-72)

#### Both Devs (Collaborative)
```
Hours 48-52: Demo data seeding
             Create seed script with 5 demo users, 10 campaigns, 20 messages, 30 reviews
             Commits: chore: add demo seed script

Hours 52-68: Deployment
             Backend to Render: set env vars, deploy, health check
             Frontend to Vercel: build, deploy, test production API calls
             Commits: chore: backend deployment, chore: frontend deployment

Hours 68-72: Final smoke tests + Demo rehearsal
             Test all 5 flows on production
             Dry-run full demo (30-45 min)
             Commits: test: production smoke tests, docs: demo playbook

Final Commit (72h):
chore(release): Day 3 complete — InfluencerHub 0.1.0 production ready
```

---

## Quick Reference: All API Endpoints

### Base URL
`/api/v1`

### Auth Endpoints

| Method | Endpoint | Auth? | Request | Response |
|---|---|---|---|---|
| POST | `/auth/register` | No | `{email, password, role, name}` | `{token, refreshToken}` |
| POST | `/auth/login` | No | `{email, password}` | `{token, refreshToken}` |
| POST | `/auth/refresh` | No | `{refreshToken}` | `{token}` |
| POST | `/auth/logout` | Yes | — | `{success: true}` |

### User Endpoints

| Method | Endpoint | Auth? | Roles | Request | Response |
|---|---|---|---|---|---|
| GET | `/users/me` | Yes | All | — | `{user}` |
| GET | `/admin/users` | Yes | ADMIN | — | `[users]` |
| PATCH | `/admin/users/:id/role` | Yes | ADMIN | `{role}` | `{user}` |
| DELETE | `/admin/users/:id` | Yes | ADMIN | — | `{success}` |

### Profile Endpoints

| Method | Endpoint | Auth? | Roles | Request | Response |
|---|---|---|---|---|---|
| GET | `/profiles/me` | Yes | All | — | `{profile}` |
| PATCH | `/profiles/me` | Yes | All | `{...profile fields}` | `{profile}` |
| GET | `/profiles/:username` | No | — | — | `{profile}` |
| GET | `/profiles` | No | — | `?role=INFLUENCER&niche=fitness&search=...` | `[profiles]` |

### Campaign Endpoints

| Method | Endpoint | Auth? | Roles | Request | Response |
|---|---|---|---|---|---|
| GET | `/campaigns` | No | — | `?status=OPEN&niche=fitness&search=...&limit=20&offset=0` | `{data: [campaigns], total, limit, offset}` |
| GET | `/campaigns/:id` | No | — | — | `{campaign}` |
| POST | `/campaigns` | Yes | BRAND | `{title, description, budget, deadline, requiredNiche}` | `{campaign}` |
| PATCH | `/campaigns/:id` | Yes | BRAND (owner) | `{...campaign fields}` | `{campaign}` |
| POST | `/campaigns/:id/close` | Yes | BRAND (owner) | — | `{campaign}` |
| GET | `/campaigns/:id/recommended-influencers` | Yes | BRAND (owner) | — | `[{influencer, score}]` |

### Application Endpoints

| Method | Endpoint | Auth? | Roles | Request | Response |
|---|---|---|---|---|---|
| POST | `/campaigns/:id/apply` | Yes | INFLUENCER | `{portfolioLink}` | `{application}` |
| GET | `/campaigns/:id/applications` | Yes | BRAND (owner) | — | `[applications]` |
| PATCH | `/applications/:id` | Yes | BRAND (owner of campaign) | `{status: ACCEPTED\|REJECTED}` | `{application}` |

### Message Endpoints

| Method | Endpoint | Auth? | Roles | Request | Response |
|---|---|---|---|---|---|
| POST | `/messages` | Yes | All | `{recipientId, content}` | `{message}` |
| GET | `/messages/inbox` | Yes | All | `?limit=20&offset=0` | `{data: [messages], total, limit, offset}` |
| PATCH | `/messages/:id/read` | Yes | All | — | `{message}` |
| GET | `/messages/unread-count` | Yes | All | — | `{count}` |

### Review Endpoints

| Method | Endpoint | Auth? | Roles | Request | Response |
|---|---|---|---|---|---|
| POST | `/reviews` | Yes | BRAND | `{influencerId, campaignId, rating, comment}` | `{review}` |
| GET | `/profiles/:userId/reviews` | No | — | — | `{avgRating, totalReviews, reviews: []}` |
| POST | `/reviews/:id/report` | Yes | All | `{reason}` | `{report}` |

### Recommendation Endpoints

| Method | Endpoint | Auth? | Roles | Request | Response |
|---|---|---|---|---|---|
| GET | `/campaigns/:id/recommended-influencers` | Yes | BRAND | — | `[{influencer, score}]` |
| GET | `/influencers/recommended-campaigns` | Yes | INFLUENCER | — | `[{campaign, score}]` |

---

## Quick Reference: React Component Tree

```
App.tsx
├── AuthProvider
│   ├── Routes
│   │   ├── /login → LoginPage
│   │   ├── /register → RegisterPage
│   │   ├── /dashboard → ProtectedRoute
│   │   │   ├── BrandDashboard (if role === 'BRAND')
│   │   │   │   ├── Navigation
│   │   │   │   ├── Tabs
│   │   │   │   │   ├── "My Campaigns"
│   │   │   │   │   │   └── CampaignCard[] (with Edit/Close/Delete buttons)
│   │   │   │   │   └── "Applications"
│   │   │   │   │       └── ApplicationsTable
│   │   │   │   └── RecommendedInfluencersSection
│   │   │   │       └── RecommendationCard[]
│   │   │   │
│   │   │   └── InfluencerDashboard (if role === 'INFLUENCER')
│   │   │       ├── Navigation
│   │   │       ├── "Recommended for You"
│   │   │       │   └── RecommendedCampaignCard[]
│   │   │       └── "Browse Campaigns"
│   │   │           ├── CampaignFilterBar
│   │   │           └── CampaignCard[] (with "Apply" button)
│   │   │
│   │   ├── /profile/setup → ProfileSetupPage
│   │   │   └── ProfileForm (conditional: BrandProfileForm | InfluencerProfileForm)
│   │   │
│   │   ├── /profile/edit → ProfileEditPage
│   │   │   └── ProfileForm (pre-filled)
│   │   │
│   │   ├── /profile/:username → PublicProfilePage
│   │   │   ├── ProfileHeader (avatar, name, niche, follower count)
│   │   │   ├── ProfileStats (profile completion %)
│   │   │   ├── ReviewsSection
│   │   │   │   ├── RatingDisplay (avg, count)
│   │   │   │   └── ReviewCard[]
│   │   │   ├── PortfolioLinksSection (if influencer)
│   │   │   └── Actions ("Message", "Apply to Campaign")
│   │   │
│   │   ├── /campaigns → CampaignListPage
│   │   │   ├── CampaignFilterBar
│   │   │   └── CampaignCard[]
│   │   │
│   │   ├── /campaigns/create → CreateCampaignPage
│   │   │   └── CampaignForm
│   │   │
│   │   ├── /campaigns/:id → CampaignDetailPage
│   │   │   ├── CampaignHeader (title, brand, budget, deadline)
│   │   │   ├── CampaignDescription
│   │   │   ├── RecommendedInfluencersSection
│   │   │   │   └── RecommendationCard[]
│   │   │   ├── ApplicationsSection (if brand owner)
│   │   │   │   └── ApplicationCard[]
│   │   │   ├── ReviewButton (if applied/accepted)
│   │   │   └── ApplyButton or StatusBadge
│   │   │
│   │   ├── /messages → MessagesPage
│   │   │   ├── ConversationList
│   │   │   │   └── ConversationItem[]
│   │   │   └── MessageThread
│   │   │       ├── MessageBubble[]
│   │   │       └── MessageInputForm
│   │   │
│   │   ├── /admin/users → AdminUsersPage
│   │   │   └── UsersTable (with role change, delete)
│   │   │
│   │   └── /* → 404 Page
│   │
│   └── Navigation (global, shown on all pages)
│       ├── Logo
│       ├── User Email
│       ├── UnreadMessageBadge (polling updates)
│       ├── Links (dashboard, profile, messages)
│       └── Logout Button
```

---

## Detailed Story Breakdown

### EPIC 1: User Accounts & Login (5 stories)

---

## US-1.1: Brand Registration

**Story**: Brand can register with email, password, and company information  
**Type**: Must-Have  
**Priority**: Critical (blocks all brand features)

### Acceptance Criteria
- [ ] Brand can enter email and password
- [ ] Password must be at least 8 characters
- [ ] Email must be unique (no duplicates)
- [ ] Brand sees error if email already registered
- [ ] After registration, brand is logged in automatically
- [ ] Brand is redirected to profile setup page
- [ ] Brand receives JWT token

### Backend Tasks

**Task 1.1.1: POST /auth/register endpoint**

**Files**: `packages/backend/src/routes/auth.ts`

**API Specification**:
```
POST /api/v1/auth/register
Request:
{
  email: string (email format, required),
  password: string (min 8 chars, required),
  role: "BRAND" | "INFLUENCER" (required),
  name: string (required)
}

Response (201):
{
  success: true,
  data: {
    token: string,        // JWT, expires in 15 min
    refreshToken: string  // Expires in 7 days
  },
  timestamp: ISO8601
}

Error (400):
{
  success: false,
  error: "Email already registered",
  code: "EMAIL_EXISTS",
  timestamp: ISO8601
}

Error (400):
{
  success: false,
  error: "Password must be at least 8 characters",
  code: "INVALID_PASSWORD",
  timestamp: ISO8601
}
```

**Implementation**:
1. Validate email format (use regex or library like `email-validator`)
2. Check if email already exists in DB
3. Validate password length (≥ 8 chars)
4. Hash password using bcryptjs (10 salt rounds)
5. Create User record with role
6. Create empty profile (BrandProfile or InfluencerProfile)
7. Generate JWT tokens (use jsonwebtoken)
   - Access token: payload { userId, email, role }, expire 15 min
   - Refresh token: payload { userId }, expire 7 days
8. Return tokens

**Validation**:
- Email: Must be valid email format, unique
- Password: Min 8 chars (no other requirements for MVP)
- Role: Must be BRAND or INFLUENCER

**Error Handling**:
- Email exists → 400 + EMAIL_EXISTS
- Invalid email format → 400 + INVALID_EMAIL
- Password < 8 chars → 400 + INVALID_PASSWORD
- DB error → 500 + INTERNAL_ERROR

**Unit Tests** (1.5 hours):
```typescript
describe('POST /auth/register', () => {
  test('Brand registers successfully', async () => {
    // Should return 201, token in response
  });

  test('Rejects duplicate email', async () => {
    // Should return 400 + EMAIL_EXISTS
  });

  test('Rejects password < 8 chars', async () => {
    // Should return 400 + INVALID_PASSWORD
  });

  test('Creates BrandProfile with empty fields', async () => {
    // Should create profile record
  });

  test('JWT token decodes correctly', async () => {
    // Should have userId, email, role
  });
});
```

**Deliverables**:
- POST /auth/register endpoint
- Password hashing with bcryptjs
- JWT generation
- Unit tests
- Git commit: `feat(1.1): brand registration endpoint`

---

**Task 1.1.2: User profile creation trigger**

**Files**: `packages/backend/src/services/profileService.ts`

**Description**: When user registers, create empty profile record automatically.

**Implementation**:
- In register endpoint, after creating User:
  - If role === 'BRAND': Create BrandProfile with userId, empty fields
  - If role === 'INFLUENCER': Create InfluencerProfile with userId, empty fields

**Unit Tests** (0.5 hours):
```typescript
test('BrandProfile created on BRAND register', async () => {
  // Check DB for BrandProfile.userId === newUser.id
});

test('InfluencerProfile created on INFLUENCER register', async () => {
  // Check DB for InfluencerProfile.userId === newUser.id
});
```

---

**Backend Estimated Time**: 2 hours (1.5h endpoint + tests, 0.5h profile creation)

### Frontend Tasks

**Task 1.1.3: RegisterPage component**

**Files**: `packages/frontend/src/pages/RegisterPage.tsx`

**Component Specification**:
- Page title: "Sign Up"
- Form fields:
  - Email input (type: email, placeholder: "your@email.com", required)
  - Password input (type: password, min length 8, required)
  - Confirm password input (type: password, required, must match)
  - Name input (text, required)
  - Role radio/select (BRAND or INFLUENCER, required)
- Submit button: "Create Account"
- Link to login page: "Already have an account? Login"
- Error messages displayed inline
- Loading state on button during submission
- Password strength indicator (optional, but nice to have)

**UI/UX**:
- Responsive: Mobile (1 col), Tablet (1 col), Desktop (1 col centered)
- Tailwind classes:
  - Form container: `max-w-md mx-auto py-12 px-4`
  - Input: `@tailwindcss/forms` classes
  - Button: `bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded`
  - Error text: `text-red-600 text-sm mt-1`

**State & Hooks**:
- Local state: {email, password, confirmPassword, name, role, loading, error}
- Use `useAuth()` hook to access register function
- Use `useNavigate()` for redirect after registration
- Form validation before submit

**Validation**:
- Email: Non-empty, valid format
- Password: Min 8 chars
- Confirm password: Matches password
- Name: Non-empty
- Role: Selected

**Error Handling**:
- Display backend error messages inline
- Handle network errors gracefully
- Retry on failure

**Integration**:
```typescript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Frontend validation
  if (password !== confirmPassword) {
    setError("Passwords don't match");
    return;
  }
  
  setLoading(true);
  try {
    await register(email, password, role, name);
    // Redirect to profile setup
    navigate('/profile/setup');
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

**Component Tests** (1.5 hours):
```typescript
describe('RegisterPage', () => {
  test('Renders form with all fields', () => {
    // Should show email, password, confirm, name, role, submit button
  });

  test('Submits form with valid data', async () => {
    // Should call register() and navigate to /profile/setup
  });

  test('Shows error on duplicate email', async () => {
    // Should display "Email already registered" message
  });

  test('Validates password match', async () => {
    // Should show error if confirm password doesn't match
  });

  test('Shows loading state on submit', async () => {
    // Button should be disabled during submission
  });

  test('Links to login page', () => {
    // "Already have account?" link should go to /login
  });
});
```

**Deliverables**:
- RegisterPage component
- Form validation
- Component tests
- Git commit: `feat(1.1): register page UI`

---

**Frontend Estimated Time**: 2 hours (1.5h component + styling, 0.5h tests)

### Owner Assignment
- Backend: **Dev 1**
- Frontend: **Dev 2**

### Dependencies
- None (first story)

### Definition of Done
- [ ] Backend: POST /auth/register working, returns JWT
- [ ] Backend: Password hashing with bcryptjs verified
- [ ] Backend: BrandProfile created automatically
- [ ] Backend: Unit tests >80% coverage
- [ ] Backend: Error handling for email exists, invalid password
- [ ] Frontend: RegisterPage renders all fields
- [ ] Frontend: Form validation works (email, password length, match)
- [ ] Frontend: Submit creates user via API
- [ ] Frontend: User redirected to /profile/setup after registration
- [ ] Frontend: Component tests passing
- [ ] Frontend: Responsive design verified (mobile, tablet, desktop)
- [ ] Integration: Register → auto-login → redirect flow works end-to-end
- [ ] Git: Commits: `feat(1.1): brand registration endpoint` + `feat(1.1): register page UI`

---

## US-1.2: Influencer Registration

**Story**: Influencer can register with email, password, and personal information  
**Type**: Must-Have  
**Priority**: Critical

### Acceptance Criteria
- [ ] Influencer can enter email and password
- [ ] Password must be at least 8 characters
- [ ] Email must be unique
- [ ] After registration, influencer is logged in automatically
- [ ] Influencer is redirected to profile setup page
- [ ] Influencer receives JWT token

### Backend Tasks

**Task 1.2.1: Reuse POST /auth/register endpoint**

**Details**: Share same endpoint as US-1.1. Accept role parameter:
- `role: "BRAND"` → Create BrandProfile
- `role: "INFLUENCER"` → Create InfluencerProfile

**No additional backend work needed** (covered in US-1.1)

### Frontend Tasks

**Task 1.2.2: RegisterPage displays role selector**

**Details**: Modify RegisterPage from US-1.1 to show role selection:
- Radio buttons or dropdown: "I'm a Brand" vs "I'm an Influencer"
- Form fields adjust slightly based on role (name stays same)

**No major changes** — already implemented in RegisterPage.tsx

**Frontend Estimated Time**: 0.5 hours (already included in US-1.1)

### Owner Assignment
- Backend: **Dev 1** (included in US-1.1)
- Frontend: **Dev 2** (included in US-1.1)

### Dependencies
- US-1.1 (same endpoint)

### Definition of Done
- [ ] Influencer can register with role = "INFLUENCER"
- [ ] InfluencerProfile created automatically
- [ ] Influencer redirected to /profile/setup
- [ ] All tests from US-1.1 pass for influencer role
- [ ] Integration: Influencer registration → login → redirect works

---

## US-1.3: Login with Email & Password

**Story**: User can login with email and password, receive JWT token  
**Type**: Must-Have  
**Priority**: Critical

### Acceptance Criteria
- [ ] User can enter email and password
- [ ] Correct credentials return JWT token
- [ ] Invalid credentials show error
- [ ] User is logged in after successful login
- [ ] JWT token stored securely
- [ ] User can refresh token before expiry

### Backend Tasks

**Task 1.3.1: POST /auth/login endpoint**

**Files**: `packages/backend/src/routes/auth.ts`

**API Specification**:
```
POST /api/v1/auth/login
Request:
{
  email: string (required),
  password: string (required)
}

Response (200):
{
  success: true,
  data: {
    token: string,        // JWT access token (15 min)
    refreshToken: string  // Refresh token (7 days)
  },
  timestamp: ISO8601
}

Error (401):
{
  success: false,
  error: "Invalid email or password",
  code: "INVALID_CREDENTIALS",
  timestamp: ISO8601
}
```

**Implementation**:
1. Find user by email
2. If not found → return 401 INVALID_CREDENTIALS
3. Compare password using bcryptjs.compare()
4. If not match → return 401 INVALID_CREDENTIALS
5. Generate JWT tokens (same as register)
6. Return tokens

**Unit Tests** (1 hour):
```typescript
describe('POST /auth/login', () => {
  test('Login succeeds with correct credentials', async () => {
    // Should return 200 + tokens
  });

  test('Login fails with wrong password', async () => {
    // Should return 401 + INVALID_CREDENTIALS
  });

  test('Login fails with non-existent email', async () => {
    // Should return 401 + INVALID_CREDENTIALS
  });

  test('Returned JWT has correct payload', async () => {
    // Should decode to {userId, email, role}
  });
});
```

**Deliverables**:
- POST /auth/login endpoint
- Password comparison with bcryptjs
- Unit tests
- Git commit: `feat(1.3): login endpoint`

---

**Task 1.3.2: POST /auth/refresh endpoint**

**Files**: `packages/backend/src/routes/auth.ts`

**API Specification**:
```
POST /api/v1/auth/refresh
Request:
{
  refreshToken: string (required)
}

Response (200):
{
  success: true,
  data: {
    token: string  // New access token (15 min)
  },
  timestamp: ISO8601
}

Error (401):
{
  success: false,
  error: "Invalid or expired refresh token",
  code: "INVALID_REFRESH_TOKEN",
  timestamp: ISO8601
}
```

**Implementation**:
1. Verify refresh token using jwt.verify()
2. If invalid/expired → return 401
3. Generate new access token
4. Return new token

**Unit Tests** (0.5 hours):
```typescript
describe('POST /auth/refresh', () => {
  test('Refresh succeeds with valid token', async () => {
    // Should return new access token
  });

  test('Refresh fails with expired token', async () => {
    // Should return 401
  });

  test('New token is not the same as old token', async () => {
    // Should have updated iat
  });
});
```

**Deliverables**:
- POST /auth/refresh endpoint
- Unit tests
- Git commit: `feat(1.3): token refresh endpoint`

---

**Backend Estimated Time**: 2.5 hours (1.5h login + 0.5h refresh + 0.5h tests)

### Frontend Tasks

**Task 1.3.3: LoginPage component**

**Files**: `packages/frontend/src/pages/LoginPage.tsx`

**Component Specification**:
- Page title: "Login"
- Form fields:
  - Email input (type: email, placeholder: "your@email.com", required)
  - Password input (type: password, required)
  - "Remember me" checkbox (optional, can be basic)
- Submit button: "Login"
- Link to register page: "Don't have an account? Sign Up"
- Error messages displayed inline
- Loading state on button during submission

**UI/UX**:
- Responsive: Mobile (1 col), Desktop (1 col centered)
- Tailwind: Same as RegisterPage
- Minimal, clean design

**State & Hooks**:
- Local state: {email, password, loading, error}
- Use `useAuth()` hook to access login function
- Use `useNavigate()` for redirect after login
- Use `useEffect` to redirect if already logged in

**Validation**:
- Email: Non-empty, valid format
- Password: Non-empty

**Error Handling**:
- Display "Invalid email or password" from backend
- Handle network errors

**Integration**:
```typescript
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    await login(email, password);
    // Check user role and redirect
    if (user.role === 'BRAND' || user.role === 'INFLUENCER') {
      // Check if profile is complete
      // If not, redirect to /profile/setup
      // If yes, redirect to /dashboard
    }
    navigate('/dashboard');
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

**Component Tests** (1.5 hours):
```typescript
describe('LoginPage', () => {
  test('Renders form with email, password, submit', () => {
    // Should have email, password, login button
  });

  test('Submits form with valid credentials', async () => {
    // Should call login() and navigate to /dashboard
  });

  test('Shows error on invalid credentials', async () => {
    // Should display error message
  });

  test('Shows loading state on submit', async () => {
    // Button disabled during submission
  });

  test('Links to register page', () => {
    // "Don't have account?" link should go to /register
  });

  test('Redirects to dashboard if already logged in', () => {
    // Should not show login form
  });
});
```

**Deliverables**:
- LoginPage component
- Form validation
- Component tests
- Git commit: `feat(1.3): login page UI`

---

**Task 1.3.4: AuthContext token refresh logic**

**Files**: `packages/frontend/src/context/AuthContext.tsx`

**Description**: Add background token refresh (optional, but good practice):
- On login, store refresh token
- Set timer to refresh access token 1 min before expiry (14 min after login)
- When access token refreshed, update state
- Handle refresh failure → logout

**Implementation**:
```typescript
useEffect(() => {
  if (token) {
    const decoded = JSON.parse(atob(token.split('.')[1]));
    const expiresIn = (decoded.exp * 1000) - Date.now(); // ms
    const refreshIn = expiresIn - 60000; // 1 min before expiry

    const timeout = setTimeout(async () => {
      try {
        const newToken = await refreshToken();
        localStorage.setItem('token', newToken);
        setToken(newToken);
      } catch (err) {
        logout();
      }
    }, Math.max(refreshIn, 0));

    return () => clearTimeout(timeout);
  }
}, [token]);
```

**Frontend Estimated Time**: 2 hours (1.5h LoginPage + styling, 0.5h token refresh logic + tests)

### Owner Assignment
- Backend: **Dev 1**
- Frontend: **Dev 2**

### Dependencies
- US-1.1 (user exists in DB)

### Definition of Done
- [ ] Backend: POST /auth/login working, returns JWT
- [ ] Backend: Password comparison with bcryptjs verified
- [ ] Backend: POST /auth/refresh working
- [ ] Backend: Unit tests >80% coverage
- [ ] Backend: Error handling for invalid credentials
- [ ] Frontend: LoginPage renders email, password, submit
- [ ] Frontend: Form validation works
- [ ] Frontend: Submit logs in via API
- [ ] Frontend: JWT stored in localStorage
- [ ] Frontend: User redirected to /dashboard after login
- [ ] Frontend: Token refresh logic active (optional but implemented)
- [ ] Integration: Login → store token → call protected endpoint works
- [ ] Git: Commits: `feat(1.3): login endpoint` + `feat(1.3): refresh endpoint` + `feat(1.3): login page UI`

---

## US-1.4: Role-Based Dashboard

**Story**: After login, user sees dashboard appropriate to their role (Brand vs Influencer)  
**Type**: Must-Have  
**Priority**: Critical (foundation for everything)

### Acceptance Criteria
- [ ] Brand sees "My Campaigns" tab with list of created campaigns
- [ ] Brand sees "Applications" tab with list of applications to campaigns
- [ ] Brand sees "Recommended Influencers" section (from US-4.1)
- [ ] Influencer sees "Recommended for You" section (from US-4.2)
- [ ] Influencer sees "Browse Campaigns" section with searchable campaign list
- [ ] Admin sees user management dashboard (from US-1.5)
- [ ] Users cannot access other role's dashboard
- [ ] Navigation bar shows logout and current user email

### Backend Tasks

**Task 1.4.1: GET /users/me endpoint**

**Files**: `packages/backend/src/routes/users.ts`

**API Specification**:
```
GET /api/v1/users/me
Auth: Required (JWT in Authorization header)

Response (200):
{
  success: true,
  data: {
    user: {
      id: string,
      email: string,
      role: "BRAND" | "INFLUENCER" | "ADMIN",
      profile: {
        // BrandProfile or InfluencerProfile
        id, name, niche, followerCount, etc.
      }
    }
  },
  timestamp: ISO8601
}

Error (401):
{
  success: false,
  error: "Unauthorized",
  code: "UNAUTHORIZED",
  timestamp: ISO8601
}
```

**Implementation**:
1. authenticateJWT middleware extracts userId from token
2. Fetch User by userId
3. Fetch associated profile (BrandProfile or InfluencerProfile based on role)
4. Return user + profile

**Unit Tests** (0.5 hours):
```typescript
describe('GET /users/me', () => {
  test('Returns user with profile when authenticated', async () => {
    // Should return user + profile
  });

  test('Returns 401 when not authenticated', async () => {
    // Should return UNAUTHORIZED
  });

  test('Includes correct role in response', async () => {
    // BRAND user should have role: BRAND
  });
});
```

**Deliverables**:
- GET /users/me endpoint
- Unit tests
- Git commit: `feat(1.4): get current user endpoint`

---

**Backend Estimated Time**: 0.5 hours

### Frontend Tasks

**Task 1.4.2: BrandDashboard component**

**Files**: `packages/frontend/src/pages/BrandDashboard.tsx`

**Component Specification**:
- Page title: "Dashboard" or "Brand Dashboard"
- Two tabs: "My Campaigns" | "Applications"
- Tab 1 — "My Campaigns":
  - Button: "Create Campaign" → link to /campaigns/create
  - List of campaigns owned by user:
    - CampaignCard: title, description (truncated), budget, deadline, status
    - Status badge: OPEN (green), CLOSED (gray), ARCHIVED (dark)
    - Actions: "Edit" (if OPEN), "Close", "View Applications", "View Details"
  - Empty state: "No campaigns yet. Create one to get started."
  - Pagination: Show 10 per page, "Load more" button
- Tab 2 — "Applications":
  - Table: Influencer Name | Niche | Followers | Portfolio | Status | Action
  - Status badges: PENDING (yellow), ACCEPTED (green), REJECTED (red)
  - Actions: "Accept" (PENDING), "Reject" (PENDING), "View Profile" (all)
  - Empty state: "No applications yet."
  - Pagination: Show 20 per page
- "Recommended Influencers" section (prepared for US-4.1):
  - Show top 3-5 recommended influencers for active campaigns
  - RecommendationCard: name, niche, followers, profile link

**UI/UX**:
- Responsive: Mobile (1 col tabs, stacked), Desktop (2 tabs side-by-side)
- Tab navigation: Tailwind tab component
- Cards: Consistent card styling with shadows, padding
- Buttons: Consistent styling (primary, secondary)
- Empty states: Friendly messages with icons

**State & Hooks**:
- State: {campaigns, applications, loading, error, activeTab}
- Custom hook: `useCampaigns()` to fetch user's campaigns
- Custom hook: `useApplications()` to fetch applications to user's campaigns
- useEffect: Fetch on component mount and on tab change

**Integration**:
```typescript
const BrandDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('campaigns');
  
  const { campaigns, loading: campaignsLoading } = useCampaigns(user.id);
  const { applications, loading: appLoading } = useApplications(user.id);

  return (
    <div>
      <Navigation />
      <Tabs active={activeTab} onChange={setActiveTab}>
        <Tab label="My Campaigns">
          <CampaignsList campaigns={campaigns} />
        </Tab>
        <Tab label="Applications">
          <ApplicationsTable applications={applications} />
        </Tab>
      </Tabs>
      <RecommendedInfluencersSection campaigns={campaigns} />
    </div>
  );
};
```

**Component Tests** (1 hour):
```typescript
describe('BrandDashboard', () => {
  test('Renders both tabs', () => {
    // Should show "My Campaigns" and "Applications"
  });

  test('Shows brand campaigns in first tab', async () => {
    // Should fetch and display campaigns
  });

  test('Shows applications in second tab', async () => {
    // Should fetch and display applications
  });

  test('Tabs are clickable and switch content', async () => {
    // Clicking tab should show corresponding content
  });

  test('Shows empty state when no campaigns', () => {
    // Should display "No campaigns yet" message
  });
});
```

**Deliverables**:
- BrandDashboard component
- Tab navigation
- Campaign and applications sections
- Component tests
- Git commit: `feat(1.4): brand dashboard`

---

**Task 1.4.3: InfluencerDashboard component**

**Files**: `packages/frontend/src/pages/InfluencerDashboard.tsx`

**Component Specification**:
- Page title: "Dashboard" or "Influencer Dashboard"
- "Recommended for You" section (prepared for US-4.2):
  - Show top 5 recommended campaigns
  - CampaignCard: title, brand, budget, deadline, score, "Apply Now" button
- "Browse Campaigns" section:
  - CampaignFilterBar:
    - Search input (by title/description)
    - Niche dropdown filter
    - Budget range slider (min-max)
    - Deadline filter (before/after)
  - List of campaigns:
    - CampaignCard: title, brand, budget, deadline, required niche, status
    - Status: OPEN (green), CLOSED (gray)
    - "View Details" button → link to /campaigns/:id
    - "Apply Now" button (if not already applied)
  - Pagination: Show 10 per page

**UI/UX**:
- Responsive: Mobile (filters collapse, cards stack), Desktop (filters sidebar, cards grid)
- Filters collapsible on mobile
- Cards: Consistent with BrandDashboard
- Search input: Real-time or on-change API calls (debounced)

**State & Hooks**:
- State: {campaigns, filters, loading, error}
- Custom hook: `useCampaigns(filters)` to fetch filtered campaigns
- State: {recommendations, loading} for "Recommended for You"

**Integration**:
```typescript
const InfluencerDashboard = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState({niche: '', search: ''});
  
  const { campaigns, loading } = useCampaigns(filters);
  const { recommendations, loading: recLoading } = useRecommendations(user.id);

  return (
    <div>
      <Navigation />
      <RecommendedCampaignsSection campaigns={recommendations} />
      <CampaignFilterBar filters={filters} onChange={setFilters} />
      <CampaignsList campaigns={campaigns} isInfluencer={true} />
    </div>
  );
};
```

**Component Tests** (1 hour):
```typescript
describe('InfluencerDashboard', () => {
  test('Renders recommended campaigns section', async () => {
    // Should fetch and display recommendations
  });

  test('Renders browse campaigns with filters', () => {
    // Should show search, niche filter, budget range, deadline
  });

  test('Filter changes fetch new campaigns', async () => {
    // Changing filter should trigger API call
  });

  test('Search is debounced', async () => {
    // Should not call API on every keystroke
  });

  test('Shows "Apply Now" button for open campaigns', () => {
    // Button should be visible on OPEN campaigns
  });
});
```

**Deliverables**:
- InfluencerDashboard component
- Campaign filtering and search
- Recommended campaigns section
- Component tests
- Git commit: `feat(1.4): influencer dashboard`

---

**Task 1.4.4: Navigation component with role awareness**

**Files**: `packages/frontend/src/components/Navigation.tsx`

**Component Specification**:
- Header with logo and links
- Links: Home, Dashboard, Messages, Profile
- User menu: Show email, dropdown with "Logout"
- Unread message badge (prepared for US-5.3)
- Responsive: Mobile (hamburger menu), Desktop (horizontal nav)

**Deliverables**:
- Navigation component
- Git commit: `feat(1.4): global navigation component`

---

**Task 1.4.5: Routing setup with ProtectedRoute**

**Files**: `packages/frontend/src/App.tsx`

**Description**: Update App.tsx to include all dashboard routes:

```typescript
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  
  <Route path="/dashboard" element={<ProtectedRoute>
    {user?.role === 'BRAND' ? <BrandDashboard /> : <InfluencerDashboard />}
  </ProtectedRoute>} />
  
  <Route path="/" element={<Navigate to="/dashboard" />} />
</Routes>
```

**Deliverables**:
- Updated App.tsx with routing
- Git commit: `feat(1.4): dashboard routing`

---

**Frontend Estimated Time**: 3.5 hours (BrandDashboard 1h + InfluencerDashboard 1h + Navigation 0.5h + Routing 0.5h + tests)

### Owner Assignment
- Backend: **Dev 1**
- Frontend: **Dev 2**

### Dependencies
- US-1.1, US-1.3 (user must be logged in)
- US-3.1 (campaigns exist) — can show empty state if no campaigns
- US-5.1 (messages exist) — can show 0 unread initially

### Definition of Done
- [ ] Backend: GET /users/me endpoint working
- [ ] Backend: Returns user + profile data
- [ ] Backend: Unit tests passing
- [ ] Frontend: BrandDashboard renders correctly
- [ ] Frontend: Brand can see campaigns and applications
- [ ] Frontend: InfluencerDashboard renders correctly
- [ ] Frontend: Influencer can see browse campaigns with filters
- [ ] Frontend: Navigation shows correct user email
- [ ] Frontend: Logout button visible and working
- [ ] Frontend: ProtectedRoute redirects to login if not authenticated
- [ ] Integration: Login → dashboard (role-appropriate) works
- [ ] Integration: User sees correct dashboard based on role
- [ ] Git: Commits: `feat(1.4): get current user endpoint` + `feat(1.4): brand dashboard` + `feat(1.4): influencer dashboard` + `feat(1.4): global navigation`

---

## US-1.5: Admin User Management

**Story**: Admin can view all users and change their roles  
**Type**: Must-Have  
**Priority**: High (needed for demo data setup)

### Acceptance Criteria
- [ ] Admin can view list of all users
- [ ] List shows: Email, Role, Created Date, Actions
- [ ] Admin can change user role (BRAND ↔ INFLUENCER)
- [ ] Admin can soft-delete users
- [ ] Changes are reflected immediately
- [ ] Non-admin users cannot access admin dashboard
- [ ] Confirm dialog before deletion

### Backend Tasks

**Task 1.5.1: GET /admin/users endpoint**

**Files**: `packages/backend/src/routes/admin.ts`

**API Specification**:
```
GET /api/v1/admin/users?limit=50&offset=0
Auth: Required (JWT)
Roles: ADMIN only

Response (200):
{
  success: true,
  data: [
    {
      id: string,
      email: string,
      role: "BRAND" | "INFLUENCER" | "ADMIN",
      createdAt: string,
      profile: { name, ... }
    },
    ...
  ],
  total: number,
  limit: number,
  offset: number,
  timestamp: ISO8601
}

Error (403):
{
  success: false,
  error: "Insufficient permissions",
  code: "FORBIDDEN",
  timestamp: ISO8601
}
```

**Implementation**:
1. authenticateJWT middleware
2. authorize(['ADMIN']) middleware
3. Query all users with pagination (limit, offset)
4. For each user, fetch associated profile
5. Return array + pagination info

**Unit Tests** (0.5 hours):
```typescript
describe('GET /admin/users', () => {
  test('Admin can view all users', async () => {
    // Should return all users
  });

  test('Non-admin gets 403', async () => {
    // Should return FORBIDDEN
  });

  test('Pagination works (limit, offset)', async () => {
    // Should return correct slice of users
  });
});
```

---

**Task 1.5.2: PATCH /admin/users/:id/role endpoint**

**Files**: `packages/backend/src/routes/admin.ts`

**API Specification**:
```
PATCH /api/v1/admin/users/:id/role
Auth: Required (JWT)
Roles: ADMIN only

Request:
{
  role: "BRAND" | "INFLUENCER" | "ADMIN"
}

Response (200):
{
  success: true,
  data: {
    user: {
      id: string,
      email: string,
      role: string,
      ...
    }
  },
  timestamp: ISO8601
}

Error (404):
{
  success: false,
  error: "User not found",
  code: "NOT_FOUND",
  timestamp: ISO8601
}

Error (403):
{
  success: false,
  error: "Insufficient permissions",
  code: "FORBIDDEN",
  timestamp: ISO8601
}
```

**Implementation**:
1. Validate new role
2. Update User.role
3. Return updated user

**Unit Tests** (0.5 hours):
```typescript
describe('PATCH /admin/users/:id/role', () => {
  test('Admin can change user role', async () => {
    // Should update role and return 200
  });

  test('Non-admin gets 403', async () => {
    // Should return FORBIDDEN
  });

  test('Cannot change own role to something else', async () => {
    // (Optional: prevent self-demotion)
  });
});
```

---

**Task 1.5.3: DELETE /admin/users/:id endpoint (soft delete)**

**Files**: `packages/backend/src/routes/admin.ts`

**API Specification**:
```
DELETE /api/v1/admin/users/:id
Auth: Required (JWT)
Roles: ADMIN only

Response (200):
{
  success: true,
  data: { message: "User deleted" },
  timestamp: ISO8601
}

Error (403):
{
  success: false,
  error: "Insufficient permissions",
  code: "FORBIDDEN",
  timestamp: ISO8601
}
```

**Implementation**:
- Option A (soft delete): Add `deletedAt` field to User model, set on delete
- Option B (hard delete): Remove user record from DB

*For MVP, use hard delete (simpler). Can add soft delete later if needed.*

**Unit Tests** (0.5 hours):
```typescript
describe('DELETE /admin/users/:id', () => {
  test('Admin can delete user', async () => {
    // Should remove user
  });

  test('Non-admin gets 403', async () => {
    // Should return FORBIDDEN
  });

  test('Deleted user cannot login', async () => {
    // Should return 401 on login attempt
  });
});
```

---

**Backend Estimated Time**: 2 hours (1.5h endpoints + 0.5h tests)

### Frontend Tasks

**Task 1.5.4: AdminUsersPage component**

**Files**: `packages/frontend/src/pages/AdminUsersPage.tsx`

**Component Specification**:
- Page title: "User Management"
- Table:
  - Columns: Email | Role | Created | Actions
  - Rows: All users from GET /admin/users
  - Pagination: Show 20 per page, "Load more" button
  - Sorting: Click column header to sort
- Role dropdown: BRAND, INFLUENCER, ADMIN (on each row)
- Delete button: Shows confirm dialog before delete
- Refresh button: Manual refresh of user list

**UI/UX**:
- Table styling: Tailwind table component
- Responsive: Mobile (horizontal scroll), Desktop (full width)
- Action buttons: Small, compact
- Confirm dialog: Modal with warning message

**State & Hooks**:
- State: {users, loading, error}
- Custom hook: `useAdminUsers()` to fetch all users
- Mutation hook: `useUpdateUserRole()` and `useDeleteUser()`

**Error Handling**:
- Show toast notifications on success/failure
- Handle permission denied (403)

**Component Tests** (1 hour):
```typescript
describe('AdminUsersPage', () => {
  test('Renders user table', async () => {
    // Should fetch and display users
  });

  test('Admin can change user role', async () => {
    // Should update role via API
  });

  test('Admin can delete user', async () => {
    // Should show confirm dialog and delete via API
  });

  test('Shows pagination controls', () => {
    // Should show page numbers/buttons
  });

  test('Non-admin cannot access page', () => {
    // Should redirect to dashboard
  });
});
```

**Deliverables**:
- AdminUsersPage component
- Table with role management
- Delete confirmation dialog
- Component tests
- Git commit: `feat(1.5): admin user management page`

---

**Frontend Estimated Time**: 1.5 hours (1h component + styling, 0.5h tests)

### Owner Assignment
- Backend: **Dev 1**
- Frontend: **Dev 2**

### Dependencies
- US-1.1, US-1.3 (admin user must exist and be able to login)

### Definition of Done
- [ ] Backend: GET /admin/users endpoint working
- [ ] Backend: PATCH /admin/users/:id/role endpoint working
- [ ] Backend: DELETE /admin/users/:id endpoint working
- [ ] Backend: authorize(['ADMIN']) middleware on all endpoints
- [ ] Backend: Unit tests >80% coverage
- [ ] Frontend: AdminUsersPage visible only to ADMIN role
- [ ] Frontend: User table displays all users
- [ ] Frontend: Role dropdown updates via API
- [ ] Frontend: Delete button shows confirm dialog
- [ ] Frontend: Deleted user removed from table
- [ ] Frontend: Pagination works
- [ ] Integration: Admin login → manage users flow works
- [ ] Git: Commits: `feat(1.5): admin endpoints` + `feat(1.5): admin user management page`

---

## [Stories US-2.1 through US-6.3 would follow the same detailed format]

### [Due to length, I'll now provide the remaining stories in condensed format, then provide the summary sections]

---

## EPIC 2: Profiles & Portfolio (4 stories)

### US-2.1: Brand Profile Setup

**Backend**:
- PATCH `/profiles/me` — update own profile
  - Fields: {name, website, industry, description, logoUrl, mediaKitUrl}
  - Validation: website URL format, max lengths
  - Returns: updated BrandProfile + profile completion %
- Calculus for profile completion: (fields_filled / total_fields) * 100

**Frontend**:
- ProfileSetupPage (BrandProfileForm):
  - Form fields: name, website, industry dropdown, description textarea, logo upload
  - Progress indicator: "Step 1 of 2" or "Profile Completion: 60%"
  - Save button → PATCH /profiles/me → redirect to /dashboard
  - File upload for logo: Handle file to bytes, send to backend (or use CDN like Cloudinary)

**Estimated Time**: Backend 1.5h, Frontend 2h

### US-2.2: Influencer Profile Setup

**Backend**:
- PATCH `/profiles/me` — update own profile
  - Fields: {name, bio, avatarUrl, followerCount, niche, portfolioLinks}
  - portfolioLinks: Array of {name, url}
  - Validation: followerCount > 0, niche enum, URL format

**Frontend**:
- ProfileSetupPage (InfluencerProfileForm):
  - Form fields: name, bio textarea, avatar upload, followerCount number input, niche dropdown, portfolioLinks (dynamic array)
  - Portfolio link: Input for name + URL, "Add link" button, "Remove" button per link
  - Profile completion %
  - Save → redirect to /dashboard

**Estimated Time**: Backend 0.5h (reuses PATCH endpoint), Frontend 2h

### US-2.3: Influencer Portfolio Links

Included in US-2.2 (portfolioLinks array field)

**Estimated Time**: Included in US-2.2

### US-2.4: Public Profile View

**Backend**:
- GET `/profiles/:username` — public view (no auth required)
  - Returns: user profile + avg rating + review count

**Frontend**:
- PublicProfilePage (route: `/profile/:username`):
  - Display: name, bio, avatar, niche, follower count, portfolio links
  - Reviews section: Average rating + count + recent reviews (5 most recent)
  - Buttons: "Message" (if logged-in and different user), "Apply to Campaign" (if influencer)

**Estimated Time**: Backend 0.5h, Frontend 1.5h

---

## EPIC 3: Campaign Management (4 stories)

### US-3.1: Post a Campaign

**Backend**:
- POST `/campaigns` — create campaign
  - Auth: BRAND only
  - Fields: {title, description, budget, deadline, requiredNiche}
  - Returns: campaign object

**Frontend**:
- CreateCampaignPage:
  - Form: title input, description textarea, budget number, deadline date picker, niche dropdown
  - Submit → POST /campaigns → redirect to /dashboard

**Estimated Time**: Backend 1.5h, Frontend 1.5h

### US-3.2: Edit or Close a Campaign

**Backend**:
- PATCH `/campaigns/:id` — update campaign (BRAND owner, campaign must be OPEN)
  - Fields: {title, description, budget, deadline}
- POST `/campaigns/:id/close` — close campaign (BRAND owner)
  - Sets status → CLOSED

**Frontend**:
- CampaignDetailPage: Edit button (if brand owner) → opens form modal
- Close button (if OPEN): Shows confirm dialog

**Estimated Time**: Backend 1h, Frontend 1h

### US-3.3: Browse & Apply to Campaigns

**Backend**:
- GET `/campaigns` — list campaigns (paginated, filterable)
  - Filters: ?status=OPEN&niche=fitness&search=summer&budgetMin=1000&budgetMax=50000
  - Returns: paginated campaign list
- POST `/campaigns/:id/apply` — influencer applies
  - Auth: INFLUENCER only
  - Fields: {portfolioLink (optional)}
  - Prevents duplicate applications (UNIQUE constraint on campaignId + influencerId)
  - Returns: application object

**Frontend**:
- CampaignListPage (InfluencerDashboard component):
  - Filter bar: search, niche dropdown, budget range slider, deadline picker
  - Campaign cards: title, brand, budget, deadline, "Apply" button
  - Pagination

**Estimated Time**: Backend 2h, Frontend 2h

### US-3.4: Campaign Status Tracking

**Backend**:
- GET `/campaigns/:id/applications` — list applications (BRAND owner only)
  - Returns: application list with influencer details
- PATCH `/applications/:id` — brand accepts/rejects application
  - Fields: {status: ACCEPTED | REJECTED}
  - Returns: updated application

**Frontend**:
- BrandDashboard Applications tab:
  - Table: Influencer | Niche | Followers | Portfolio | Status | Accept/Reject
  - Accept/Reject buttons (PENDING status only)
- CampaignDetailPage Applications section:
  - Show "Accept" / "Reject" buttons if brand owner

**Estimated Time**: Backend 1.5h, Frontend 1.5h

---

## EPIC 4: Recommendation Engine (2 stories)

### US-4.1: Recommended Influencers for Campaign

**Backend**:
- GET `/campaigns/:id/recommended-influencers` — get top 10 recommended influencers
  - Auth: BRAND owner only
  - Algorithm: Weighted scoring (niche 40%, follower tier 30%, profile complete 20%, reviews 10%)
  - Caching: 1 hour (Redis or in-memory)
  - Returns: [{influencer_id, name, niche, followerCount, score}]

**Frontend**:
- BrandDashboard: Recommended section displays top 3 influencers from each active campaign
- CampaignDetailPage: Recommended section displays top 10

**Estimated Time**: Backend 3h (algorithm + endpoints + caching), Frontend 1.5h

### US-4.2: Campaign Search & Filter for Influencers

**Backend**:
- GET `/influencers/recommended-campaigns` — get recommended campaigns for influencer
  - Auth: INFLUENCER only
  - Algorithm: Same weighted scoring (niche 40%, budget fit 30%, etc.)
  - Excludes campaigns influencer already applied to
  - Returns: [{campaign_id, title, budget, deadline, score}]
- Database indexes: niche, status, budget, followerCount, createdAt (already in schema)

**Frontend**:
- InfluencerDashboard: Recommended section shows top 5 campaigns

**Estimated Time**: Backend 1.5h (algorithm already written in US-4.1), Frontend 0.5h

---

## EPIC 5: In-App Messaging (3 stories)

### US-5.1: Send a Text Message

**Backend**:
- POST `/messages` — send message
  - Auth: Required
  - Fields: {recipientId, content}
  - Returns: message object

**Frontend**:
- MessagesPage: Input form at bottom with text input + send button
- Submit → POST /messages → optimistic UI update (show message immediately)

**Estimated Time**: Backend 1h, Frontend 1h

### US-5.2: View Message Inbox

**Backend**:
- GET `/messages/inbox` — fetch inbox (paginated)
  - Auth: Required
  - Returns: paginated message list (both sent and received)
  - Include sender/recipient profile info (name, avatar)

**Frontend**:
- MessagesPage:
  - Left pane: Conversation list (user names, last message preview, timestamp)
  - Right pane: Message thread (messages in chronological order)
  - Auto-scroll to latest message

**Estimated Time**: Backend 1h, Frontend 1.5h

### US-5.3: Unread Message Notification Badge (Should-Have)

**Backend**:
- GET `/messages/unread-count` — count unread messages
  - Auth: Required
  - Returns: {count: number}

**Frontend**:
- Navigation: Unread badge shows count
- Polling: Call GET /messages/unread-count every 10 seconds
- React hook: useMessagePolling() that starts/stops polling
- On count change, fetch new messages

**Estimated Time**: Backend 0.5h, Frontend 1h

---

## EPIC 6: Ratings & Reviews (3 stories)

### US-6.1: Leave a Rating and Review (Should-Have)

**Backend**:
- POST `/reviews` — leave review
  - Auth: BRAND only (reviews influencers)
  - Fields: {influencerId, campaignId, rating: 1-5, comment}
  - Validation: Both users must have accepted this campaign together
  - UNIQUE constraint: One review per campaign

**Frontend**:
- ReviewFormModal (triggered after campaign accepted):
  - Star rating input (1-5, clickable stars)
  - Comment textarea (optional, max 500 chars)
  - Submit → POST /reviews → close modal → toast notification

**Estimated Time**: Backend 1.5h, Frontend 1h

### US-6.2: View Reviews on Public Profile (Should-Have)

**Backend**:
- GET `/profiles/:userId/reviews` — get all reviews for influencer
  - Public endpoint (no auth)
  - Calculate: avg_rating, review_count
  - Returns: {avgRating, totalReviews, reviews: []}

**Frontend**:
- PublicProfilePage: Reviews section displays:
  - Average rating (stars + number), e.g., "4.5★ • 12 reviews"
  - Recent reviews: brand name, rating, comment, date
  - Pagination or "Load more" for 20+ reviews

**Estimated Time**: Backend 0.5h, Frontend 1h

### US-6.3: Report an Abusive Review (Could-Have, deferred)

Stub endpoint: POST `/reviews/:id/report` (not implemented in frontend for MVP)

**Estimated Time**: Backend 0.5h (stub only)

---

## Definition of Done Checklists

### Definition of Done — Per Story

Each story must satisfy:

```markdown
## Story [US-X.X]: [Title]

### Backend DoD
- [ ] All endpoint(s) implemented and responding correctly
- [ ] Request validation working (schema, types, constraints)
- [ ] Authentication middleware applied (if required)
- [ ] Authorization middleware applied (if role-based)
- [ ] Database queries optimized with proper indexes
- [ ] Error handling implemented (all error cases covered)
- [ ] Unit tests written (>80% coverage of business logic)
- [ ] Integration tests written (happy path + error cases)
- [ ] API response follows standard format (success, error, timestamp)
- [ ] No console.errors or warnings in logs
- [ ] Commits follow convention: feat(scope): message #story_id

### Frontend DoD
- [ ] All components rendered without errors
- [ ] All forms have validation (client-side)
- [ ] API calls integrated and working
- [ ] Responsive design verified (mobile, tablet, desktop)
- [ ] Accessibility: keyboard navigation, ARIA labels
- [ ] Error handling: network errors, validation errors displayed
- [ ] Loading states shown during async operations
- [ ] Component tests written (>80% coverage)
- [ ] No console.errors or warnings in logs
- [ ] Commits follow convention: feat(scope): message #story_id

### Integration DoD
- [ ] Backend and frontend integrated successfully
- [ ] End-to-end flow works (action in UI → API call → response → state update)
- [ ] Data persists across page refresh
- [ ] No integration test failures
- [ ] Smoke tests pass (manual or automated)
```

---

## Quick Reference: Database Migrations

After completing all backend tasks, run:

```bash
cd packages/backend
npm run prisma:push
npm run prisma:generate
```

This creates all tables, indexes, and generates Prisma Client.

---

## Quick Reference: Testing Commands

### Backend Tests
```bash
cd packages/backend
npm test                          # Run all tests
npm test -- --coverage           # With coverage report
npm test -- --watch              # Watch mode
npm test -- src/routes/auth.ts   # Specific file
```

### Frontend Tests
```bash
cd packages/frontend
npm test                          # Run all tests
npm test -- --coverage           # With coverage report
npm test -- --watch              # Watch mode
npm test -- LoginPage            # Specific component
```

### E2E Tests (Day 3)
```bash
npm run e2e:run        # Run all E2E tests
npm run e2e:open       # Open Cypress UI
npm run e2e:debug      # Debug mode
```

---

## Quick Reference: Deployment URLs

After completing all tasks:

**Backend**: 
- Staging: `https://influencerhub-api-staging.render.com`
- Production: `https://influencerhub-api.render.com` (or your Render URL)

**Frontend**: 
- Staging: `https://influencerhub-staging.vercel.app`
- Production: `https://influencerhub.vercel.app`

---

## Quick Reference: Demo Credentials

After seeding demo data (Day 3):

```
BRAND:
  Email: nike@example.com
  Password: demo123
  Role: BRAND

INFLUENCER:
  Email: sarah.fit@example.com
  Password: demo123
  Role: INFLUENCER

ADMIN:
  Email: admin@example.com
  Password: demo123
  Role: ADMIN
```

---

## Quick Reference: Common Git Commands

```bash
# Start new feature branch
git checkout -b dev1/auth

# Stage changes
git add .

# Commit with story ID
git commit -m "feat(auth): login endpoint #1.3"

# Push to origin
git push origin dev1/auth

# Create pull request (via GitHub)

# After review, merge to main
git checkout main
git merge --no-ff dev1/auth

# Delete branch
git branch -d dev1/auth
```

---

## Running the Project Locally (Quick Start)

### Prerequisites
- Node.js 18.x
- PostgreSQL 14.x (or managed instance: Supabase, Neon)
- Git

### Setup

```bash
# 1. Clone repo
git clone <repo-url>
cd influencerhub

# 2. Install dependencies
npm install

# 3. Create .env files
cp packages/backend/.env.example packages/backend/.env
cp packages/frontend/.env.example packages/frontend/.env

# 4. Update .env with DB_URL and API_URL

# 5. Initialize database
cd packages/backend
npm run prisma:push
npm run prisma:generate

# 6. Start development servers
npm run dev

# Backend: http://localhost:5000
# Frontend: http://localhost:5173
```

### Quick Test

```bash
# In terminal 1
cd packages/backend
npm run dev

# In terminal 2
cd packages/frontend
npm run dev

# In browser
# Navigate to http://localhost:5173
# Register a new account
# Verify login works
```

---

## Success Indicators (By Day)

### End of Day 1 (24 hours)
- [ ] Auth endpoints (register, login, refresh) working
- [ ] Auth UI (login, register pages) complete
- [ ] Profile endpoints working
- [ ] Profile UI (setup, edit, public view) complete
- [ ] Campaign schema in DB
- [ ] Both devs can register, login, and see dashboard
- [ ] 20+ passing tests (unit + component)
- [ ] No Git conflicts, all commits on main

### End of Day 2 (48 hours)
- [ ] Campaign CRUD working
- [ ] Campaign UI complete
- [ ] Messaging endpoints working
- [ ] Messaging UI with polling complete
- [ ] Recommendations algorithm implemented
- [ ] Reviews endpoints working
- [ ] Reviews UI complete
- [ ] E2E tests (5 flows) written and passing
- [ ] Performance benchmarks verified
- [ ] 50+ passing tests
- [ ] All 23 stories in progress or complete

### End of Day 3 (72 hours)
- [ ] All 23 stories marked DONE
- [ ] Demo data seeded
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Production smoke tests passing
- [ ] Demo rehearsal completed
- [ ] All tests passing (>80% coverage)
- [ ] Git history clean, all commits linked to stories
- [ ] Ready for presentation

---

## Troubleshooting

### Issue: "Cannot find module '@influencerhub/shared'"

**Solution**: Ensure `packages/shared/types.ts` exists and is imported correctly.

```typescript
// In frontend/src/context/AuthContext.tsx
import { ApiResponse } from '@influencerhub/shared';

// OR (if not set up as workspace)
import { ApiResponse } from '../../shared/types';
```

### Issue: "CORS error when calling backend API"

**Solution**: Check CORS configuration in backend:

```typescript
app.use(cors({ origin: process.env.FRONTEND_URL }));
// Should match frontend URL (e.g., http://localhost:5173)
```

### Issue: "JWT token expired during demo"

**Solution**: Use long-lived refresh tokens. Before demo:

```bash
# Generate a new token with 7-day expiry
node scripts/generate-demo-token.js
```

### Issue: "Database connection refused"

**Solution**: Check DATABASE_URL in .env:

```
DATABASE_URL=postgresql://user:password@host:5432/database_name
```

Verify:
- Host and port correct
- Database name exists
- Credentials correct
- Network access allowed (if managed DB)

---

## Timeline Gantt Overview

```
Day 1 (Hours 0-24):
  Dev 1: Setup (3h) → Auth BE (5h) → Profile BE (4h) → Campaign BE (7h) → Polish (5h)
  Dev 2: Setup (3h) → Auth FE (5h) → Profile FE (4h) → Campaign FE (7h) → Polish (5h)

Day 2 (Hours 24-48):
  Dev 1: Campaign Polish (2h) → Recommendations (8h) → Integration Tests (4h) → Polish (2h)
  Dev 2: Dashboard Refine (2h) → Messaging FE (6h) → Reviews FE (4h) → Integration (4h) → Polish (2h)

Day 3 (Hours 48-72):
  Both: Demo Seed (2h) → Backend Deploy (6h) → Frontend Deploy (6h) → Smoke Tests (4h) → Demo (6h) → Buffer (2h)
```

---

**END OF TASK BREAKDOWN DOCUMENT**

This document is your immediate action list. Start with Wave 1 (shared infrastructure) and follow the recommended work order for maximum parallelization. Good luck! 🚀
