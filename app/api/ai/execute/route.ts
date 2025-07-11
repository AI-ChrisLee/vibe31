import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getUserRole } from '@/lib/supabase-helpers'
import { parseCommand } from '@/lib/ai/claude-service'
import { canAffordCommand, CREDIT_COSTS } from '@/lib/types/credits'
import { contextManager } from '@/lib/ai/context-manager'
import Anthropic from '@anthropic-ai/sdk'

// Initialize Anthropic client on the server side only
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// System prompts for different command types
const SYSTEM_PROMPTS = {
  simple: `You are a helpful AI assistant for digital agencies. Keep responses concise and actionable.`,
  content: `You are an expert content creator for digital marketing agencies. Create engaging, conversion-focused content that follows best practices.`,
  complex: `You are a senior digital marketing strategist. Provide comprehensive solutions, strategies, and implementations for agency operations.`,
  bulk: `You are an AI operations specialist handling large-scale tasks across multiple clients. Be efficient and maintain consistency across all operations.`
}

// Execute command with Claude
async function executeClaudeCommand(command: any, options: any) {
  try {
    const { type, cleanCommand } = parseCommand(command.command)
    const systemPrompt = SYSTEM_PROMPTS[type]
    
    // Build user message with context
    let userMessage = cleanCommand
    if (options.context?.formattedContext) {
      userMessage = `${options.context.formattedContext}\n\nCommand: ${cleanCommand}`
    }

    if (options.stream) {
      // Streaming response
      const stream = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        messages: [{ role: 'user', content: userMessage }],
        system: systemPrompt,
        max_tokens: 4096,
        temperature: 0.7,
        stream: true,
      })

      // Convert to web stream
      const encoder = new TextEncoder()
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of stream) {
              if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
                controller.enqueue(encoder.encode(chunk.delta.text))
              }
            }
            controller.close()
          } catch (error) {
            controller.error(error)
          }
        }
      })

      return {
        success: true,
        stream: readableStream,
        creditsUsed: CREDIT_COSTS[type].credits,
        commandId: command.id
      }
    } else {
      // Regular response
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        messages: [{ role: 'user', content: userMessage }],
        system: systemPrompt,
        max_tokens: 4096,
        temperature: 0.7,
      })

      return {
        success: true,
        result: response.content[0].type === 'text' ? response.content[0].text : '',
        creditsUsed: CREDIT_COSTS[type].credits,
        commandId: command.id
      }
    }
  } catch (error) {
    console.error('Claude API error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      creditsUsed: 0,
      commandId: command.id
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { 
      command,
      agencyId,
      clientId,
      stream = false,
      context = {}
    }: {
      command: string
      agencyId: string
      clientId?: string
      stream?: boolean
      context?: any
    } = await request.json()

    // Validate input
    if (!command || !agencyId) {
      return NextResponse.json({ 
        error: 'Command and agency ID are required' 
      }, { status: 400 })
    }

    // Check user permissions
    const userRole = await getUserRole(user.id, agencyId)
    if (!userRole) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse command to determine type
    const { type: commandType } = parseCommand(command)

    // Get agency details and check credits
    const { data: agency, error: agencyError } = await supabase
      .from('agencies')
      .select('*, clients(*)')
      .eq('id', agencyId)
      .single()

    if (agencyError || !agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 })
    }

    // Check if agency can afford the command
    const remainingCredits = agency.credits_total - agency.credits_used
    if (!canAffordCommand(remainingCredits, commandType) && agency.plan !== 'enterprise') {
      const creditCost = commandType === 'simple' ? 1 : 
                          commandType === 'content' ? 5 : 
                          commandType === 'complex' ? 10 : 20
      return NextResponse.json({ 
        error: 'Insufficient credits',
        required: creditCost,
        remaining: remainingCredits
      }, { status: 402 })
    }

    // Build context using context manager
    const multiContext = await contextManager.buildMultiClientContext(
      agencyId,
      clientId ? [clientId] : undefined
    )

    if (!multiContext) {
      return NextResponse.json({ 
        error: 'Failed to build context' 
      }, { status: 500 })
    }

    // Get client data if specified
    let clientData = null
    if (clientId) {
      clientData = multiContext.agency.clients.find(c => c.clientId === clientId)
      if (!clientData) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 })
      }
    }

    // Create AI command record
    const { data: commandRecord, error: commandError } = await supabase
      .from('ai_commands')
      .insert({
        agency_id: agencyId,
        client_id: clientId,
        user_id: user.id,
        command,
        command_type: commandType,
        status: 'pending',
        metadata: { context }
      })
      .select()
      .single()

    if (commandError || !commandRecord) {
      return NextResponse.json({ 
        error: 'Failed to create command record' 
      }, { status: 500 })
    }

    // Execute command with rate limiting
    const aiCommand = {
      id: commandRecord.id,
      command,
      commandType,
      agencyId,
      clientId,
      userId: user.id,
      context,
      metadata: commandRecord.metadata
    }

    const options = {
      stream,
      clientData,
      agencyData: {
        id: agency.id,
        name: agency.name,
        plan: agency.plan,
        clients: agency.clients
      },
      // Add formatted context for AI
      context: {
        ...context,
        formattedContext: contextManager.formatContextForAI(multiContext)
      }
    }

    // Execute command with Claude API
    const response = await executeClaudeCommand(aiCommand, options)

    if (!response.success) {
      // Update command status to failed
      await supabase
        .from('ai_commands')
        .update({ 
          status: 'failed',
          error: response.error
        })
        .eq('id', commandRecord.id)

      return NextResponse.json({ 
        error: response.error || 'Command execution failed' 
      }, { status: 500 })
    }

    // Update command with success
    await supabase
      .from('ai_commands')
      .update({ 
        status: 'completed',
        result: response.result || 'Stream response',
        credits_used: response.creditsUsed,
        executed_at: new Date().toISOString()
      })
      .eq('id', commandRecord.id)

    // Handle streaming response
    if (stream && response.stream) {
      return new Response(response.stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    }

    // Return regular response
    return NextResponse.json({
      success: true,
      commandId: commandRecord.id,
      result: response.result,
      creditsUsed: response.creditsUsed,
      creditsRemaining: remainingCredits - response.creditsUsed
    })

  } catch (error) {
    console.error('AI execution error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// GET endpoint to check command status
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const commandId = searchParams.get('commandId')

    if (!commandId) {
      return NextResponse.json({ error: 'Command ID required' }, { status: 400 })
    }

    const { data: command, error } = await supabase
      .from('ai_commands')
      .select('*')
      .eq('id', commandId)
      .single()

    if (error || !command) {
      return NextResponse.json({ error: 'Command not found' }, { status: 404 })
    }

    // Verify user has access
    const userRole = await getUserRole(user.id, command.agency_id)
    if (!userRole) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(command)

  } catch (error) {
    console.error('Command status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}