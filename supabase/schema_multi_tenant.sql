-- Vibe31 Multi-Tenant Database Schema
-- Complete schema for the AI-powered agency transformation platform

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CORE TABLES
-- =============================================

-- Agencies table (main tenant model)
CREATE TABLE agencies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL DEFAULT 'freelancer' CHECK (plan IN ('freelancer', 'agency', 'scale', 'enterprise')),
    credits_total INTEGER NOT NULL DEFAULT 500,
    credits_used INTEGER NOT NULL DEFAULT 0,
    white_label_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients table (agency's clients)
CREATE TABLE clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    industry TEXT,
    branding JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles (extended from auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    company_name TEXT,
    industry TEXT,
    role TEXT,
    agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL,
    preferences JSONB DEFAULT '{}',
    subscription_tier TEXT DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credits tracking
CREATE TABLE credits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
    total_credits INTEGER DEFAULT 0,
    used_credits INTEGER DEFAULT 0,
    rollover_credits INTEGER DEFAULT 0,
    reset_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team members
CREATE TABLE team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    permissions JSONB DEFAULT '{}',
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(agency_id, user_id)
);

-- =============================================
-- AI & AUTOMATION TABLES
-- =============================================

-- AI Commands tracking
CREATE TABLE ai_commands (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    command TEXT NOT NULL,
    command_type TEXT NOT NULL CHECK (command_type IN ('simple', 'content', 'complex', 'bulk')),
    credits_used INTEGER NOT NULL,
    result JSONB DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}'
);

-- Templates library
CREATE TABLE templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    industry TEXT,
    template_type TEXT NOT NULL DEFAULT 'funnel' CHECK (template_type IN ('funnel', 'email', 'page', 'automation')),
    content JSONB NOT NULL DEFAULT '{}',
    thumbnail_url TEXT,
    is_public BOOLEAN DEFAULT false,
    usage_count INTEGER DEFAULT 0,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- FUNNEL & MARKETING TABLES
-- =============================================

-- Funnels
CREATE TABLE funnels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    template_id UUID REFERENCES templates(id),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    content JSONB DEFAULT '{}',
    domain TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    analytics JSONB DEFAULT '{}',
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE
);

-- Campaigns
CREATE TABLE campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    campaign_type TEXT NOT NULL CHECK (campaign_type IN ('email', 'sms', 'automation')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'paused', 'cancelled')),
    content JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    stats JSONB DEFAULT '{}',
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CRM TABLES
-- =============================================

-- Leads (multi-client CRM)
CREATE TABLE leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    score INTEGER DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    pipeline_stage TEXT DEFAULT 'new',
    source TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- WAITLIST TABLE (for launch)
-- =============================================

CREATE TABLE waitlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    position SERIAL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'converted')),
    referral_code TEXT UNIQUE,
    interested_features TEXT[],
    metadata JSONB DEFAULT '{}'
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Agencies indexes
CREATE INDEX idx_agencies_owner_id ON agencies(owner_id);
CREATE INDEX idx_agencies_plan ON agencies(plan);

-- Clients indexes
CREATE INDEX idx_clients_agency_id ON clients(agency_id);
CREATE INDEX idx_clients_industry ON clients(industry);

-- Profiles indexes
CREATE INDEX idx_profiles_agency_id ON profiles(agency_id);

-- Credits indexes
CREATE INDEX idx_credits_user_id ON credits(user_id);
CREATE INDEX idx_credits_agency_id ON credits(agency_id);

-- Team members indexes
CREATE INDEX idx_team_members_agency_id ON team_members(agency_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);

-- AI commands indexes
CREATE INDEX idx_ai_commands_agency_id ON ai_commands(agency_id);
CREATE INDEX idx_ai_commands_client_id ON ai_commands(client_id);
CREATE INDEX idx_ai_commands_user_id ON ai_commands(user_id);
CREATE INDEX idx_ai_commands_command_type ON ai_commands(command_type);
CREATE INDEX idx_ai_commands_status ON ai_commands(status);
CREATE INDEX idx_ai_commands_executed_at ON ai_commands(executed_at DESC);

-- Templates indexes
CREATE INDEX idx_templates_agency_id ON templates(agency_id);
CREATE INDEX idx_templates_industry ON templates(industry);
CREATE INDEX idx_templates_is_public ON templates(is_public);

-- Funnels indexes
CREATE INDEX idx_funnels_agency_client ON funnels(agency_id, client_id);
CREATE INDEX idx_funnels_slug ON funnels(slug);
CREATE INDEX idx_funnels_status ON funnels(status);

-- Campaigns indexes
CREATE INDEX idx_campaigns_agency_client ON campaigns(agency_id, client_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);

-- Leads indexes
CREATE INDEX idx_leads_agency_client ON leads(agency_id, client_id);
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_pipeline_stage ON leads(pipeline_stage);

-- Waitlist indexes
CREATE INDEX idx_waitlist_email ON waitlist(email);
CREATE INDEX idx_waitlist_status ON waitlist(status);
CREATE INDEX idx_waitlist_created_at ON waitlist(created_at);
CREATE INDEX idx_waitlist_referral_code ON waitlist(referral_code);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all tables
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Agency policies
CREATE POLICY "Users can view their own agency" ON agencies
    FOR SELECT USING (
        auth.uid() = owner_id OR 
        auth.uid() IN (SELECT user_id FROM team_members WHERE agency_id = agencies.id)
    );

CREATE POLICY "Users can create their own agency" ON agencies
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Agency owners can update their agency" ON agencies
    FOR UPDATE USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

-- Client policies
CREATE POLICY "Agency members can manage clients" ON clients
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM agencies 
            WHERE agencies.id = clients.agency_id 
            AND (agencies.owner_id = auth.uid() OR 
                 auth.uid() IN (SELECT user_id FROM team_members WHERE agency_id = agencies.id))
        )
    );

-- Profile policies
CREATE POLICY "Users can view profiles in their agency" ON profiles
    FOR SELECT USING (
        auth.uid() = id OR
        (agency_id IS NOT NULL AND agency_id IN (
            SELECT id FROM agencies WHERE owner_id = auth.uid()
            UNION
            SELECT agency_id FROM team_members WHERE user_id = auth.uid()
        ))
    );

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Credits policies
CREATE POLICY "Users can view credits in their agency" ON credits
    FOR SELECT USING (
        auth.uid() = user_id OR
        agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid())
    );

-- Team member policies
CREATE POLICY "Agency members can view team" ON team_members
    FOR SELECT USING (
        agency_id IN (
            SELECT id FROM agencies WHERE owner_id = auth.uid()
            UNION
            SELECT agency_id FROM team_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Agency owners can manage team" ON team_members
    FOR ALL USING (
        agency_id IN (SELECT id FROM agencies WHERE owner_id = auth.uid())
    );

-- AI commands policies
CREATE POLICY "Agency members can use AI commands" ON ai_commands
    FOR ALL USING (
        agency_id IN (
            SELECT id FROM agencies WHERE owner_id = auth.uid()
            UNION
            SELECT agency_id FROM team_members WHERE user_id = auth.uid()
        )
    );

-- Template policies
CREATE POLICY "Public templates are viewable by all" ON templates
    FOR SELECT USING (is_public = true);

CREATE POLICY "Agency members can manage their templates" ON templates
    FOR ALL USING (
        agency_id IN (
            SELECT id FROM agencies WHERE owner_id = auth.uid()
            UNION
            SELECT agency_id FROM team_members WHERE user_id = auth.uid()
        )
    );

-- Funnel policies
CREATE POLICY "Agency members can manage funnels" ON funnels
    FOR ALL USING (
        agency_id IN (
            SELECT id FROM agencies WHERE owner_id = auth.uid()
            UNION
            SELECT agency_id FROM team_members WHERE user_id = auth.uid()
        )
    );

-- Campaign policies
CREATE POLICY "Agency members can manage campaigns" ON campaigns
    FOR ALL USING (
        agency_id IN (
            SELECT id FROM agencies WHERE owner_id = auth.uid()
            UNION
            SELECT agency_id FROM team_members WHERE user_id = auth.uid()
        )
    );

-- Lead policies
CREATE POLICY "Agency members can manage leads" ON leads
    FOR ALL USING (
        agency_id IN (
            SELECT id FROM agencies WHERE owner_id = auth.uid()
            UNION
            SELECT agency_id FROM team_members WHERE user_id = auth.uid()
        )
    );

-- Waitlist policies
CREATE POLICY "Anyone can join waitlist" ON waitlist
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own waitlist entry" ON waitlist
    FOR SELECT USING (email = auth.jwt() ->> 'email');

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Updated timestamp function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
CREATE TRIGGER handle_updated_at_agencies BEFORE UPDATE ON agencies
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_clients BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_profiles BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_credits BEFORE UPDATE ON credits
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_ai_commands BEFORE UPDATE ON ai_commands
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_templates BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_funnels BEFORE UPDATE ON funnels
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_campaigns BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER handle_updated_at_leads BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    agency_id UUID;
BEGIN
    -- Create profile
    INSERT INTO profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    
    -- Create default agency
    INSERT INTO agencies (name, owner_id, plan)
    VALUES (
        COALESCE(NEW.raw_user_meta_data->>'company_name', 'My Agency'),
        NEW.id,
        'freelancer'
    )
    RETURNING id INTO agency_id;
    
    -- Update profile with agency_id
    UPDATE profiles SET agency_id = agency_id WHERE id = NEW.id;
    
    -- Initialize credits
    INSERT INTO credits (user_id, agency_id, total_credits, reset_date)
    VALUES (
        NEW.id,
        agency_id,
        500, -- Freelancer plan starts with 500 credits
        DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to generate unique funnel slug
CREATE OR REPLACE FUNCTION generate_funnel_slug()
RETURNS TRIGGER AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    base_slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := trim(both '-' from base_slug);
    final_slug := base_slug;
    
    WHILE EXISTS (
        SELECT 1 FROM funnels 
        WHERE client_id = NEW.client_id 
        AND slug = final_slug 
        AND id != NEW.id
    ) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    NEW.slug := final_slug;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for funnel slug generation
CREATE TRIGGER on_funnel_create_generate_slug
    BEFORE INSERT OR UPDATE OF name ON funnels
    FOR EACH ROW
    EXECUTE FUNCTION generate_funnel_slug();

-- Function to deduct credits when AI command completes
CREATE OR REPLACE FUNCTION deduct_credits_for_command()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Update user credits
        UPDATE credits
        SET used_credits = used_credits + NEW.credits_used
        WHERE user_id = NEW.user_id AND agency_id = NEW.agency_id;
        
        -- Update agency credits
        UPDATE agencies
        SET credits_used = credits_used + NEW.credits_used
        WHERE id = NEW.agency_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for credit deduction
CREATE TRIGGER on_ai_command_completed
    AFTER UPDATE OF status ON ai_commands
    FOR EACH ROW
    EXECUTE FUNCTION deduct_credits_for_command();

-- Function to get waitlist position
CREATE OR REPLACE FUNCTION get_waitlist_position(email_input TEXT)
RETURNS INTEGER AS $$
DECLARE
    user_position INTEGER;
BEGIN
    SELECT position INTO user_position
    FROM waitlist
    WHERE email = email_input;
    
    RETURN user_position;
END;
$$ LANGUAGE plpgsql;

-- Function to get referral stats
CREATE OR REPLACE FUNCTION get_referral_stats(code TEXT)
RETURNS TABLE(
    total_referrals BIGINT,
    approved_referrals BIGINT,
    pending_referrals BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) AS total_referrals,
        COUNT(*) FILTER (WHERE status = 'approved') AS approved_referrals,
        COUNT(*) FILTER (WHERE status = 'pending') AS pending_referrals
    FROM waitlist
    WHERE metadata->>'referred_by' = code;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TABLE COMMENTS
-- =============================================

COMMENT ON TABLE agencies IS 'Main tenant table - stores agency accounts';
COMMENT ON TABLE clients IS 'Clients managed by agencies';
COMMENT ON TABLE profiles IS 'User profiles extending auth.users';
COMMENT ON TABLE credits IS 'Credit tracking for users and agencies';
COMMENT ON TABLE team_members IS 'Team members and permissions within agencies';
COMMENT ON TABLE ai_commands IS 'Tracks all AI command executions';
COMMENT ON TABLE templates IS 'Reusable templates for funnels, emails, etc';
COMMENT ON TABLE funnels IS 'Marketing funnels created for clients';
COMMENT ON TABLE campaigns IS 'Email and marketing campaigns';
COMMENT ON TABLE leads IS 'Multi-client CRM for lead management';
COMMENT ON TABLE waitlist IS 'Launch waitlist with referral tracking';

COMMENT ON COLUMN ai_commands.command_type IS 'simple=1 credit, content=5 credits, complex=10 credits, bulk=20 credits';
COMMENT ON COLUMN agencies.white_label_settings IS 'JSON: {logo_url, primary_color, secondary_color, custom_domain}';
COMMENT ON COLUMN clients.branding IS 'JSON: {logo_url, colors, fonts, brand_voice}';
COMMENT ON COLUMN funnels.content IS 'JSON: {pages: [{id, name, elements, settings}]}';
COMMENT ON COLUMN leads.score IS 'AI-calculated lead score 0-100';