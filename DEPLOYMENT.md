# Deployment Guide - InfluencerHub

This guide covers deploying InfluencerHub to production using Heroku, Railway, or a VPS.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (production use)
- Git repository (for Heroku/Railway)
- Environment variables configured

## Quick Deployment Options

### Option 1: Heroku Deployment (Recommended for beginners)

#### Backend Deployment:

1. **Create Heroku app:**
   ```bash
   heroku create influencerhub-api
   ```

2. **Add PostgreSQL addon:**
   ```bash
   heroku addons:create heroku-postgresql:hobby-dev --app influencerhub-api
   ```

3. **Generate strong JWT secrets:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **Set environment variables:**
   ```bash
   heroku config:set JWT_SECRET=<your-strong-secret> --app influencerhub-api
   heroku config:set JWT_REFRESH_SECRET=<your-strong-secret> --app influencerhub-api
   heroku config:set NODE_ENV=production --app influencerhub-api
   heroku config:set PORT=5001 --app influencerhub-api
   ```

5. **Create Procfile:**
   ```bash
   # In root directory
   echo "web: cd backend && npm start" > Procfile
   ```

6. **Deploy:**
   ```bash
   git push heroku main
   ```

#### Frontend Deployment (Vercel recommended):

1. **Connect GitHub repository to Vercel**
2. **Set build settings:**
   - Build command: `cd frontend && npm run build`
   - Output directory: `frontend/dist`
   - Environment variables:
     - `VITE_API_URL=https://influencerhub-api.herokuapp.com/api/v1`

3. **Deploy:**
   - Vercel automatically deploys on push to main

### Option 2: Railway.app Deployment

1. **Connect GitHub repository to Railway**
2. **Select "Backend" service**
3. **Set environment variables in dashboard:**
   - JWT_SECRET
   - JWT_REFRESH_SECRET
   - DATABASE_URL (Railway provides PostgreSQL)

4. **For frontend, deploy separately:**
   - Use Vercel or Railway's Static site option

### Option 3: Self-Hosted VPS (DigitalOcean, AWS, etc.)

#### Backend:

1. **SSH into your VPS:**
   ```bash
   ssh root@your-vps-ip
   ```

2. **Install Node.js 18+:**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install PostgreSQL:**
   ```bash
   sudo apt-get install -y postgresql postgresql-contrib
   ```

4. **Create database:**
   ```bash
   sudo -u postgres createdb influencerhub
   ```

5. **Clone repository:**
   ```bash
   git clone <your-repo> /var/www/influencerhub
   cd /var/www/influencerhub/backend
   ```

6. **Install dependencies:**
   ```bash
   npm install
   npm run build
   ```

7. **Set environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your PostgreSQL connection and secrets
   ```

8. **Run database migrations:**
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

9. **Set up PM2 for process management:**
   ```bash
   npm install -g pm2
   pm2 start "npm start" --name "influencerhub-api"
   pm2 startup
   pm2 save
   ```

10. **Set up Nginx reverse proxy:**
    ```bash
    sudo apt-get install -y nginx
    ```

    Create `/etc/nginx/sites-available/influencerhub`:
    ```nginx
    server {
        listen 80;
        server_name api.influencerhub.com;

        location / {
            proxy_pass http://localhost:5001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

    Enable site:
    ```bash
    sudo ln -s /etc/nginx/sites-available/influencerhub /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    ```

11. **Set up SSL with Certbot:**
    ```bash
    sudo apt-get install -y certbot python3-certbot-nginx
    sudo certbot --nginx -d api.influencerhub.com
    ```

#### Frontend:

Build and deploy the frontend bundle:
```bash
cd frontend
npm run build
# Deploy the dist/ folder to your CDN or static host
```

## Environment Variables Checklist

### Backend Production Checklist:

- [ ] `JWT_SECRET` - Strong, 32+ bytes, random
- [ ] `JWT_REFRESH_SECRET` - Strong, 32+ bytes, random
- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NODE_ENV=production`
- [ ] `PORT` - Set to 5001 (or your chosen port)
- [ ] `ALLOWED_ORIGINS` - Your frontend domain(s)

### Frontend Production Checklist:

- [ ] `VITE_API_URL` - Your backend API domain

## Security Checklist

- [ ] JWT secrets generated with crypto.randomBytes
- [ ] No hardcoded secrets in code
- [ ] HTTPS/SSL enabled on all endpoints
- [ ] Database backups configured
- [ ] Rate limiting enabled (already in code)
- [ ] Password validation enforced (already in code)
- [ ] XSS protection enabled (already in code)
- [ ] CORS properly configured

## Database Migration (SQLite → PostgreSQL)

1. **Export SQLite data:**
   ```bash
   sqlite3 backend/prisma/dev.db ".dump" > backup.sql
   ```

2. **Update Prisma schema** in `backend/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Push to PostgreSQL:**
   ```bash
   DATABASE_URL="postgresql://user:pass@host/dbname" npx prisma migrate deploy
   npx prisma db seed
   ```

## Monitoring and Logging

1. **Set up error tracking:**
   - Sentry integration recommended
   - Configure in backend code

2. **Monitor uptime:**
   - Use UptimeRobot or similar service

3. **View logs:**
   - Heroku: `heroku logs --app influencerhub-api`
   - Railway: Check dashboard
   - VPS: `pm2 logs influencerhub-api`

## Performance Optimization

1. **Enable caching:**
   - Cache campaign listings
   - Cache user profiles

2. **Use CDN:**
   - Serve static assets from CloudFront/Cloudflare

3. **Database indexing:**
   - Campaigns: index on status, requiredNiche, budgetTier
   - Messages: index on campaignId, receiverId
   - Reviews: index on reviewedUserId

## Troubleshooting

### "Cannot connect to database"
- Verify DATABASE_URL is correct
- Check database credentials
- Ensure database is running

### "JWT token verification failed"
- Verify JWT_SECRET matches across services
- Check token expiry settings
- Ensure tokens are sent with "Bearer " prefix

### "CORS errors"
- Update ALLOWED_ORIGINS with correct frontend domain
- Check frontend is using correct API URL

### "Database migration failed"
- Backup current database
- Run: `npx prisma migrate reset`
- Re-seed: `npx prisma db seed`

## Rollback Procedure

If deployment goes wrong:

1. **Backend rollback:**
   ```bash
   git revert <commit-hash>
   git push heroku main
   ```

2. **Database rollback:**
   ```bash
   # Restore from backup
   psql -U user -d database < backup.sql
   ```

## Support

For issues, check:
1. Error logs
2. Environment variables are set
3. Database connectivity
4. Firewall/security group rules
5. API endpoint availability

---

Last updated: April 15, 2026
Version: 1.0
