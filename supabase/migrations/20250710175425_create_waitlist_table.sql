-- Create waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    position SERIAL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'converted')),
    referral_code TEXT UNIQUE DEFAULT substr(md5(random()::text), 0, 9),
    interested_features TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for better query performance
CREATE INDEX idx_waitlist_email ON waitlist(email);
CREATE INDEX idx_waitlist_status ON waitlist(status);
CREATE INDEX idx_waitlist_created_at ON waitlist(created_at);
CREATE INDEX idx_waitlist_referral_code ON waitlist(referral_code);

-- Add RLS (Row Level Security) policies
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Policy for public to insert their email (signup)
CREATE POLICY "Anyone can join waitlist" ON waitlist
    FOR INSERT WITH CHECK (true);

-- Policy for authenticated users to view their own entry
CREATE POLICY "Users can view their own waitlist entry" ON waitlist
    FOR SELECT USING (auth.jwt() ->> 'email' = email);

-- Create function to get waitlist position
CREATE OR REPLACE FUNCTION get_waitlist_position(user_email TEXT)
RETURNS INTEGER AS $$
DECLARE
    user_position INTEGER;
BEGIN
    SELECT position INTO user_position
    FROM waitlist
    WHERE email = user_email;
    
    RETURN user_position;
END;
$$ LANGUAGE plpgsql;

-- Create function to calculate referral stats
CREATE OR REPLACE FUNCTION get_referral_stats(ref_code TEXT)
RETURNS TABLE (
    total_referrals INTEGER,
    pending_referrals INTEGER,
    approved_referrals INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_referrals,
        COUNT(*) FILTER (WHERE status = 'pending')::INTEGER as pending_referrals,
        COUNT(*) FILTER (WHERE status = 'approved')::INTEGER as approved_referrals
    FROM waitlist
    WHERE metadata->>'referred_by' = ref_code;
END;
$$ LANGUAGE plpgsql;