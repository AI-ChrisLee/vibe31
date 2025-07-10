# MCP (Model Context Protocol) Configuration

## Overview
This document outlines all service connections, API configurations, and limits for the Vibe31 AI Marketing Assistant platform.

## Service Connections

### 1. Supabase (Database & Auth)
- **Dashboard**: https://supabase.com/dashboard
- **Project URL**: Set in `NEXT_PUBLIC_SUPABASE_URL`
- **Anon Key**: Set in `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Service Role Key**: Set in `SUPABASE_SERVICE_ROLE_KEY`
- **Limits**:
  - Database: 500MB (Free tier)
  - Auth: Unlimited users
  - Storage: 1GB (Free tier)
  - Bandwidth: 2GB (Free tier)

### 2. Claude API (Anthropic)
- **API Key**: Set in `ANTHROPIC_API_KEY`
- **Model**: Claude 3 Opus
- **Limits**:
  - Rate limit: 1000 requests/minute
  - Token limit: 100k tokens per request
  - Usage tracked per user

### 3. Resend (Email Service)
- **API Key**: Set in `RESEND_API_KEY`
- **Dashboard**: https://resend.com/dashboard
- **Limits**:
  - Free tier: 100 emails/day
  - Paid tier: 10,000 emails/month
- **Domains**: Configure SPF/DKIM for vibe31.com

### 4. Stripe (Payments)
- **Secret Key**: Set in `STRIPE_SECRET_KEY`
- **Publishable Key**: Set in `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Webhook Secret**: Set in `STRIPE_WEBHOOK_SECRET`
- **Dashboard**: https://dashboard.stripe.com
- **Products**:
  - Starter: $49/mo (price_starter)
  - Growth: $149/mo (price_growth)
  - Scale: $449/mo (price_scale)

### 5. Vercel (Deployment)
- **Project**: vibe31
- **Domain**: vibe31.com
- **Environment Variables**: Configure all env vars in Vercel dashboard
- **Limits**:
  - Bandwidth: 100GB (Free tier)
  - Functions: 100GB-hours (Free tier)

## API Keys Management

### Development
- Store all keys in `.env.local`
- Never commit `.env.local` to version control
- Use `.env.example` as template

### Production
- Set all environment variables in Vercel dashboard
- Use Vercel's environment variable encryption
- Rotate keys every 90 days

## Service Integration Flow

```
User Request → Next.js API Route → Service Integration
                                  ↓
                            Supabase (Auth Check)
                                  ↓
                            Claude API (AI Processing)
                                  ↓
                            Resend (Email Notifications)
                                  ↓
                            Response → User
```

## Error Handling
- All services should have retry logic
- Log errors to Sentry (when configured)
- Graceful fallbacks for service outages

## Monitoring
- Use Vercel Analytics for performance
- Monitor API usage in respective dashboards
- Set up alerts for quota limits

## Security Best Practices
1. Always validate API keys on server-side
2. Use environment variables for all secrets
3. Implement rate limiting on API routes
4. Enable CORS only for trusted domains
5. Use Supabase RLS for data access control

## Monthly Cost Estimation (Production)
- Supabase Pro: $25/month
- Claude API: ~$100/month (based on usage)
- Resend: $20/month
- Stripe: 2.9% + $0.30 per transaction
- Vercel Pro: $20/month
- **Total**: ~$165/month + transaction fees