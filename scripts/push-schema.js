const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeMigration() {
  console.log('🚀 Starting database migration...\n');
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20250710175425_create_waitlist_table.sql');
    const migrationSQL = await fs.readFile(migrationPath, 'utf8');
    
    // Split SQL statements by semicolon and filter out empty statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute\n`);
    
    // Use direct PostgreSQL connection for DDL operations
    const { Client } = require('pg');
    
    // Extract project ref from URL
    const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
    if (!projectRef) {
      throw new Error('Could not extract project reference from Supabase URL');
    }
    
    const connectionString = `postgresql://postgres.${projectRef}:${SUPABASE_SERVICE_KEY}@aws-0-us-west-1.pooler.supabase.com:5432/postgres`;
    
    const client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });
    
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      const description = statement.split('\n')[0].replace('--', '').trim() || `Statement ${i + 1}`;
      
      try {
        console.log(`Executing: ${description}`);
        await client.query(statement);
        console.log(`✅ Success\n`);
      } catch (error) {
        if (error.code === '42P07') { // Duplicate table
          console.log(`⚠️  Table/Index already exists, skipping...\n`);
        } else if (error.code === '42710') { // Duplicate object
          console.log(`⚠️  Object already exists, skipping...\n`);
        } else {
          console.error(`❌ Failed: ${error.message}\n`);
          throw error;
        }
      }
    }
    
    await client.end();
    console.log('✅ Migration completed successfully!');
    console.log('\nYour waitlist table is now ready to use.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run the migration
if (require.main === module) {
  executeMigration();
}

module.exports = { executeMigration };