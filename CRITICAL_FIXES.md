# InfluencerHub - Code Fixes Reference

Quick reference for all critical fixes needed before production.

---

## CRITICAL FIX #1: JWT Secrets

**Files:** `backend/src/middleware/auth.ts`, `backend/src/services/auth.service.ts`

### Current (VULNERABLE):
```typescript
const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
const token = jwt.sign(
  { id, email, role },
  process.env.JWT_SECRET || 'secret',
);
```

### Fixed:
```typescript
// Add at startup
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  console.error('FATAL: JWT_SECRET and JWT_REFRESH_SECRET must be set in .env');
  process.exit(1);
}

// Use directly (no defaults)
const decoded = jwt.verify(token, JWT_SECRET);
const token = jwt.sign({ id, email, role }, JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRY || '15m'
});
```

---

## CRITICAL FIX #2: Message Authorization

**File:** `backend/src/services/message.service.ts`

### Current (VULNERABLE):
```typescript
static async sendMessage(campaignId: string, senderId: string, receiverId: string, text: string): Promise<Message> {
  const application = await prisma.campaignApplication.findFirst({
    where: {
      campaignId,
      OR: [
        { influencerId: senderId },
        { influencerId: receiverId }
      ]
    }
  });

  if (!application) {
    throw new Error('No approved collaboration for this campaign');
  }
  // BUG: No check that sender can send TO receiver!
}
```

### Fixed:
```typescript
static async sendMessage(campaignId: string, senderId: string, receiverId: string, text: string): Promise<Message> {
  // Get campaign
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId }
  });

  if (!campaign) throw new Error('Campaign not found');
  if (campaign.status === 'CLOSED' || campaign.status === 'COMPLETED') {
    throw new Error('Cannot message on closed campaigns');
  }

  // Verify sender is influencer OR brand
  const senderApplication = await prisma.campaignApplication.findFirst({
    where: {
      campaignId,
      influencerId: senderId,
      status: 'ACCEPTED'
    }
  });

  const senderIsBrand = campaign.brandId === senderId;

  if (!senderApplication && !senderIsBrand) {
    throw new Error('You are not part of this campaign');
  }

  // Verify valid receiver relationship
  if (senderIsBrand) {
    // Brand messaging influencer
    const receiverApplication = await prisma.campaignApplication.findFirst({
      where: {
        campaignId,
        influencerId: receiverId,
        status: 'ACCEPTED'
      }
    });
    if (!receiverApplication) {
      throw new Error('Receiver is not part of this campaign');
    }
  } else {
    // Influencer messaging brand
    if (campaign.brandId !== receiverId) {
      throw new Error('Receiver must be the brand for this campaign');
    }
  }

  // Sanitize message text
  const sanitizedText = text.trim();
  if (sanitizedText.length === 0) throw new Error('Message cannot be empty');
  if (sanitizedText.length > 5000) throw new Error('Message too long');

  const message = await prisma.message.create({
    data: {
      campaignId,
      senderId,
      receiverId,
      text: sanitizedText
    }
  });

  return {
    id: message.id,
    campaignId: message.campaignId,
    senderId: message.senderId,
    receiverId: message.receiverId,
    text: message.text,
    isRead: message.isRead,
    createdAt: message.createdAt.toISOString()
  };
}
```

---

## CRITICAL FIX #3: Rate Limiting

**File:** `backend/src/routes/auth.routes.ts` (at top after imports)

### Installation:
```bash
npm install express-rate-limit
```

### Implementation:
```typescript
import rateLimit from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute window
  max: 5, // 5 attempts max
  message: 'Too many login attempts. Please try again in 15 minutes.',
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
  skip: (req) => process.env.NODE_ENV === 'development', // Skip in dev
});

// Apply to auth routes:
router.post('/login', authLimiter, async (req: Request, res: Response) => {
  // ... existing code
});

router.post('/register/brand', authLimiter, async (req: Request, res: Response) => {
  // ... existing code
});

router.post('/register/influencer', authLimiter, async (req: Request, res: Response) => {
  // ... existing code
});
```

---

## CRITICAL FIX #4: Demo Credentials

**File:** `frontend/src/pages/auth/LoginPage.tsx` (lines 139-151)

### Current:
```typescript
{/* Demo Credentials - Development Only */}
<div className="mt-8 p-4 bg-ramp-gray-900 rounded-lg border border-ramp-gray-800 text-center">
  <p className="text-ramp-gray-500 text-xs font-medium mb-2">Demo Credentials</p>
  <div className="space-y-1.5 text-xs">
    <p className="text-ramp-gray-400">
      <span className="text-ramp-purple-400 font-medium">Brand:</span> brand@demo.com
    </p>
    <p className="text-ramp-gray-400">
      <span className="text-ramp-teal-400 font-medium">Creator:</span> influencer@demo.com
    </p>
    <p className="text-ramp-gray-500">Password: <span className="font-mono">password123</span></p>
  </div>
</div>
```

### Fixed:
```typescript
{/* Demo Credentials - Development Only */}
{process.env.NODE_ENV === 'development' && (
  <div className="mt-8 p-4 bg-ramp-gray-900 rounded-lg border border-ramp-gray-800 text-center">
    <p className="text-ramp-gray-500 text-xs font-medium mb-2">Demo Credentials</p>
    <div className="space-y-1.5 text-xs">
      <p className="text-ramp-gray-400">
        <span className="text-ramp-purple-400 font-medium">Brand:</span> brand@demo.com
      </p>
      <p className="text-ramp-gray-400">
        <span className="text-ramp-teal-400 font-medium">Creator:</span> influencer@demo.com
      </p>
      <p className="text-ramp-gray-500">Password: <span className="font-mono">password123</span></p>
    </div>
  </div>
)}
```

---

## CRITICAL FIX #5: Password Validation

**File:** `backend/src/services/auth.service.ts` (add at top)

### Add validation function:
```typescript
function validatePassword(password: string): string | null {
  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters long';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  if (!/[!@#$%^&*]/.test(password)) {
    return 'Password must contain at least one special character (!@#$%^&*)';
  }
  return null;
}
```

### In registerBrand (add after line 7):
```typescript
static async registerBrand(data: RegisterBrandRequest): Promise<AuthResponse> {
  // Validate password
  const passwordError = validatePassword(data.password);
  if (passwordError) {
    throw new Error(passwordError);
  }
  
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (existingUser) {
    throw new Error('Email already registered');
  }
  // ... rest of method
}
```

### In registerInfluencer (add after line 61):
```typescript
static async registerInfluencer(data: RegisterInfluencerRequest): Promise<AuthResponse> {
  // Validate password
  const passwordError = validatePassword(data.password);
  if (passwordError) {
    throw new Error(passwordError);
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  });

  if (existingUser) {
    throw new Error('Email already registered');
  }
  // ... rest of method
}
```

---

## CRITICAL FIX #6: XSS Sanitization

**File:** `backend/src/services/message.service.ts`

### Installation:
```bash
npm install xss
```

### Add import:
```typescript
import xss from 'xss';
```

### Use in sendMessage:
```typescript
const sanitizedText = xss(text.trim(), {
  whiteList: {}, // Allow no HTML tags
  stripIgnoredTag: true,
});

if (sanitizedText.length === 0) {
  throw new Error('Message cannot be empty');
}

const message = await prisma.message.create({
  data: {
    campaignId,
    senderId,
    receiverId,
    text: sanitizedText // Use sanitized version
  }
});
```

---

## CRITICAL FIX #7: Input Validation

**File:** `backend/src/services/campaign.service.ts` (update browseActiveCampaigns)

### Current:
```typescript
if (filters?.niche) {
  where.requiredNiche = { contains: filters.niche, mode: 'insensitive' };
}
```

### Fixed:
```typescript
const VALID_NICHES = ['Fashion', 'Beauty', 'Tech', 'Fitness', 'Food', 'Travel', 'Lifestyle', 'Gaming'];

if (filters?.niche) {
  if (!VALID_NICHES.includes(filters.niche)) {
    throw new Error(`Invalid niche. Must be one of: ${VALID_NICHES.join(', ')}`);
  }
  where.requiredNiche = filters.niche;
}

if (filters?.budgetTier) {
  const VALID_BUDGETS = ['TIER_10K_50K', 'TIER_50K_200K', 'TIER_200K_PLUS'];
  if (!VALID_BUDGETS.includes(filters.budgetTier)) {
    throw new Error('Invalid budget tier');
  }
  where.budgetTier = filters.budgetTier;
}
```

---

## Environment Setup

Create `.env` file in backend folder:

```env
# Database
DATABASE_URL="file:./prisma/dev.db"

# JWT - Generate strong secrets!
# Use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET="your-very-long-random-secret-string-here"
JWT_REFRESH_SECRET="another-very-long-random-secret-string-here"
JWT_EXPIRY="15m"
JWT_REFRESH_EXPIRY="7d"

# Server
PORT=5001
NODE_ENV="development"

# CORS
ALLOWED_ORIGINS="http://localhost:5173,http://localhost:3000"
```

---

## Verification Checklist

After applying fixes, verify:

- [ ] JWT secrets are from environment variables only
- [ ] Rate limiting blocks after 5 attempts
- [ ] Demo credentials don't show in production builds
- [ ] Password validation enforces complexity
- [ ] Messages are sanitized and check authorization
- [ ] Input filters validate against whitelist
- [ ] Error messages don't leak sensitive info
- [ ] All env vars are set
- [ ] Tests pass
- [ ] No hardcoded secrets in code

---

## Total Estimated Time: 2 hours

1. JWT Secrets: 15 min
2. Message Auth: 30 min
3. Rate Limiting: 30 min
4. Demo Creds: 5 min
5. Password Validation: 20 min
6. XSS Sanitization: 20 min
7. Input Validation: 15 min
8. Testing & Verification: 25 min

**Total: 2 hours 0 minutes**
