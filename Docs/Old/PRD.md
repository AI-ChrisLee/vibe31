# Vibe31 - AI-Powered Marketing Platform

## Overview
Vibe31 is an AI-first marketing platform that lets agencies execute complex marketing tasks through natural language commands. 

**The Hook**: "The only marketing platform where you can say 'create a Black Friday campaign for my fitness clients' and watch it happen."

**Launch Timeline**: 14 days (Starting immediately)

**Development Philosophy**: Building Vibe31 using vibe coding (Claude) to demonstrate the future of natural language development.

## Value Proposition
- **Natural Language Marketing**: Execute any marketing task by typing what you want
- **For Marketing Agencies**: Replace 10+ tools with one AI-powered platform
- **Cost-Effective**: Save $500+/month by consolidating tools
- **Time-Saving**: What takes hours now takes minutes with AI commands
- **No White-Label Complexity**: Focus on your agency, not reselling software

## Target Market
- Small to medium marketing agencies
- Freelance marketers
- Consultants transitioning to agency model
- Agencies frustrated with GoHighLevel complexity

## Core Features

### 1. AI Marketing Assistant (The Core)
- **Natural Language Interface**: Chat-based command center for all marketing tasks
- **Smart Command Processing**: Understands context and executes multi-step operations
- **Live Preview**: See changes happen in real-time as you type
- **Command History**: Learn from past commands and results
- **Credit-Based System**: Transparent usage with rollover credits

### 2. Natural Language Funnel Builder
- **Conversational Design**: "Make the hero section more playful"
- **Live Preview Updates**: See changes instantly as you describe them
- **Smart Templates**: "Create a webinar funnel for B2B SaaS"
- **Mobile-First**: Automatic responsive optimization
- **One-Click Publishing**: Deploy to custom domains instantly

### 3. CRM System
- **Visual Pipeline**: Drag-and-drop deal management
- **Smart Segmentation**: AI-powered contact categorization
- **Natural Language Queries**: "Show me hot leads from this week"
- **Automated Scoring**: AI analyzes and scores leads automatically
- **Activity Timeline**: Complete interaction history

### 4. Email Marketing
- **AI Campaign Builder**: "Create a 5-email nurture sequence for gym members"
- **Smart Automation**: Behavioral triggers via natural language
- **Dynamic Content**: AI personalizes emails per recipient
- **Real-Time Analytics**: Track performance as campaigns run
- **Deliverability Built-in**: Automatic best practices

## Pricing & AI Credits

### Credit System
```
1 Credit = 1 Simple Command (Claude Sonnet)
5 Credits = 1 Complex Command (Claude Opus)
10 Credits = 1 Bulk Operation (Claude Opus)
```

### Pricing Tiers

#### Starter ($97/month)
- **AI Credits**: 100/month (Claude Sonnet only)
- **Rollover**: Up to 50 credits
- **Contacts**: 1,000
- **Team**: 3 members
- **Funnels**: 5
- **Emails**: 10,000/month
- **Overage**: $0.50/credit

#### Professional ($297/month)
- **AI Credits**: 500/month (Sonnet + Opus access)
- **Rollover**: Up to 250 credits
- **Contacts**: 10,000
- **Team**: Unlimited
- **Funnels**: Unlimited
- **Emails**: 50,000/month
- **Overage**: $0.40/credit
- **Bonus**: Bulk operations unlocked

#### Agency ($497/month)
- **AI Credits**: 2,000/month (Priority Opus)
- **Rollover**: Up to 1,000 credits
- **Contacts**: 50,000
- **Team**: Unlimited
- **Funnels**: Unlimited
- **Emails**: 200,000/month
- **Overage**: $0.30/credit
- **Bonus**: API access, custom workflows

## Technical Architecture

### Core Philosophy: Ship Fast with Proven Tools
- Supabase-first architecture
- Serverless everything
- No custom infrastructure

### Tech Stack
**Frontend**
- Next.js 14 (App Router)
- Shadcn/ui + Tailwind CSS
- Vercel AI SDK for chat
- React Hook Form + Zod

**Backend**
- Supabase (Database, Auth, Storage, Realtime)
- Anthropic API (Claude Sonnet/Opus)
- Resend (Email delivery)
- Stripe (Payments)
- Vercel (Hosting & Edge Functions)

### Database Schema (Simplified)
```sql
-- Organizations (Agencies)
organizations (
  id, name, subscription_tier, 
  ai_credits_remaining, ai_credits_used,
  stripe_customer_id, created_at
)

-- Users
users (
  id, organization_id, email,
  full_name, role, created_at
)

-- AI Commands
ai_commands (
  id, user_id, command, command_type,
  credits_used, result, status, executed_at
)

-- Leads
leads (
  id, organization_id, email, name,
  score, tags[], pipeline_stage,
  metadata, created_at
)

-- Funnels
funnels (
  id, organization_id, name, slug,
  content, domain, is_published, created_at
)
```

## 14-Day Development Sprint

### Daily Schedule: 3 Deep Work Blocks (12 hours/day)
- **Block 1**: 4 hours (3 build + 1 content)
- **Block 2**: 4 hours (3 build + 1 content)  
- **Block 3**: 4 hours (3 build + 1 content)

# AI Marketing Assistant Platform - Development Plan

## 1. Project Foundation & Setup ✅
- [x] Initialize Next.js project with TypeScript
  - Use App Router (Next.js 14+)
  - Configure TypeScript strict mode
  - Set up path aliases (@/*)
- [x] Install and configure Tailwind CSS
  - Set up CSS variables for theming
  - Configure custom color palette
- [x] Install and set up shadcn/ui
  - Initialize components.json
  - Install core components (Button, Input, Card, Form, Dialog, Tabs, ScrollArea)
  - Set up theme provider
- [x] Set up project structure
  - /app (routes)
  - /components (ui, chat, preview, funnel)
  - /lib (utilities, hooks, ai)
  - /types (TypeScript definitions)
- [x] Configure ESLint and Prettier

## 2. Infrastructure & Services Setup ✅
- [x] Set up Supabase project
  - Create new project on Supabase dashboard
  - Configure database URL and keys
  - Connect Supabase MCP
  - Design initial database schema
- [x] Configure environment variables
  - Create .env.local file
  - Add Supabase credentials
  - Add placeholders for Claude API, Resend, Stripe
- [x] Create MCP configuration file
  - Document all service connections
  - API keys management guide
  - Service limits and quotas
- [x] Set up Vercel deployment
  - Connect GitHub repository
  - Configure environment variables
  - Set up preview deployments

## 3. Waitlist System ✅
- [x] Design waitlist database schema
  ```sql
  waitlist:
  - id (uuid)
  - email (text, unique)
  - created_at (timestamp)
  - position (serial)
  - status (text)
  - referral_code (text)
  - interested_features (text[])
  - metadata (jsonb)
  ```
- [x] Create landing page
  - Hero section showcasing AI assistant
  - Interactive demo preview
  - Feature highlights (AI Assistant, Funnel Builder, CRM, Email)
  - Pricing preview
- [x] Build waitlist signup form
  - Email input with validation
  - Feature interest checkboxes
  - Submit with loading state
  - Success messaging with position
- [x] Create waitlist API endpoint
  - POST /api/waitlist
  - Email validation
  - Position assignment
  - Welcome email trigger (ready for integration)
- [x] Admin waitlist dashboard
  - Signup analytics
  - Feature interest breakdown
  - Export functionality

## 4. Authentication & Credit System ✅
- [x] Design auth and credits schema ✅
  ```sql
  users:
  - id (uuid)
  - email (text, unique)
  - full_name (text)
  - created_at (timestamp)
  - updated_at (timestamp)
  
  credits:
  - id (uuid)
  - user_id (uuid, FK to users)
  - total_credits (integer)
  - used_credits (integer)
  - rollover_credits (integer)
  - reset_date (timestamp)
  - created_at (timestamp)
  - updated_at (timestamp)
  ```
  - Created tables with proper constraints
  - Added indexes for performance
  - Implemented RLS policies
  - Added update triggers for timestamps
- [x] Implement authentication ✅
  - Magic link login
  - Password authentication
  - OAuth (Google, GitHub)
  - Session management
  - Protected route middleware
  - Auth context provider
- [x] Build credit system ✅
  - Credit tracking with real-time updates
  - Usage deduction logic
  - Rollover support
  - useCredits hook for easy access
  - Initial 100 credits on signup
- [x] Create usage dashboard ✅
  - Current credits display in nav
  - Dashboard overview with progress bar
  - Dedicated credits management page
  - Usage statistics
  - Upgrade plans display

## 5. AI Marketing Assistant (Core Feature)
- [ ] Design dual-control interface
  - Chat panel with message component
  - Fully interactive live preview/dashboard panel
  - Synchronized state between chat and UI actions
  - Command history showing both chat and UI actions
- [ ] Set up Claude API integration
  - API wrapper with streaming
  - Context management
  - Rate limiting
  - Error handling
- [ ] Implement command processing
  ```typescript
  Commands:
  - "Create a landing page for..."
  - "Write email campaign about..."
  - "Show me leads from..."
  - "Build a funnel for..."
  ```
- [ ] Build chat features
  - Message streaming
  - Code highlighting
  - Copy/export options
  - Undo/redo commands
- [ ] Create command templates
  - Quick action buttons
  - Common task templates  
  - Custom saved commands
  - Progressive disclosure (show advanced options on hover)
- [ ] Implement dual-control patterns
  - Click handlers for all UI elements
  - Chat command parser
  - Keyboard shortcuts
  - Touch gestures for mobile
  - Accessibility controls
- [ ] Build interactive live panel
  - Split-screen with chat/interactive view
  - Direct click-to-edit functionality
  - Inline content editing (contenteditable)
  - Drag-and-drop element positioning
  - Right-click context menus
  - Hover states showing edit options
  - Device preview switcher

## 6. Natural Language Funnel Builder
- [ ] Design funnel schema
  ```sql
  funnels:
  - id (uuid)
  - user_id (uuid)
  - name (text)
  - pages (jsonb)
  - domain (text)
  - status (text)
  - created_at (timestamp)
  ```
- [ ] Create funnel builder UI
  - Visual funnel flow diagram
  - Page editor with live preview
  - Element library
  - Style customization panel
- [ ] Implement dual-control page editing
  - Parse natural language commands
  - Direct manipulation (click, drag, edit)
  - Bidirectional sync (chat ↔ UI actions)
  - Chat reflects UI changes ("✓ Changed button color")
  - Generate responsive CSS
  - Smart component suggestions
- [ ] Build funnel templates
  - Webinar funnel
  - Sales page funnel
  - Lead magnet funnel
  - Product launch funnel
- [ ] Add publishing system
  - Custom domain setup
  - SSL configuration
  - CDN integration
  - Analytics injection
- [ ] Create funnel analytics
  - Conversion tracking
  - A/B testing setup
  - Heatmap integration
  - Funnel drop-off analysis

## 7. CRM System
- [ ] Design CRM schema
  ```sql
  contacts:
  - id (uuid)
  - user_id (uuid)
  - email (text)
  - name (text)
  - company (text)
  - tags (text[])
  - score (integer)
  - created_at (timestamp)
  
  deals:
  - id (uuid)
  - contact_id (uuid)
  - stage (text)
  - value (decimal)
  - probability (integer)
  ```
- [ ] Build interactive pipeline view
  - Kanban board with dual control
  - Drag-and-drop deals directly
  - Chat commands ("Move deal to closed")
  - Click stages to customize inline
  - Right-click quick actions menu
  - Hover states for available actions
- [ ] Implement smart segmentation
  - AI-powered tagging
  - Behavior-based segments
  - Custom field creation
  - Bulk operations
- [ ] Create NL queries
  - Search parser
  - Filter builder
  - Saved searches
  - Export results
- [ ] Add lead scoring
  - AI scoring algorithm
  - Custom scoring rules
  - Score history tracking
  - Alert thresholds
- [ ] Build activity timeline
  - Email interactions
  - Page visits
  - Deal updates
  - Notes and tasks

## 8. Email Marketing System
- [ ] Design email schema
  ```sql
  email_campaigns:
  - id (uuid)
  - user_id (uuid)
  - name (text)
  - type (text)
  - content (jsonb)
  - schedule (jsonb)
  - status (text)
  
  email_automations:
  - id (uuid)
  - trigger (jsonb)
  - actions (jsonb)
  - status (text)
  ```
- [ ] Build AI campaign builder with dual control
  - NL campaign creation ("Create welcome email")
  - Direct email editing (click to edit text)
  - Drag-and-drop email blocks
  - Visual sequence builder with chat control
  - Template library (browsable and chat-accessible)
  - Click-to-insert personalization tokens
- [ ] Create email editor
  - Drag-and-drop blocks
  - Live preview
  - Mobile optimization
  - Dark mode preview
- [ ] Implement automation
  - Trigger setup UI
  - Action chain builder
  - Condition logic
  - Testing mode
- [ ] Add analytics dashboard
  - Open/click rates
  - Real-time tracking
  - Campaign comparison
  - Subscriber growth
- [ ] Build deliverability features
  - SPF/DKIM setup
  - Spam score checker
  - Best practice alerts
  - Warmup sequences

## 9. Live Interactive System (Dual-Control)
- [ ] Design dual-control architecture
  - Unified command system (chat/UI/keyboard)
  - WebSocket for real-time sync
  - Bidirectional state management
  - Action history (both chat and UI)
- [ ] Build interactive components
  - Click-to-edit everything
  - Inline editing (contenteditable)
  - Context menus on right-click
  - Hover tooltips with options
  - Device frames with interaction
- [ ] Implement synchronized updates
  - Chat → UI: Apply commands to live view
  - UI → Chat: Log actions in chat history
  - Real-time DOM manipulation
  - Style injection with visual feedback
  - Undo/redo for both input methods
- [ ] Add collaboration features
  - Share preview links
  - Comment system
  - Version control
  - Approval workflow

## 10. Billing & Subscription
- [ ] Set up Stripe integration
  - Product catalog
  - Subscription plans
  - Usage-based billing
  - Invoice generation
- [ ] Design pricing tiers
  ```
  Starter: $49/mo - 1,000 credits
  Growth: $149/mo - 5,000 credits
  Scale: $449/mo - 20,000 credits
  Enterprise: Custom
  ```
- [ ] Build billing portal
  - Plan selection
  - Payment methods
  - Usage tracking
  - Invoice history
- [ ] Implement credit system
  - Credit purchase
  - Auto-refill options
  - Usage alerts
  - Rollover rules

## 11. Analytics & Reporting
- [ ] Design analytics schema
  - Event tracking
  - User behavior
  - Performance metrics
  - Revenue tracking
- [ ] Build dashboard
  - Key metrics cards
  - Usage trends
  - Revenue analytics
  - Feature adoption
- [ ] Create reports
  - Campaign performance
  - Funnel analytics
  - CRM insights
  - Email metrics
- [ ] Add export features
  - PDF reports
  - CSV data export
  - API access
  - Scheduled reports

## 12. API & Integrations
- [ ] Design REST API
  - Authentication
  - Rate limiting
  - Documentation
  - SDKs
- [ ] Build webhooks
  - Event types
  - Delivery system
  - Retry logic
  - Security
- [ ] Create integrations
  - Zapier
  - WordPress plugin
  - Shopify app
  - Chrome extension

## 13. Mobile Optimization
- [ ] Responsive design
  - Touch interactions
  - Mobile navigation
  - Gesture support
  - Performance optimization
- [ ] Progressive Web App
  - Service worker
  - Offline support
  - Push notifications
  - App manifest
- [ ] Mobile-specific features
  - Voice commands
  - Camera integration
  - Touch-friendly UI
  - Simplified workflows

## 14. Security & Compliance
- [ ] Implement security
  - Data encryption
  - API security
  - XSS prevention
  - CSRF protection
- [ ] Add compliance features
  - GDPR tools
  - Data export
  - Deletion requests
  - Cookie consent
- [ ] Build audit system
  - Activity logs
  - Access control
  - Change tracking
  - Security alerts

## 15. Launch Preparation
- [ ] Performance optimization
  - Code splitting
  - Image optimization
  - CDN setup
  - Caching strategy
- [ ] Testing suite
  - Unit tests
  - Integration tests
  - E2E tests
  - Load testing
- [ ] Documentation
  - User guides
  - Video tutorials
  - API docs
  - Help center
- [ ] Launch tasks
  - Migration scripts
  - Monitoring setup
  - Support system
  - Launch campaign

## Tech Stack
- **Frontend**: Next.js 14+, TypeScript, shadcn/ui, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **AI**: Claude API (Anthropic)
- **Real-time**: WebSockets, Supabase Realtime
- **Payments**: Stripe
- **Email**: Resend, SendGrid for marketing
- **Deployment**: Vercel
- **CDN**: Cloudflare
- **Monitoring**: Sentry, Posthog

## Success Metrics
- **Waitlist**: 1,000+ signups
- **Launch**: 100 paying customers in first month
- **Engagement**: 80% weekly active users
- **Revenue**: $10K MRR in 3 months
- **NPS**: 50+ score

## Go-to-Market Strategy

### Content Flywheel System

**Daily Output**
- 6 X/Twitter posts (2 per work block)
- 1 YouTube long-form video (20-30 min)
- All content drives to waitlist

**The Meta Story**: "Building a $100K SaaS Using Only Natural Language"

**Daily Belief Statement** (end every video):
"Figure out what you want. Ignore the opinions of others. Do so much volume that it would be unreasonable to not be successful."

### Launch Strategy
- **Pre-Launch**: 1,000 waitlist signups goal
- **Launch Day**: Product Hunt, X announcement
- **Week 1**: YouTube series completion
- **Early Bird**: First 100 users get 2x credits for life
- **Referral Program**: 3 referrals = 1 month free

## Success Metrics

### Launch Week
- 100 signups
- 50 paying customers
- $5K MRR
- <2s command execution

### Month 1
- 500 signups
- 200 paying customers
- $25K MRR
- 90% command accuracy

### Month 3
- 1,500 signups
- 600 paying customers
- $100K MRR
- 85% retention rate

## Core AI Commands

### Simple (1 credit)
- "Add John Smith as a lead"
- "Show me this week's leads"
- "Send welcome email"
- "Change headline to X"
- "Tag all Chicago leads"

### Complex (5 credits)
- "Create 5-email welcome sequence for fitness clients"
- "Build webinar registration funnel"
- "Set up abandoned cart automation"
- "Analyze my best converting emails"
- "Generate 10 Black Friday subject lines"

### Bulk (10 credits)
- "Import 500 contacts and segment by industry"
- "Update all funnels with new branding"
- "Send personalized emails to all leads"
- "Migrate data from HubSpot"

## Vibe Coding Development Approach

### Philosophy
Use Claude to write 90% of the code through natural language. No Figma, no traditional planning - just conversation and code.

### Example Prompts
**Landing Page**: "Create a modern SaaS landing page with animated gradient hero"

**Dashboard**: "Build a dashboard like Linear meets Notion with command bar"

**Funnel Builder**: "Create an editor where 'make headline bigger' updates live"

### Workflow
1. Describe to Claude
2. Get initial code
3. Test in browser
4. Iterate naturally
5. Ship it

## Competitive Advantages

1. **Natural Language Everything**: No clicking through menus
2. **Built in Public**: Complete transparency
3. **AI-First Architecture**: Not just features bolted on
4. **Speed of Development**: 14 days using vibe coding
5. **Clear Positioning**: "Stop clicking. Start commanding."

## The Bottom Line

Vibe31 isn't just another marketing platform with AI bolted on. It's a fundamental rethink of how marketing agencies work. Instead of clicking through dozens of menus and forms, users simply type what they want to happen. 

The future of marketing software isn't more features—it's natural language interfaces that understand intent and execute flawlessly. We're building that future, starting with a 14-day sprint using the exact same approach our customers will use.