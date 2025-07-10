const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', SUPABASE_URL);
console.log('Project ID:', SUPABASE_URL?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]);

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  try {
    // Test if waitlist table exists
    const { data, error } = await supabase
      .from('waitlist')
      .select('count')
      .limit(1);
    
    if (error) {
      if (error.code === '42P01') {
        console.log('❌ Waitlist table does not exist yet');
        console.log('\nTo create the table, you need to:');
        console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard');
        console.log('2. Select your project (mxvdvarvgpzsaakrnkax)');
        console.log('3. Go to SQL Editor');
        console.log('4. Paste and run the migration from: supabase/migrations/20250710175425_create_waitlist_table.sql');
      } else {
        console.log('Error:', error);
      }
    } else {
      console.log('✅ Successfully connected to Supabase!');
      console.log('✅ Waitlist table exists');
    }
  } catch (err) {
    console.error('Connection failed:', err);
  }
}

testConnection();