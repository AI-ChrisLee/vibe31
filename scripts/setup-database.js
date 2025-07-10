import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function executeSQL(sql, description) {
  console.log(`\n📝 ${description}...`)
  try {
    const { data, error } = await supabase.rpc('exec_sql', { query: sql })
    if (error) throw error
    console.log(`✅ ${description} - Success`)
    return { success: true, data }
  } catch (error) {
    console.error(`❌ ${description} - Failed:`, error.message)
    return { success: false, error: error.message }
  }
}

async function setupDatabase() {
  console.log('🚀 Starting database setup...')
  
  const results = []
  
  // 1. Enable UUID extension
  results.push(await executeSQL(
    `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`,
    'Enable UUID extension'
  ))
  
  // 2. Create waitlist table
  results.push(await executeSQL(
    `CREATE TABLE IF NOT EXISTS waitlist (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
      position INTEGER NOT NULL,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
      referral_code TEXT UNIQUE,
      interested_features TEXT[]
    );`,
    'Create waitlist table'
  ))
  
  // 3. Create indexes
  results.push(await executeSQL(
    `CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
     CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(created_at);
     CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist(status);`,
    'Create waitlist indexes'
  ))
  
  // 4. Create position function and trigger
  results.push(await executeSQL(
    `CREATE OR REPLACE FUNCTION assign_waitlist_position()
     RETURNS TRIGGER AS $$
     BEGIN
       SELECT COALESCE(MAX(position), 0) + 1 INTO NEW.position FROM waitlist;
       RETURN NEW;
     END;
     $$ LANGUAGE plpgsql;`,
    'Create position assignment function'
  ))
  
  results.push(await executeSQL(
    `CREATE TRIGGER waitlist_position_trigger
     BEFORE INSERT ON waitlist
     FOR EACH ROW
     EXECUTE FUNCTION assign_waitlist_position();`,
    'Create position trigger'
  ))
  
  // 5. Create profiles table
  results.push(await executeSQL(
    `CREATE TABLE IF NOT EXISTS profiles (
      id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
      email TEXT,
      full_name TEXT,
      avatar_url TEXT,
      company_name TEXT,
      industry TEXT,
      role TEXT,
      preferences JSONB DEFAULT '{}',
      subscription_tier TEXT DEFAULT 'free',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
    );`,
    'Create profiles table'
  ))
  
  // 6. Create credits table
  results.push(await executeSQL(
    `CREATE TABLE IF NOT EXISTS credits (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
      total_credits INTEGER DEFAULT 0,
      used_credits INTEGER DEFAULT 0,
      rollover_credits INTEGER DEFAULT 0,
      reset_date TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
    );`,
    'Create credits table'
  ))
  
  results.push(await executeSQL(
    `CREATE INDEX IF NOT EXISTS idx_credits_user_id ON credits(user_id);`,
    'Create credits index'
  ))
  
  // 7. Enable RLS
  results.push(await executeSQL(
    `ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
     ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
     ALTER TABLE credits ENABLE ROW LEVEL SECURITY;`,
    'Enable Row Level Security'
  ))
  
  // 8. Create RLS policies
  results.push(await executeSQL(
    `CREATE POLICY "Anyone can join waitlist" ON waitlist
     FOR INSERT WITH CHECK (true);`,
    'Create waitlist insert policy'
  ))
  
  results.push(await executeSQL(
    `CREATE POLICY "Only admins can view waitlist" ON waitlist
     FOR SELECT USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');`,
    'Create waitlist select policy'
  ))
  
  results.push(await executeSQL(
    `CREATE POLICY "Users can view own profile" ON profiles
     FOR SELECT USING (auth.uid() = id);`,
    'Create profile select policy'
  ))
  
  results.push(await executeSQL(
    `CREATE POLICY "Users can update own profile" ON profiles
     FOR UPDATE USING (auth.uid() = id);`,
    'Create profile update policy'
  ))
  
  results.push(await executeSQL(
    `CREATE POLICY "Users can view own credits" ON credits
     FOR SELECT USING (auth.uid() = user_id);`,
    'Create credits select policy'
  ))
  
  // 9. Create new user handler
  results.push(await executeSQL(
    `CREATE OR REPLACE FUNCTION public.handle_new_user()
     RETURNS TRIGGER AS $$
     BEGIN
       INSERT INTO public.profiles (id, email, full_name, avatar_url)
       VALUES (
         NEW.id,
         NEW.email,
         NEW.raw_user_meta_data->>'full_name',
         NEW.raw_user_meta_data->>'avatar_url'
       );
       
       INSERT INTO public.credits (user_id, total_credits, reset_date)
       VALUES (
         NEW.id,
         10,
         DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
       );
       
       RETURN NEW;
     END;
     $$ LANGUAGE plpgsql SECURITY DEFINER;`,
    'Create new user handler function'
  ))
  
  results.push(await executeSQL(
    `CREATE TRIGGER on_auth_user_created
     AFTER INSERT ON auth.users
     FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`,
    'Create new user trigger'
  ))
  
  // Summary
  console.log('\n📊 Setup Summary:')
  const successful = results.filter(r => r.success).length
  const failed = results.filter(r => !r.success).length
  
  console.log(`✅ Successful: ${successful}`)
  console.log(`❌ Failed: ${failed}`)
  
  if (failed > 0) {
    console.log('\n⚠️  Some operations failed. Please check the errors above.')
  } else {
    console.log('\n🎉 Database setup completed successfully!')
  }
}

// Alternative approach using direct SQL execution
async function setupDatabaseDirect() {
  console.log('🚀 Starting database setup (direct SQL)...')
  
  // Read the schema file
  const fs = await import('fs/promises')
  const schemaSQL = await fs.readFile('./supabase/schema.sql', 'utf-8')
  
  // Since Supabase doesn't expose direct SQL execution via the client library,
  // we'll need to use the Supabase dashboard or CLI
  console.log('\n📋 Schema SQL loaded. Please execute in Supabase SQL Editor:')
  console.log('----------------------------------------')
  console.log(schemaSQL)
  console.log('----------------------------------------')
  console.log('\n💡 Tip: You can also save this as a migration file and use Supabase CLI')
}

// Check if we can use the RPC method
console.log('Checking Supabase connection...')
const { data: tables, error } = await supabase
  .from('waitlist')
  .select('count')
  .limit(1)

if (error && error.message.includes('relation "public.waitlist" does not exist')) {
  console.log('✅ Connected to Supabase. Tables need to be created.')
  console.log('\n⚠️  Note: Direct SQL execution via client is not available.')
  console.log('Please use one of these methods:')
  console.log('1. Copy the SQL from supabase/schema.sql to Supabase SQL Editor')
  console.log('2. Use Supabase CLI: supabase db push')
  console.log('3. Use the Supabase Dashboard SQL Editor\n')
  
  await setupDatabaseDirect()
} else if (error) {
  console.error('❌ Error connecting to Supabase:', error.message)
} else {
  console.log('✅ Waitlist table already exists. Schema may already be set up.')
}

process.exit(0)