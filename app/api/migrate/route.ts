import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // Check for admin authorization
    const authHeader = request.headers.get('authorization');
    const adminToken = process.env.ADMIN_MIGRATION_TOKEN || 'your-secret-migration-token';
    
    if (authHeader !== `Bearer ${adminToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { action } = await request.json();
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    // For Supabase, we'll create the tables using the REST API approach
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    if (action === 'check') {
      // Check if waitlist table exists
      const { error } = await supabase.from('waitlist').select('count').limit(1);
      
      if (error?.code === '42P01') {
        return NextResponse.json({ exists: false, message: 'Waitlist table does not exist' });
      }
      
      return NextResponse.json({ exists: true, message: 'Waitlist table exists' });
    }
    
    if (action === 'create-waitlist') {
      // Since we can't execute raw SQL through the client, we'll use a workaround
      // by creating a database function that executes our migration
      
      // First, let's check if the table already exists
      const { error: checkError } = await supabase.from('waitlist').select('count').limit(1);
      
      if (!checkError || checkError.code !== '42P01') {
        return NextResponse.json({ 
          success: true, 
          message: 'Waitlist table already exists' 
        });
      }
      
      // If it doesn't exist, we need to create it via Supabase Dashboard
      return NextResponse.json({ 
        success: false, 
        message: 'Table creation requires Supabase Dashboard access',
        instructions: [
          '1. Go to your Supabase Dashboard',
          '2. Navigate to SQL Editor',
          '3. Copy and run the migration SQL from supabase/migrations/',
          '4. Or use the Supabase CLI: npx supabase db push'
        ]
      });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}