import { CREDIT_COSTS, CommandType } from '@/lib/types/credits'

export interface AICommand {
  id: string
  command: string
  commandType: CommandType
  agencyId: string
  clientId?: string
  userId: string
  context?: any
  metadata?: Record<string, any>
}

export interface AIResponse {
  success: boolean
  result?: string
  stream?: ReadableStream<Uint8Array>
  error?: string
  creditsUsed: number
  commandId: string
}

// System prompts for different command types
const SYSTEM_PROMPTS = {
  simple: `You are a helpful AI assistant for digital agencies. Keep responses concise and actionable.`,
  
  content: `You are an expert content creator for digital marketing agencies. Create engaging, conversion-focused content that follows best practices.`,
  
  complex: `You are a senior digital marketing strategist. Provide comprehensive solutions, strategies, and implementations for agency operations.`,
  
  bulk: `You are an AI operations specialist handling large-scale tasks across multiple clients. Be efficient and maintain consistency across all operations.`
}

// Parse and classify commands
export function parseCommand(input: string): {
  type: CommandType
  cleanCommand: string
  parameters: Record<string, any>
} {
  const lowerInput = input.toLowerCase()
  
  // Simple commands - quick operations
  if (
    lowerInput.includes('add') ||
    lowerInput.includes('update') ||
    lowerInput.includes('delete') ||
    lowerInput.includes('list') ||
    lowerInput.includes('check')
  ) {
    return { type: 'simple', cleanCommand: input, parameters: {} }
  }
  
  // Content generation
  if (
    lowerInput.includes('write') ||
    lowerInput.includes('create') ||
    lowerInput.includes('generate') ||
    lowerInput.includes('draft') ||
    lowerInput.includes('compose')
  ) {
    return { type: 'content', cleanCommand: input, parameters: {} }
  }
  
  // Bulk operations
  if (
    lowerInput.includes('all clients') ||
    lowerInput.includes('bulk') ||
    lowerInput.includes('batch') ||
    lowerInput.includes('multiple') ||
    lowerInput.includes('across')
  ) {
    return { type: 'bulk', cleanCommand: input, parameters: {} }
  }
  
  // Default to complex for strategic/analytical tasks
  return { type: 'complex', cleanCommand: input, parameters: {} }
}

// Build context for multi-client operations
export function buildContext(
  command: AICommand,
  clientData?: any,
  agencyData?: any
): string {
  let context = ''
  
  if (agencyData) {
    context += `Agency: ${agencyData.name}\n`
    context += `Plan: ${agencyData.plan}\n`
    context += `Total Clients: ${agencyData.clients?.length || 0}\n\n`
  }
  
  if (clientData) {
    context += `Client: ${clientData.name}\n`
    context += `Industry: ${clientData.industry || 'Not specified'}\n`
    if (clientData.branding) {
      context += `Brand Guidelines: ${JSON.stringify(clientData.branding)}\n`
    }
    context += '\n'
  }
  
  if (command.context) {
    context += `Additional Context:\n${JSON.stringify(command.context, null, 2)}\n\n`
  }
  
  return context
}

// Note: This function is only used server-side in the API route
// Client-side code should call the API endpoint instead


// Helper to check if model supports function calling
export function supportsTools(model: string): boolean {
  return model.includes('claude-3')
}

// Helper to estimate tokens (rough approximation)
export function estimateTokens(text: string): number {
  // Rough estimate: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4)
}