-- Multi-tenant architecture migration for Vibe31
-- This migration transforms the single-user model to support agencies with multiple clients

-- Create agencies table
CREATE TABLE IF NOT EXISTS public.agencies (
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

-- Create clients table
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    industry TEXT,
    branding JSONB DEFAULT '{}',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add agency_id to existing profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agencies(id) ON DELETE SET NULL;

-- Add agency_id to existing credits table
ALTER TABLE public.credits 
ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX idx_agencies_owner_id ON public.agencies(owner_id);
CREATE INDEX idx_agencies_plan ON public.agencies(plan);
CREATE INDEX idx_clients_agency_id ON public.clients(agency_id);
CREATE INDEX idx_clients_industry ON public.clients(industry);
CREATE INDEX idx_profiles_agency_id ON public.profiles(agency_id);
CREATE INDEX idx_credits_agency_id ON public.credits(agency_id);

-- Enable Row Level Security
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for agencies table
CREATE POLICY "Users can view their own agency" ON public.agencies
    FOR SELECT USING (
        auth.uid() = owner_id OR 
        auth.uid() IN (
            SELECT user_id FROM public.profiles 
            WHERE agency_id = agencies.id
        )
    );

CREATE POLICY "Users can create their own agency" ON public.agencies
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Agency owners can update their agency" ON public.agencies
    FOR UPDATE USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Agency owners can delete their agency" ON public.agencies
    FOR DELETE USING (auth.uid() = owner_id);

-- RLS Policies for clients table
CREATE POLICY "Agency members can view their clients" ON public.clients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.agencies 
            WHERE agencies.id = clients.agency_id 
            AND (
                agencies.owner_id = auth.uid() OR
                auth.uid() IN (
                    SELECT user_id FROM public.profiles 
                    WHERE agency_id = agencies.id
                )
            )
        )
    );

CREATE POLICY "Agency members can create clients" ON public.clients
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.agencies 
            WHERE agencies.id = agency_id 
            AND (
                agencies.owner_id = auth.uid() OR
                auth.uid() IN (
                    SELECT user_id FROM public.profiles 
                    WHERE agency_id = agencies.id
                )
            )
        )
    );

CREATE POLICY "Agency members can update clients" ON public.clients
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.agencies 
            WHERE agencies.id = clients.agency_id 
            AND (
                agencies.owner_id = auth.uid() OR
                auth.uid() IN (
                    SELECT user_id FROM public.profiles 
                    WHERE agency_id = agencies.id
                )
            )
        )
    );

CREATE POLICY "Agency members can delete clients" ON public.clients
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.agencies 
            WHERE agencies.id = clients.agency_id 
            AND agencies.owner_id = auth.uid()
        )
    );

-- Update profiles RLS to consider agency membership
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view profiles in their agency" ON public.profiles
    FOR SELECT USING (
        auth.uid() = id OR
        (agency_id IS NOT NULL AND agency_id IN (
            SELECT id FROM public.agencies 
            WHERE owner_id = auth.uid() OR
            id IN (
                SELECT agency_id FROM public.profiles 
                WHERE id = auth.uid()
            )
        ))
    );

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Update credits RLS to consider agency
DROP POLICY IF EXISTS "Users can view own credits" ON public.credits;
DROP POLICY IF EXISTS "Users can update own credits" ON public.credits;

CREATE POLICY "Users can view credits in their agency" ON public.credits
    FOR SELECT USING (
        auth.uid() = user_id OR
        (agency_id IS NOT NULL AND agency_id IN (
            SELECT id FROM public.agencies 
            WHERE owner_id = auth.uid()
        ))
    );

CREATE POLICY "System can manage credits" ON public.credits
    FOR ALL USING (true)
    WITH CHECK (true);

-- Function to automatically create an agency when a new user signs up
CREATE OR REPLACE FUNCTION public.create_default_agency()
RETURNS TRIGGER AS $$
BEGIN
    -- Create a default agency for the new user
    INSERT INTO public.agencies (name, owner_id, plan)
    VALUES (
        COALESCE(NEW.company_name, NEW.full_name || '''s Agency', 'My Agency'),
        NEW.id,
        'freelancer'
    );
    
    -- Update the profile with the agency_id
    UPDATE public.profiles
    SET agency_id = (SELECT id FROM public.agencies WHERE owner_id = NEW.id LIMIT 1)
    WHERE id = NEW.id;
    
    -- Update credits with the agency_id
    UPDATE public.credits
    SET agency_id = (SELECT id FROM public.agencies WHERE owner_id = NEW.id LIMIT 1)
    WHERE user_id = NEW.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create agency for new users
CREATE TRIGGER on_profile_created_create_agency
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.create_default_agency();

-- Function to track agency credit usage
CREATE OR REPLACE FUNCTION public.update_agency_credits()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        -- Update agency credits when individual user credits change
        UPDATE public.agencies
        SET credits_used = (
            SELECT COALESCE(SUM(used_credits), 0)
            FROM public.credits
            WHERE agency_id = NEW.agency_id
        )
        WHERE id = NEW.agency_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to track agency credit usage
CREATE TRIGGER on_credits_updated_update_agency
    AFTER UPDATE OF used_credits ON public.credits
    FOR EACH ROW
    EXECUTE FUNCTION public.update_agency_credits();

-- Add updated_at trigger for agencies
CREATE TRIGGER handle_updated_at_agencies BEFORE UPDATE ON public.agencies
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Add updated_at trigger for clients
CREATE TRIGGER handle_updated_at_clients BEFORE UPDATE ON public.clients
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Migrate existing data
-- This creates a default agency for each existing user
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT * FROM public.profiles WHERE agency_id IS NULL
    LOOP
        -- Create agency for existing user
        INSERT INTO public.agencies (name, owner_id, plan)
        VALUES (
            COALESCE(user_record.company_name, user_record.full_name || '''s Agency', 'My Agency'),
            user_record.id,
            COALESCE(user_record.subscription_tier, 'freelancer')
        );
        
        -- Update profile with agency_id
        UPDATE public.profiles
        SET agency_id = (SELECT id FROM public.agencies WHERE owner_id = user_record.id LIMIT 1)
        WHERE id = user_record.id;
        
        -- Update credits with agency_id
        UPDATE public.credits
        SET agency_id = (SELECT id FROM public.agencies WHERE owner_id = user_record.id LIMIT 1)
        WHERE user_id = user_record.id;
    END LOOP;
END $$;

-- Add comment documentation
COMMENT ON TABLE public.agencies IS 'Stores agency accounts that can manage multiple clients';
COMMENT ON TABLE public.clients IS 'Stores clients managed by agencies';
COMMENT ON COLUMN public.agencies.white_label_settings IS 'JSON object containing branding customization options';
COMMENT ON COLUMN public.clients.branding IS 'JSON object containing client-specific branding assets';
COMMENT ON COLUMN public.clients.settings IS 'JSON object containing client-specific configuration';