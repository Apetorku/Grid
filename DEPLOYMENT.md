# GridNexus - Deployment Guide

## 📋 Prerequisites

Before deploying, ensure you have:

- Node.js 18.17 or higher installed
- A Supabase account and project
- A Paystack account (test/live keys)
- A Daily.co account
- Google OAuth credentials
- A Vercel account (recommended for deployment)

## 🔧 Local Development Setup

### 1. Install Node.js

Download and install from [nodejs.org](https://nodejs.org/)

### 2. Install Dependencies

```bash
cd GridNexus
npm install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings → API
3. Copy your project URL and anon key
4. Go to SQL Editor and run the entire `database/schema.sql` file
5. Set up storage bucket:
   - Go to Storage
   - Create a new bucket named `project-files`
   - Make it public

### 4. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (development)
   - `https://yourdomain.com/auth/callback` (production)
6. Copy Client ID and Client Secret

### 5. Set Up Paystack

1. Sign up at [paystack.com](https://paystack.com/)
2. Get your test keys from Settings → API Keys & Webhooks
3. Set up webhook URL: `https://yourdomain.com/api/payments/webhook`
4. Copy webhook secret

### 6. Set Up Daily.co

1. Sign up at [daily.co](https://daily.co/)
2. Go to Developers → API Keys
3. Create a new API key
4. Copy the API key and domain

### 7. Configure Environment Variables

Copy `.env.example` to `.env.local`:

```bash
copy .env.example .env.local
```

Fill in all the values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google OAuth
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
PAYSTACK_SECRET_KEY=sk_test_xxxxx
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret

# Daily.co
NEXT_PUBLIC_DAILY_API_KEY=your_api_key
DAILY_API_SECRET=your_secret_key
NEXT_PUBLIC_DAILY_DOMAIN=your-domain.daily.co

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_a_random_32_char_string
```

### 8. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

## 🚀 Production Deployment (Vercel)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-repo-url
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com/)
2. Click "New Project"
3. Import your GitHub repository
4. Add all environment variables from `.env.local`
5. Update `NEXT_PUBLIC_APP_URL` to your Vercel domain
6. Deploy

### 3. Update OAuth Redirect URIs

Add your Vercel URL to:
- Google OAuth authorized redirect URIs
- Supabase Auth → URL Configuration

### 4. Update Paystack Webhook

Update webhook URL in Paystack dashboard to your Vercel domain.

### 5. Create Admin User

Run this SQL in Supabase SQL Editor to create first admin:

```sql
-- Create admin user (after signing up normally)
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-admin-email@example.com';
```

## 📊 Database Migration

If you need to update the schema:

```bash
# Run migrations
npm run db:migrate
```

## 🔒 Security Checklist

- [ ] Change all default passwords
- [ ] Use production API keys (not test keys)
- [ ] Enable Row Level Security on all tables
- [ ] Set up proper CORS policies
- [ ] Use HTTPS only
- [ ] Enable Supabase Auth rate limiting
- [ ] Set up monitoring and alerts

## 🧪 Testing

### Test Payment Flow

1. Use Paystack test cards:
   - Success: `4084084084084081`
   - Decline: `5060666666666666666`

### Test User Roles

- Create test accounts for client, developer, and admin
- Verify role-based access control works

## 📈 Monitoring

### Supabase Dashboard

- Monitor API usage
- Check database performance
- Review auth logs

### Vercel Analytics

- Monitor deployment status
- Check function logs
- Review error tracking

## 🆘 Troubleshooting

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Database Connection Issues

- Verify Supabase credentials
- Check network connectivity
- Ensure RLS policies are correct

### OAuth Not Working

- Verify redirect URIs match exactly
- Check OAuth credentials
- Ensure callback route is accessible

## 📞 Support

For issues or questions:
- Check documentation: `/README.md`
- Review error logs in Vercel
- Check Supabase logs
- Contact support@gridnexus.com

## 🔄 Updates

To update production:

```bash
git add .
git commit -m "Your update message"
git push origin main
```

Vercel will automatically redeploy.
