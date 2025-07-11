-- Rollback script for multi-tenant architecture migration
-- Use this if you need to revert to the single-user model

-- Drop triggers first
DROP TRIGGER IF EXISTS on_profile_created_create_agency ON public.profiles;
DROP TRIGGER IF EXISTS on_credits_updated_update_agency ON public.credits;
DROP TRIGGER IF EXISTS on_ai_command_completed ON public.ai_commands;
DROP TRIGGER IF EXISTS on_funnel_create_generate_slug ON public.funnels;

DROP TRIGGER IF EXISTS handle_updated_at_agencies ON public.agencies;
DROP TRIGGER IF EXISTS handle_updated_at_clients ON public.clients;
DROP TRIGGER IF EXISTS handle_updated_at_ai_commands ON public.ai_commands;
DROP TRIGGER IF EXISTS handle_updated_at_funnels ON public.funnels;
DROP TRIGGER IF EXISTS handle_updated_at_leads ON public.leads;
DROP TRIGGER IF EXISTS handle_updated_at_team_members ON public.team_members;
DROP TRIGGER IF EXISTS handle_updated_at_templates ON public.templates;
DROP TRIGGER IF EXISTS handle_updated_at_campaigns ON public.campaigns;

-- Drop functions
DROP FUNCTION IF EXISTS public.create_default_agency();
DROP FUNCTION IF EXISTS public.update_agency_credits();
DROP FUNCTION IF EXISTS public.deduct_credits_for_command();
DROP FUNCTION IF EXISTS public.generate_funnel_slug();

-- Drop policies
DROP POLICY IF EXISTS "Users can view their own agency" ON public.agencies;
DROP POLICY IF EXISTS "Users can create their own agency" ON public.agencies;
DROP POLICY IF EXISTS "Agency owners can update their agency" ON public.agencies;
DROP POLICY IF EXISTS "Agency owners can delete their agency" ON public.agencies;

DROP POLICY IF EXISTS "Agency members can view their clients" ON public.clients;
DROP POLICY IF EXISTS "Agency members can create clients" ON public.clients;
DROP POLICY IF EXISTS "Agency members can update clients" ON public.clients;
DROP POLICY IF EXISTS "Agency members can delete clients" ON public.clients;

DROP POLICY IF EXISTS "Users can view profiles in their agency" ON public.profiles;
DROP POLICY IF EXISTS "Users can view credits in their agency" ON public.credits;

DROP POLICY IF EXISTS "Agency members can view their AI commands" ON public.ai_commands;
DROP POLICY IF EXISTS "Agency members can create AI commands" ON public.ai_commands;
DROP POLICY IF EXISTS "Agency members can manage funnels" ON public.funnels;
DROP POLICY IF EXISTS "Agency members can manage leads" ON public.leads;
DROP POLICY IF EXISTS "Agency members can view team" ON public.team_members;
DROP POLICY IF EXISTS "Agency owners can manage team" ON public.team_members;
DROP POLICY IF EXISTS "Users can view public templates" ON public.templates;
DROP POLICY IF EXISTS "Agency members can view their templates" ON public.templates;
DROP POLICY IF EXISTS "Agency members can manage their templates" ON public.templates;
DROP POLICY IF EXISTS "Agency members can manage campaigns" ON public.campaigns;

-- Re-create original profile policies
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Re-create original credit policies
CREATE POLICY "Users can view own credits" ON public.credits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credits" ON public.credits
    FOR UPDATE USING (auth.uid() = user_id);

-- Drop indexes
DROP INDEX IF EXISTS idx_agencies_owner_id;
DROP INDEX IF EXISTS idx_agencies_plan;
DROP INDEX IF EXISTS idx_clients_agency_id;
DROP INDEX IF EXISTS idx_clients_industry;
DROP INDEX IF EXISTS idx_profiles_agency_id;
DROP INDEX IF EXISTS idx_credits_agency_id;
DROP INDEX IF EXISTS idx_ai_commands_agency_id;
DROP INDEX IF EXISTS idx_ai_commands_client_id;
DROP INDEX IF EXISTS idx_ai_commands_user_id;
DROP INDEX IF EXISTS idx_ai_commands_command_type;
DROP INDEX IF EXISTS idx_ai_commands_status;
DROP INDEX IF EXISTS idx_ai_commands_executed_at;
DROP INDEX IF EXISTS idx_funnels_agency_client;
DROP INDEX IF EXISTS idx_funnels_slug;
DROP INDEX IF EXISTS idx_funnels_status;
DROP INDEX IF EXISTS idx_leads_agency_client;
DROP INDEX IF EXISTS idx_leads_email;
DROP INDEX IF EXISTS idx_leads_pipeline_stage;
DROP INDEX IF EXISTS idx_team_members_agency_id;
DROP INDEX IF EXISTS idx_team_members_user_id;
DROP INDEX IF EXISTS idx_templates_agency_id;
DROP INDEX IF EXISTS idx_templates_industry;
DROP INDEX IF EXISTS idx_templates_is_public;
DROP INDEX IF EXISTS idx_campaigns_agency_client;
DROP INDEX IF EXISTS idx_campaigns_status;

-- Remove foreign key constraints by dropping and recreating columns
ALTER TABLE public.profiles DROP COLUMN IF EXISTS agency_id;
ALTER TABLE public.credits DROP COLUMN IF EXISTS agency_id;

-- Drop tables in correct order (respecting foreign key dependencies)
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.funnels CASCADE;
DROP TABLE IF EXISTS public.templates CASCADE;
DROP TABLE IF EXISTS public.ai_commands CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.agencies CASCADE;

-- Note: This rollback will result in data loss for all multi-tenant specific data
-- Make sure to backup your database before running this rollback script