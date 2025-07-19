# 10M Funnels - Simple Funnel Implementation Plan

## Overview
Building a simple funnel with opt-in page → video + landing page structure.
- **No authentication required** - just email capture and redirect
- **Single database table** for lead tracking
- Route structure: `/template/10mfunnels` → `/template/10mfunnels/video`

## 1. Project Setup
- [x] Initialize Next.js project with TypeScript
- [x] Install shadcn/ui and configure components
- [x] Set up Supabase project (database only, no auth)
- [x] Configure environment variables for Supabase
- [x] Install and configure Resend for email notifications

## 2. Basic UI Structure
- [x] Create main layout component with consistent styling
- [x] Set up routing for /template/10mfunnels (opt-in page)
- [x] Set up routing for /template/10mfunnels/video (video + landing page)
- [x] Create navigation flow between pages

## 3. Database Schema
- [x] Create 'leads' table (id, email, funnel_id, created_at) in Supabase
- [x] Set up database connection and client

## 4. Backend Logic
- [x] Create API route for email submission (/api/submit-lead)
- [x] Implement email validation logic
- [x] Store lead in Supabase database
- [x] Handle redirect to video page after successful submission
- [ ] Set up email notification via Resend (optional)

## 5. UI Enhancement

### Opt-in Page (/template/10mfunnels)
- [ ] Hero section with embedded video preview
- [ ] Email form with 'Unlock Video Now' button
- [ ] Social proof/testimonial section

### Video Page (/template/10mfunnels/video)
- [ ] Full video player section
- [ ] Hero section with value proposition
- [ ] Portfolio/Work showcase grid
- [ ] Social proof with client logos
- [ ] Expertise section with founder VSL
- [ ] Problem/Pain points section
- [ ] Process breakdown (3-4 steps)
- [ ] Pricing packages with CTAs
- [ ] FAQ section
- [ ] Final CTA section

### Styling
- [ ] Apply typography rules (font-weight 900 for titles, 500 for body)
- [ ] Implement responsive design for all breakpoints
- [ ] Add smooth transitions and animations

## 6. Deployment
- [ ] Deploy to Vercel
- [ ] Configure production environment variables
- [ ] Test complete funnel flow in production
- [ ] Set up custom domain if needed

## Technical Stack
- **Framework**: Next.js with TypeScript
- **UI Components**: shadcn/ui
- **Database**: Supabase (no auth, just database)
- **Email**: Resend (optional)
- **Deployment**: Vercel
- **Styling**: Tailwind CSS (via shadcn/ui)

## Key Implementation Notes
- Simple email capture flow - no user accounts
- Direct redirect after email submission
- Single 'leads' table with minimal fields
- Focus on conversion optimization

---

**Ready for approval to begin implementation.**