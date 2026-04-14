# InfluencerHub Frontend

React + TypeScript + Tailwind CSS single-page application for the InfluencerHub platform.

## Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Update API URL (should match your backend):
```
VITE_API_URL=http://localhost:5000/api/v1
```

### Running

Development with hot reload:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable components
│   └── ProtectedRoute.tsx
├── context/            # React Context (Auth state management)
│   └── AuthContext.tsx
├── pages/              # Page components (one per route)
│   ├── auth/          # Authentication pages
│   ├── brand/         # Brand-specific pages
│   ├── influencer/    # Influencer-specific pages
│   ├── admin/         # Admin pages
│   ├── Messaging.tsx
│   └── PublicProfile.tsx
├── App.tsx            # Main router setup
├── main.tsx           # Entry point
└── index.css          # Tailwind + global styles
```

## Pages

### Authentication
- `/login` - Login page for both roles
- `/register/brand` - Brand registration
- `/register/influencer` - Influencer registration

### Brand
- `/brand/dashboard` - Main brand dashboard
- `/brand/profile` - Edit brand profile
- `/brand/campaign/create` - Create new campaign
- `/brand/campaign/:campaignId` - Campaign details
- `/brand/campaign/:campaignId/recommendations` - Recommended influencers

### Influencer
- `/influencer/dashboard` - Main influencer dashboard
- `/influencer/profile` - Edit influencer profile
- `/influencer/campaigns` - Browse campaigns with filters

### Shared
- `/messages` - Messaging inbox and threads
- `/profile/:userId` - Public profile view (brand or influencer)

### Admin
- `/admin/dashboard` - Admin control panel

## Features Implemented

### Authentication Context (AuthContext.tsx)
- JWT token management
- Login/register for both roles
- Automatic token refresh
- Logout functionality
- API axios instance with auth headers

### Protected Routes (ProtectedRoute.tsx)
- Role-based access control
- Automatic redirect to login
- Check user permissions

### Styling
- Tailwind CSS for all components
- Responsive design (mobile-first)
- Consistent color scheme:
  - Blue for brands
  - Purple for influencers
  - Green for success
  - Red for errors

## Component Development Guide

### Creating a New Page

```tsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';

const MyPage: React.FC = () => {
  const { user, api } = useAuth();

  // Your component logic

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Your JSX */}
    </div>
  );
};

export default MyPage;
```

### Using the API

```tsx
const handleFetch = async () => {
  try {
    const response = await api.get('/campaigns');
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
};
```

### Making Authenticated Requests

```tsx
const handleSubmit = async (data) => {
  try {
    const response = await api.post('/campaigns', data);
    // Token is automatically added to Authorization header
  } catch (error) {
    if (error.response?.status === 401) {
      logout(); // Token expired
    }
  }
};
```

## Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm test -- --watch
```

## Building

Build for production:
```bash
npm run build
```

Output is in the `dist/` directory.

## Deployment to Vercel

### Automatic (Recommended)
1. Push to GitHub
2. Connect repo to Vercel
3. Set environment variables
4. Vercel auto-deploys on push

### Manual
```bash
npm install -g vercel
vercel
```

## Environment Variables for Deployment

| Variable | Example | Notes |
|----------|---------|-------|
| VITE_API_URL | https://api.influencerhub.com/api/v1 | Backend API URL |

## Tailwind CSS

Tailwind is configured with:
- Responsive breakpoints: sm, md, lg, xl, 2xl
- Color palette: blue, purple, green, red, gray
- Utility-first classes

Extend configuration in `tailwind.config.js`.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Code splitting via Vite
- Tree-shaking of unused code
- Lazy loading of routes (can be added)
- Image optimization (to implement)

## Common Issues

### API calls failing
- Check VITE_API_URL environment variable
- Ensure backend is running
- Check for CORS issues in browser console

### Token expiry during usage
- The context automatically refreshes tokens
- If refresh fails, user is logged out
- Login again to continue

### Styling not applying
- Run `npm run build` to check for CSS issues
- Check Tailwind config paths
- Verify postcss.config.js exists

## Next Steps

Remaining features to implement:
1. Campaign creation form with full validation
2. Campaign details page with applications list
3. Influencer recommendation UI with filtering
4. Messaging UI with real-time polling
5. Profile editing forms with validation
6. Reviews display and submission UI
7. Admin user management interface
8. Search and filtering UI components

## Contributing

When adding new pages:
1. Create file in appropriate `pages/` subdirectory
2. Add route in `App.tsx`
3. Wrap in `<ProtectedRoute>` if authenticated
4. Use TypeScript strict mode
5. Add JSDoc comments for complex logic

## Support

See main README.md or create an issue on GitHub.
