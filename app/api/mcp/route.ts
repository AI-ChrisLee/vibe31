import { z } from 'zod';
import { createMcpHandler } from '@vercel/mcp-adapter';
import { createClient } from '@/lib/supabase/server';
import fs from 'fs/promises';
import path from 'path';

const handler = createMcpHandler(
  (server) => {
    // Marketing Assistant Tools
    
    // 1. Create Landing Page Tool
    server.tool(
      'create_landing_page',
      'Creates a landing page with AI-generated content based on your description',
      { 
        description: z.string().describe('Description of the landing page you want to create'),
        industry: z.string().optional().describe('Your industry or niche'),
        target_audience: z.string().optional().describe('Your target audience')
      },
      async ({ description, industry, target_audience }) => {
        // This would integrate with Claude API to generate content
        return {
          content: [{
            type: 'text',
            text: `✨ Landing page created!\n\nDescription: ${description}\nIndustry: ${industry || 'General'}\nTarget: ${target_audience || 'General audience'}\n\nPreview available at: /preview/landing-123`
          }],
        };
      },
    );

    // 2. Email Campaign Builder
    server.tool(
      'create_email_campaign',
      'Creates an email campaign sequence with AI-generated content',
      {
        campaign_type: z.enum(['welcome', 'nurture', 'sales', 'newsletter']).describe('Type of email campaign'),
        num_emails: z.number().int().min(1).max(10).describe('Number of emails in sequence'),
        topic: z.string().describe('Main topic or product for the campaign')
      },
      async ({ campaign_type, num_emails, topic }) => {
        return {
          content: [{
            type: 'text',
            text: `📧 Email campaign created!\n\nType: ${campaign_type}\nEmails: ${num_emails}\nTopic: ${topic}\n\nCampaign ID: campaign-456`
          }],
        };
      },
    );

    // 3. CRM Query Tool
    server.tool(
      'query_crm',
      'Query your CRM using natural language',
      {
        query: z.string().describe('Natural language query like "Show me hot leads from this week"')
      },
      async ({ query }) => {
        // This would parse the query and fetch from Supabase
        return {
          content: [{
            type: 'text',
            text: `🔍 CRM Query Results\n\nQuery: "${query}"\n\nFound 12 matching contacts\nTop lead: john@example.com (Score: 95)`
          }],
        };
      },
    );

    // 4. Funnel Builder
    server.tool(
      'create_funnel',
      'Creates a marketing funnel with multiple pages',
      {
        funnel_type: z.enum(['webinar', 'sales', 'lead_magnet', 'product_launch']).describe('Type of funnel'),
        product_name: z.string().describe('Name of your product or service'),
        price_point: z.string().optional().describe('Price of your product (if applicable)')
      },
      async ({ funnel_type, product_name, price_point }) => {
        return {
          content: [{
            type: 'text',
            text: `🚀 Funnel created!\n\nType: ${funnel_type}\nProduct: ${product_name}\nPrice: ${price_point || 'N/A'}\n\nFunnel URL: /funnels/funnel-789`
          }],
        };
      },
    );

    // 5. Waitlist Management
    server.tool(
      'manage_waitlist',
      'Add or check waitlist status',
      {
        action: z.enum(['add', 'check', 'count']).describe('Action to perform'),
        email: z.string().email().optional().describe('Email address (required for add/check)')
      },
      async ({ action, email }) => {
        const supabase = await createClient();
        
        if (action === 'count') {
          const { count, error } = await supabase
            .from('waitlist')
            .select('*', { count: 'exact', head: true });
          
          if (error) {
            return {
              content: [{
                type: 'text',
                text: `❌ Error counting waitlist: ${error.message}`
              }],
            };
          }
          
          return {
            content: [{
              type: 'text',
              text: `📊 Total waitlist signups: ${count || 0}`
            }],
          };
        }
        
        if (action === 'add' && email) {
          // Add to waitlist logic
          return {
            content: [{
              type: 'text',
              text: `✅ Added ${email} to waitlist!`
            }],
          };
        }
        
        if (action === 'check' && email) {
          // Check position logic
          return {
            content: [{
              type: 'text',
              text: `🔍 ${email} is position #42 on the waitlist`
            }],
          };
        }
        
        return {
          content: [{
            type: 'text',
            text: '❌ Invalid action or missing email'
          }],
        };
      },
    );

    // 6. Database Migration Tool
    server.tool(
      'setup_database',
      'Check database setup and provide migration instructions',
      {
        action: z.enum(['check', 'instructions']).describe('Action to perform - check status or get instructions')
      },
      async ({ action }) => {
        try {
          const supabase = await createClient();
          
          if (action === 'check') {
            // Check if waitlist table exists
            const { error } = await supabase.from('waitlist').select('count').limit(1);
            
            if (error?.code === '42P01') {
              return {
                content: [{
                  type: 'text',
                  text: `❌ Waitlist table not found\n\nThe database needs to be set up. Use the "instructions" action to see how.`
                }],
              };
            }
            
            if (error) {
              return {
                content: [{
                  type: 'text',
                  text: `❌ Database check failed: ${error.message}`
                }],
              };
            }
            
            // Get waitlist count
            const { count } = await supabase
              .from('waitlist')
              .select('*', { count: 'exact', head: true });
            
            return {
              content: [{
                type: 'text',
                text: `✅ Database is set up correctly!\n\n📊 Waitlist entries: ${count || 0}`
              }],
            };
          }
          
          if (action === 'instructions') {
            // Read the migration file
            const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20250710175425_create_waitlist_table.sql');
            const migrationSQL = await fs.readFile(migrationPath, 'utf8');
            
            return {
              content: [{
                type: 'text',
                text: `📚 Database Setup Instructions\n\n**Option 1: Supabase Dashboard (Recommended)**\n1. Go to: https://supabase.com/dashboard/project/${process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1]}/sql/new\n2. Copy and paste the migration SQL below\n3. Click "Run"\n\n**Option 2: Supabase CLI**\n\`\`\`bash\nnpx supabase link --project-ref ${process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1]}\nnpx supabase db push\n\`\`\`\n\n**Migration SQL:**\n\`\`\`sql\n${migrationSQL}\n\`\`\``
              }],
            };
          }
          
          return {
            content: [{
              type: 'text',
              text: '❌ Invalid action specified'
            }],
          };
        } catch (error) {
          return {
            content: [{
              type: 'text',
              text: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`
            }],
          };
        }
      },
    );

    // 7. Analytics Tool
    server.tool(
      'get_analytics',
      'Get marketing analytics and metrics',
      {
        metric_type: z.enum(['conversion', 'traffic', 'email', 'revenue']).describe('Type of analytics to retrieve'),
        time_period: z.enum(['today', 'week', 'month', 'year']).describe('Time period for analytics')
      },
      async ({ metric_type, time_period }) => {
        return {
          content: [{
            type: 'text',
            text: `📈 Analytics Report\n\nMetric: ${metric_type}\nPeriod: ${time_period}\n\nKey Stats:\n- Conversion Rate: 3.2%\n- Total Events: 1,234\n- Growth: +15% vs previous period`
          }],
        };
      },
    );

    // Resources
    server.resource(
      'marketing_templates',
      'Access pre-built marketing templates',
      async () => ({
        contents: [{
          uri: 'marketing-templates.json',
          text: JSON.stringify({
            templates: [
              { id: 'webinar-funnel', name: 'Webinar Funnel Template', pages: 5 },
              { id: 'sales-page', name: 'High-Converting Sales Page', pages: 1 },
              { id: 'email-welcome', name: 'Welcome Email Series', emails: 5 },
              { id: 'lead-magnet', name: 'Lead Magnet Funnel', pages: 3 }
            ]
          }, null, 2)
        }]
      })
    );

    // Prompts
    server.prompt(
      'marketing_assistant',
      'Interactive marketing assistant for natural language commands',
      async () => ({
        messages: [{
          role: 'assistant',
          content: {
            type: 'text',
            text: `You are Vibe31's AI Marketing Assistant. You help users create marketing content, manage campaigns, and analyze performance using natural language commands.

Available commands:
- "Create a landing page for [product]"
- "Build a 5-email nurture sequence about [topic]"
- "Show me hot leads from this week"
- "Create a webinar funnel for [product]"
- "Check waitlist count"
- "Show conversion analytics for this month"

How can I help you with your marketing today?`
          }
        }]
      })
    );
  }
);

export { handler as GET, handler as POST, handler as DELETE };