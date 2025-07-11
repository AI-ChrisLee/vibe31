-- AI Commands tracking and additional features for Vibe31
-- This migration adds tables for tracking AI usage, funnels, and team management

-- Create AI commands table for tracking all AI operations
CREATE TABLE IF NOT EXISTS public.ai_commands (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
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

-- Create funnels table
CREATE TABLE IF NOT EXISTS public.funnels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
    template_id UUID,
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

-- Create leads table (multi-client CRM)
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
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

-- Create team_members table for agency team management
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    permissions JSONB DEFAULT '{}',
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(agency_id, user_id)
);

-- Create templates table for reusable funnel templates
CREATE TABLE IF NOT EXISTS public.templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE,
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

-- Create campaigns table for email marketing
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
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

-- Create indexes for performance
CREATE INDEX idx_ai_commands_agency_id ON public.ai_commands(agency_id);
CREATE INDEX idx_ai_commands_client_id ON public.ai_commands(client_id);
CREATE INDEX idx_ai_commands_user_id ON public.ai_commands(user_id);
CREATE INDEX idx_ai_commands_command_type ON public.ai_commands(command_type);
CREATE INDEX idx_ai_commands_status ON public.ai_commands(status);
CREATE INDEX idx_ai_commands_executed_at ON public.ai_commands(executed_at DESC);

CREATE INDEX idx_funnels_agency_client ON public.funnels(agency_id, client_id);
CREATE INDEX idx_funnels_slug ON public.funnels(slug);
CREATE INDEX idx_funnels_status ON public.funnels(status);

CREATE INDEX idx_leads_agency_client ON public.leads(agency_id, client_id);
CREATE INDEX idx_leads_email ON public.leads(email);
CREATE INDEX idx_leads_pipeline_stage ON public.leads(pipeline_stage);

CREATE INDEX idx_team_members_agency_id ON public.team_members(agency_id);
CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);

CREATE INDEX idx_templates_agency_id ON public.templates(agency_id);
CREATE INDEX idx_templates_industry ON public.templates(industry);
CREATE INDEX idx_templates_is_public ON public.templates(is_public);

CREATE INDEX idx_campaigns_agency_client ON public.campaigns(agency_id, client_id);
CREATE INDEX idx_campaigns_status ON public.campaigns(status);

-- Enable Row Level Security
ALTER TABLE public.ai_commands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for AI commands
CREATE POLICY "Agency members can view their AI commands" ON public.ai_commands
    FOR SELECT USING (
        agency_id IN (
            SELECT id FROM public.agencies WHERE owner_id = auth.uid()
            UNION
            SELECT agency_id FROM public.team_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Agency members can create AI commands" ON public.ai_commands
    FOR INSERT WITH CHECK (
        agency_id IN (
            SELECT id FROM public.agencies WHERE owner_id = auth.uid()
            UNION
            SELECT agency_id FROM public.team_members WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for funnels
CREATE POLICY "Agency members can manage funnels" ON public.funnels
    FOR ALL USING (
        agency_id IN (
            SELECT id FROM public.agencies WHERE owner_id = auth.uid()
            UNION
            SELECT agency_id FROM public.team_members WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for leads
CREATE POLICY "Agency members can manage leads" ON public.leads
    FOR ALL USING (
        agency_id IN (
            SELECT id FROM public.agencies WHERE owner_id = auth.uid()
            UNION
            SELECT agency_id FROM public.team_members WHERE user_id = auth.uid()
        )
    );

-- RLS Policies for team members
CREATE POLICY "Agency members can view team" ON public.team_members
    FOR SELECT USING (
        agency_id IN (
            SELECT id FROM public.agencies WHERE owner_id = auth.uid()
            UNION
            SELECT agency_id FROM public.team_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Agency owners can manage team" ON public.team_members
    FOR ALL USING (
        agency_id IN (SELECT id FROM public.agencies WHERE owner_id = auth.uid())
    );

-- RLS Policies for templates
CREATE POLICY "Users can view public templates" ON public.templates
    FOR SELECT USING (is_public = true);

CREATE POLICY "Agency members can view their templates" ON public.templates
    FOR SELECT USING (
        agency_id IN (
            SELECT id FROM public.agencies WHERE owner_id = auth.uid()
            UNION
            SELECT agency_id FROM public.team_members WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Agency members can manage their templates" ON public.templates
    FOR ALL USING (
        agency_id IN (
            SELECT id FROM public.agencies WHERE owner_id = auth.uid()
            UNION
            SELECT agency_id FROM public.team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- RLS Policies for campaigns
CREATE POLICY "Agency members can manage campaigns" ON public.campaigns
    FOR ALL USING (
        agency_id IN (
            SELECT id FROM public.agencies WHERE owner_id = auth.uid()
            UNION
            SELECT agency_id FROM public.team_members WHERE user_id = auth.uid()
        )
    );

-- Function to deduct credits when AI command is executed
CREATE OR REPLACE FUNCTION public.deduct_credits_for_command()
RETURNS TRIGGER AS $$
BEGIN
    -- Only deduct credits when command completes successfully
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        -- Update user credits
        UPDATE public.credits
        SET used_credits = used_credits + NEW.credits_used
        WHERE user_id = NEW.user_id AND agency_id = NEW.agency_id;
        
        -- Update agency credits
        UPDATE public.agencies
        SET credits_used = credits_used + NEW.credits_used
        WHERE id = NEW.agency_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for credit deduction
CREATE TRIGGER on_ai_command_completed
    AFTER UPDATE OF status ON public.ai_commands
    FOR EACH ROW
    EXECUTE FUNCTION public.deduct_credits_for_command();

-- Function to generate unique funnel slug
CREATE OR REPLACE FUNCTION public.generate_funnel_slug()
RETURNS TRIGGER AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Generate base slug from name
    base_slug := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := trim(both '-' from base_slug);
    final_slug := base_slug;
    
    -- Check for uniqueness within client
    WHILE EXISTS (
        SELECT 1 FROM public.funnels 
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

-- Create trigger for funnel slug generation
CREATE TRIGGER on_funnel_create_generate_slug
    BEFORE INSERT OR UPDATE OF name ON public.funnels
    FOR EACH ROW
    EXECUTE FUNCTION public.generate_funnel_slug();

-- Add updated_at triggers
CREATE TRIGGER handle_updated_at_ai_commands BEFORE UPDATE ON public.ai_commands
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_funnels BEFORE UPDATE ON public.funnels
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_leads BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_templates BEFORE UPDATE ON public.templates
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_campaigns BEFORE UPDATE ON public.campaigns
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.ai_commands IS 'Tracks all AI command executions and credit usage';
COMMENT ON TABLE public.funnels IS 'Stores marketing funnels created for clients';
COMMENT ON TABLE public.leads IS 'Multi-client CRM for managing leads across all clients';
COMMENT ON TABLE public.team_members IS 'Manages team members and permissions within agencies';
COMMENT ON TABLE public.templates IS 'Reusable templates for funnels, emails, and automations';
COMMENT ON TABLE public.campaigns IS 'Email and marketing campaign management';

COMMENT ON COLUMN public.ai_commands.command_type IS 'simple=1 credit, content=5 credits, complex=10 credits, bulk=20 credits';
COMMENT ON COLUMN public.funnels.content IS 'JSON structure containing all pages and elements of the funnel';
COMMENT ON COLUMN public.leads.score IS 'AI-calculated lead score based on engagement and behavior';
COMMENT ON COLUMN public.team_members.permissions IS 'JSON object with granular permissions for the team member';