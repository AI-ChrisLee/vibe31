import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json()
    const cookieStore = await cookies()
    
    // Create Supabase server client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )
    
    // Get user from session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401 })
    }

    // Get agency data
    const { data: profile } = await supabase
      .from('profiles')
      .select('agency_id')
      .eq('id', user.id)
      .single()

    if (!profile?.agency_id) {
      return new Response('No agency found', { status: 400 })
    }

    // Check credits
    const { data: agency } = await supabase
      .from('agencies')
      .select('credits_total, credits_used')
      .eq('id', profile.agency_id)
      .single()

    if (!agency || agency.credits_used >= agency.credits_total) {
      return new Response('Insufficient credits', { status: 402 })
    }

    // Create system prompt based on context
    const systemPrompt = `You are Vibe AI, an intelligent assistant for agencies managing multiple clients.
Current page: ${context.page}
Agency ID: ${context.agencyId}

You help with:
- Creating and managing client campaigns
- Building funnels and landing pages
- Managing leads and CRM
- Generating content and emails
- Analyzing performance metrics

Be concise, helpful, and action-oriented. When users ask to create or modify something, provide clear steps or offer to help directly.`

    // Stream response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await anthropic.messages.create({
            model: 'claude-3-sonnet-20240229',
            messages: [{ role: 'user', content: message }],
            system: systemPrompt,
            max_tokens: 1024,
            stream: true,
          })

          let totalTokens = 0
          let fullContent = ''

          for await (const chunk of response) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              const text = chunk.delta.text
              fullContent += text
              totalTokens += text.split(' ').length // Rough estimate
              
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`)
              )
            }
          }

          // Calculate credits used (simple: 1 credit per 100 tokens)
          const creditsUsed = Math.max(1, Math.ceil(totalTokens / 100))

          // Update credits
          await supabase
            .from('agencies')
            .update({ credits_used: agency.credits_used + creditsUsed })
            .eq('id', profile.agency_id)

          // Log command
          await supabase
            .from('ai_commands')
            .insert({
              agency_id: profile.agency_id,
              user_id: user.id,
              command: message,
              result: fullContent,
              credits_used: creditsUsed,
              command_type: 'chat',
            })

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ creditsUsed })}\n\n`)
          )
          
          controller.close()
        } catch (error) {
          console.error('Stream error:', error)
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}