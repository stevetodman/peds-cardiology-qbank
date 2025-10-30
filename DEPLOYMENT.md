# Deployment Guide

## Quick Deploy to Vercel

### Prerequisites
- GitHub account with this repo
- Vercel account (free tier is fine)

### Steps

#### 1. Via Vercel Dashboard (Easiest)
1. Go to https://vercel.com/new
2. Import your GitHub repository: `stevetodman/peds-cardiology-qbank`
3. Configure:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
4. Add Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
5. Click "Deploy"
6. Wait 2-3 minutes
7. Your app will be live at: `your-project.vercel.app`

#### 2. Via CLI (Alternative)
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Add environment variables when prompted
```

### Post-Deployment Checklist
- [ ] Test sign up/login
- [ ] Test all features
- [ ] Update Supabase URL restrictions (if any)
- [ ] Share the URL!

## Other Deployment Options

### Netlify
1. Go to https://app.netlify.com/
2. Import from GitHub
3. Build settings: `npm run build`
4. Publish directory: `.next`
5. Add environment variables

### Railway
1. Go to https://railway.app/
2. New Project → Deploy from GitHub
3. Add environment variables
4. Deploy

### Self-Hosted (VPS)
```bash
npm run build
npm start
# Or use PM2 for process management
```

## Domain Setup (Optional)
Once deployed, you can add a custom domain:
- Vercel: Settings → Domains → Add Domain
- Example: `peds-cardio-qbank.com`

## SSL/HTTPS
✅ Automatic with Vercel, Netlify, Railway
