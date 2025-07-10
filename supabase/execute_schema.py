#!/usr/bin/env python3
"""
Execute Supabase schema for Vibe31 project
"""

import os
import sys
import json
import psycopg2
from psycopg2 import sql
from datetime import datetime
from typing import List, Dict, Tuple

# Configuration
SUPABASE_URL = os.getenv('SUPABASE_URL', 'your-project-url')
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY', 'your-service-role-key')
DATABASE_URL = os.getenv('DATABASE_URL')

# If DATABASE_URL not provided, construct it from Supabase URL
if not DATABASE_URL:
    # Extract project ID from Supabase URL
    project_id = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '')
    DATABASE_URL = f"postgresql://postgres:{SUPABASE_SERVICE_KEY}@db.{project_id}.supabase.co:5432/postgres"

# SQL execution steps
EXECUTION_STEPS = [
    {
        'name': 'Enable UUID Extension',
        'sql': 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'
    },
    {
        'name': 'Create Waitlist Table',
        'sql': '''
            CREATE TABLE waitlist (
                id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
                position INTEGER NOT NULL,
                status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
                referral_code TEXT UNIQUE,
                interested_features TEXT[]
            );
        '''
    },
    {
        'name': 'Create Waitlist Indexes',
        'sql': '''
            CREATE INDEX idx_waitlist_email ON waitlist(email);
            CREATE INDEX idx_waitlist_created_at ON waitlist(created_at);
            CREATE INDEX idx_waitlist_status ON waitlist(status);
        '''
    },
    {
        'name': 'Create Auto-Position Function',
        'sql': '''
            CREATE OR REPLACE FUNCTION assign_waitlist_position()
            RETURNS TRIGGER AS $$
            BEGIN
                SELECT COALESCE(MAX(position), 0) + 1 INTO NEW.position FROM waitlist;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        '''
    },
    {
        'name': 'Create Position Trigger',
        'sql': '''
            CREATE TRIGGER waitlist_position_trigger
            BEFORE INSERT ON waitlist
            FOR EACH ROW
            EXECUTE FUNCTION assign_waitlist_position();
        '''
    },
    {
        'name': 'Create Profiles Table',
        'sql': '''
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
        '''
    },
    {
        'name': 'Create Credits Table',
        'sql': '''
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
        '''
    },
    {
        'name': 'Create Credits Index',
        'sql': 'CREATE INDEX idx_credits_user_id ON credits(user_id);'
    },
    {
        'name': 'Enable Row Level Security',
        'sql': '''
            ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
            ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
            ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
        '''
    },
    {
        'name': 'Create Waitlist Policies',
        'sql': '''
            CREATE POLICY "Anyone can join waitlist" ON waitlist
                FOR INSERT WITH CHECK (true);
            
            CREATE POLICY "Only admins can view waitlist" ON waitlist
                FOR SELECT USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');
        '''
    },
    {
        'name': 'Create Profile Policies',
        'sql': '''
            CREATE POLICY "Users can view own profile" ON profiles
                FOR SELECT USING (auth.uid() = id);
            
            CREATE POLICY "Users can update own profile" ON profiles
                FOR UPDATE USING (auth.uid() = id);
        '''
    },
    {
        'name': 'Create Credits Policies',
        'sql': '''
            CREATE POLICY "Users can view own credits" ON credits
                FOR SELECT USING (auth.uid() = user_id);
        '''
    },
    {
        'name': 'Create New User Handler Function',
        'sql': '''
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
        '''
    },
    {
        'name': 'Create User Creation Trigger',
        'sql': '''
            CREATE TRIGGER on_auth_user_created
                AFTER INSERT ON auth.users
                FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
        '''
    }
]

# Verification queries
VERIFICATION_QUERIES = {
    'Check tables': '''
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('waitlist', 'profiles', 'credits');
    ''',
    'Check indexes': '''
        SELECT indexname FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename IN ('waitlist', 'credits');
    ''',
    'Check RLS enabled': '''
        SELECT tablename, rowsecurity 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('waitlist', 'profiles', 'credits');
    ''',
    'Check policies': '''
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public';
    ''',
    'Check triggers': '''
        SELECT trigger_name, event_object_table 
        FROM information_schema.triggers 
        WHERE trigger_schema = 'public';
    '''
}


def execute_schema(connection_string: str = DATABASE_URL) -> List[Dict]:
    """Execute the schema and return results"""
    results = []
    conn = None
    cursor = None
    
    try:
        # Connect to database
        print(f"Connecting to database...")
        conn = psycopg2.connect(connection_string)
        conn.autocommit = True  # Important for DDL operations
        cursor = conn.cursor()
        print("✅ Connected to database\n")
        
        # Execute each step
        for step in EXECUTION_STEPS:
            try:
                print(f"Executing: {step['name']}")
                cursor.execute(step['sql'])
                print(f"✅ Success: {step['name']}\n")
                results.append({
                    'step': step['name'],
                    'status': 'success',
                    'message': 'Executed successfully',
                    'timestamp': datetime.now().isoformat()
                })
                
            except psycopg2.errors.DuplicateTable as e:
                print(f"⚠️  Table already exists: {step['name']}")
                print(f"   Continuing...\n")
                results.append({
                    'step': step['name'],
                    'status': 'skipped',
                    'message': 'Table already exists',
                    'timestamp': datetime.now().isoformat()
                })
                
            except Exception as e:
                print(f"❌ Failed: {step['name']}")
                print(f"   Error: {str(e)}\n")
                results.append({
                    'step': step['name'],
                    'status': 'failed',
                    'message': str(e),
                    'timestamp': datetime.now().isoformat()
                })
                # Stop on error
                break
        
        # Run verification queries
        print("\n=== Running Verification Queries ===")
        verification_results = {}
        
        for query_name, query in VERIFICATION_QUERIES.items():
            try:
                cursor.execute(query)
                rows = cursor.fetchall()
                print(f"\n{query_name}:")
                for row in rows:
                    print(f"  - {row}")
                verification_results[query_name] = rows
            except Exception as e:
                print(f"❌ Failed to run {query_name}: {str(e)}")
                verification_results[query_name] = f"Error: {str(e)}"
        
        # Summary
        print("\n=== Execution Summary ===")
        successful = len([r for r in results if r['status'] == 'success'])
        failed = len([r for r in results if r['status'] == 'failed'])
        skipped = len([r for r in results if r['status'] == 'skipped'])
        
        print(f"Total steps: {len(EXECUTION_STEPS)}")
        print(f"Successful: {successful}")
        print(f"Failed: {failed}")
        print(f"Skipped: {skipped}")
        
        if failed > 0:
            print("\n⚠️  Schema execution incomplete. Review the errors above.")
        else:
            print("\n✅ Schema executed successfully!")
        
        # Save results
        with open('schema-execution-results.json', 'w') as f:
            json.dump({
                'execution_results': results,
                'verification_results': {k: str(v) for k, v in verification_results.items()},
                'summary': {
                    'total': len(EXECUTION_STEPS),
                    'successful': successful,
                    'failed': failed,
                    'skipped': skipped
                }
            }, f, indent=2)
        
        return results
        
    except Exception as e:
        print(f"❌ Fatal error: {str(e)}")
        return [{
            'step': 'Connection',
            'status': 'failed',
            'message': str(e),
            'timestamp': datetime.now().isoformat()
        }]
        
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
            print("\n✅ Database connection closed")


def rollback_schema(connection_string: str = DATABASE_URL):
    """Rollback the schema changes"""
    rollback_sql = '''
        -- Drop triggers
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        DROP TRIGGER IF EXISTS waitlist_position_trigger ON waitlist;
        
        -- Drop functions
        DROP FUNCTION IF EXISTS public.handle_new_user();
        DROP FUNCTION IF EXISTS assign_waitlist_position();
        
        -- Drop tables (CASCADE will drop dependent objects)
        DROP TABLE IF EXISTS credits CASCADE;
        DROP TABLE IF EXISTS profiles CASCADE;
        DROP TABLE IF EXISTS waitlist CASCADE;
    '''
    
    try:
        conn = psycopg2.connect(connection_string)
        conn.autocommit = True
        cursor = conn.cursor()
        
        print("Rolling back schema...")
        cursor.execute(rollback_sql)
        print("✅ Schema rolled back successfully")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Rollback failed: {str(e)}")


if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser(description='Execute Supabase schema for Vibe31')
    parser.add_argument('--rollback', action='store_true', help='Rollback the schema instead of creating it')
    parser.add_argument('--connection-string', help='PostgreSQL connection string (overrides environment variables)')
    
    args = parser.parse_args()
    
    connection_string = args.connection_string or DATABASE_URL
    
    if 'your-project-url' in connection_string:
        print("❌ Error: Please set your Supabase credentials in environment variables:")
        print("   export SUPABASE_URL='your-actual-project-url'")
        print("   export SUPABASE_SERVICE_KEY='your-actual-service-key'")
        print("   Or provide a connection string with --connection-string")
        sys.exit(1)
    
    if args.rollback:
        rollback_schema(connection_string)
    else:
        results = execute_schema(connection_string)
        sys.exit(1 if any(r['status'] == 'failed' for r in results) else 0)