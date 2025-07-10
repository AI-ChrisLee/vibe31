const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Configuration - Replace with your actual Supabase credentials
const SUPABASE_URL = process.env.SUPABASE_URL || 'your-project-url';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'your-service-role-key';

// Initialize Supabase client with service role key for admin access
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// SQL execution steps in order
const executionSteps = [
  {
    name: 'Enable UUID Extension',
    sql: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
  },
  {
    name: 'Create Waitlist Table',
    sql: `
      CREATE TABLE waitlist (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
        position INTEGER NOT NULL,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        referral_code TEXT UNIQUE,
        interested_features TEXT[]
      );
    `
  },
  {
    name: 'Create Waitlist Indexes',
    sql: `
      CREATE INDEX idx_waitlist_email ON waitlist(email);
      CREATE INDEX idx_waitlist_created_at ON waitlist(created_at);
      CREATE INDEX idx_waitlist_status ON waitlist(status);
    `
  },
  {
    name: 'Create Auto-Position Function',
    sql: `
      CREATE OR REPLACE FUNCTION assign_waitlist_position()
      RETURNS TRIGGER AS $$
      BEGIN
        SELECT COALESCE(MAX(position), 0) + 1 INTO NEW.position FROM waitlist;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `
  },
  {
    name: 'Create Position Trigger',
    sql: `
      CREATE TRIGGER waitlist_position_trigger
      BEFORE INSERT ON waitlist
      FOR EACH ROW
      EXECUTE FUNCTION assign_waitlist_position();
    `
  },
  {
    name: 'Create Profiles Table',
    sql: `
      CREATE TABLE profiles (
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
      );
    `
  },
  {
    name: 'Create Credits Table',
    sql: `
      CREATE TABLE credits (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        total_credits INTEGER DEFAULT 0,
        used_credits INTEGER DEFAULT 0,
        rollover_credits INTEGER DEFAULT 0,
        reset_date TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
      );
    `
  },
  {
    name: 'Create Credits Index',
    sql: `CREATE INDEX idx_credits_user_id ON credits(user_id);`
  },
  {
    name: 'Enable Row Level Security',
    sql: `
      ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
      ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
      ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
    `
  },
  {
    name: 'Create Waitlist Policies',
    sql: `
      CREATE POLICY "Anyone can join waitlist" ON waitlist
        FOR INSERT WITH CHECK (true);
      
      CREATE POLICY "Only admins can view waitlist" ON waitlist
        FOR SELECT USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');
    `
  },
  {
    name: 'Create Profile Policies',
    sql: `
      CREATE POLICY "Users can view own profile" ON profiles
        FOR SELECT USING (auth.uid() = id);
      
      CREATE POLICY "Users can update own profile" ON profiles
        FOR UPDATE USING (auth.uid() = id);
    `
  },
  {
    name: 'Create Credits Policies',
    sql: `
      CREATE POLICY "Users can view own credits" ON credits
        FOR SELECT USING (auth.uid() = user_id);
    `
  },
  {
    name: 'Create New User Handler Function',
    sql: `
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO public.profiles (id, email, full_name, avatar_url)
        VALUES (
          NEW.id,
          NEW.email,
          NEW.raw_user_meta_data->>'full_name',
          NEW.raw_user_meta_data->>'avatar_url'
        );
        
        -- Initialize credits for new user
        INSERT INTO public.credits (user_id, total_credits, reset_date)
        VALUES (
          NEW.id,
          10, -- Free tier starts with 10 credits
          DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month'
        );
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `
  },
  {
    name: 'Create User Creation Trigger',
    sql: `
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `
  }
];

async function executeSchema() {
  console.log('Starting schema execution...\n');
  
  const results = [];
  
  for (const step of executionSteps) {
    try {
      console.log(`Executing: ${step.name}`);
      
      // Execute SQL using Supabase's RPC function
      // Note: You'll need to create a database function that executes raw SQL
      // or use a direct PostgreSQL connection
      const { data, error } = await supabase.rpc('exec_sql', { 
        query: step.sql 
      });
      
      if (error) {
        throw error;
      }
      
      console.log(`✅ Success: ${step.name}\n`);
      results.push({
        step: step.name,
        status: 'success',
        message: 'Executed successfully'
      });
      
    } catch (error) {
      console.error(`❌ Failed: ${step.name}`);
      console.error(`Error: ${error.message}\n`);
      results.push({
        step: step.name,
        status: 'failed',
        message: error.message
      });
      
      // Stop execution on error
      break;
    }
  }
  
  // Summary
  console.log('\n=== Execution Summary ===');
  const successful = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'failed').length;
  
  console.log(`Total steps: ${executionSteps.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);
  
  if (failed > 0) {
    console.log('\n⚠️  Schema execution incomplete. Review the errors above.');
  } else {
    console.log('\n✅ Schema executed successfully!');
  }
  
  // Save results to file
  await fs.writeFile(
    path.join(__dirname, 'schema-execution-results.json'),
    JSON.stringify(results, null, 2)
  );
  
  return results;
}

// Alternative: Using direct PostgreSQL connection
async function executeSchemaWithPg() {
  const { Client } = require('pg');
  
  // PostgreSQL connection string
  const connectionString = process.env.DATABASE_URL || 
    `postgresql://postgres:${SUPABASE_SERVICE_KEY}@db.${SUPABASE_URL.replace('https://', '').replace('.supabase.co', '')}.supabase.co:5432/postgres`;
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('Connected to database\n');
    
    const results = [];
    
    for (const step of executionSteps) {
      try {
        console.log(`Executing: ${step.name}`);
        await client.query(step.sql);
        console.log(`✅ Success: ${step.name}\n`);
        results.push({
          step: step.name,
          status: 'success',
          message: 'Executed successfully'
        });
      } catch (error) {
        console.error(`❌ Failed: ${step.name}`);
        console.error(`Error: ${error.message}\n`);
        results.push({
          step: step.name,
          status: 'failed',
          message: error.message
        });
        
        // Continue with next step or stop based on error type
        if (error.code === '42P07') { // Duplicate table
          console.log('Table already exists, continuing...\n');
        } else {
          break;
        }
      }
    }
    
    return results;
    
  } catch (error) {
    console.error('Connection failed:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log('Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  // Use the PostgreSQL method as it's more reliable for DDL operations
  executeSchemaWithPg()
    .then(results => {
      console.log('\nExecution complete');
      process.exit(results.some(r => r.status === 'failed') ? 1 : 0);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { executeSchema, executeSchemaWithPg };