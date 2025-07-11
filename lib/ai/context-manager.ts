import { supabase } from '@/lib/supabase'

export interface ClientContext {
  clientId: string
  name: string
  industry?: string
  branding?: any
  settings?: any
  history?: AICommandHistory[]
}

export interface AgencyContext {
  agencyId: string
  name: string
  plan: string
  clients: ClientContext[]
  activeClientId?: string
}

export interface AICommandHistory {
  commandId: string
  command: string
  commandType: string
  result?: string
  createdAt: string
}

export interface MultiClientContext {
  agency: AgencyContext
  activeClient?: ClientContext
  selectedClients?: ClientContext[]
  globalSettings?: Record<string, any>
}

export class ContextManager {
  private static instance: ContextManager
  private contextCache: Map<string, MultiClientContext> = new Map()
  private historyCache: Map<string, AICommandHistory[]> = new Map()

  private constructor() {}

  static getInstance(): ContextManager {
    if (!ContextManager.instance) {
      ContextManager.instance = new ContextManager()
    }
    return ContextManager.instance
  }

  // Build context for a specific agency
  async buildAgencyContext(agencyId: string): Promise<AgencyContext | null> {
    try {
      // Check cache first
      const cached = this.contextCache.get(agencyId)
      if (cached?.agency) {
        return cached.agency
      }

      // Fetch agency with clients
      const { data: agency, error } = await supabase
        .from('agencies')
        .select(`
          *,
          clients (
            id,
            name,
            industry,
            branding,
            settings
          )
        `)
        .eq('id', agencyId)
        .single()

      if (error || !agency) {
        console.error('Failed to fetch agency context:', error)
        return null
      }

      const agencyContext: AgencyContext = {
        agencyId: agency.id,
        name: agency.name,
        plan: agency.plan,
        clients: agency.clients.map((client: any) => ({
          clientId: client.id,
          name: client.name,
          industry: client.industry,
          branding: client.branding,
          settings: client.settings
        }))
      }

      // Update cache
      this.contextCache.set(agencyId, { agency: agencyContext })

      return agencyContext
    } catch (error) {
      console.error('Error building agency context:', error)
      return null
    }
  }

  // Build context for multi-client operations
  async buildMultiClientContext(
    agencyId: string,
    clientIds?: string[]
  ): Promise<MultiClientContext | null> {
    const agencyContext = await this.buildAgencyContext(agencyId)
    if (!agencyContext) return null

    const context: MultiClientContext = {
      agency: agencyContext
    }

    if (clientIds && clientIds.length > 0) {
      context.selectedClients = agencyContext.clients.filter(
        client => clientIds.includes(client.clientId)
      )

      // Load history for selected clients
      for (const client of context.selectedClients) {
        client.history = await this.getClientHistory(client.clientId)
      }
    }

    return context
  }

  // Get command history for a client
  async getClientHistory(
    clientId: string,
    limit: number = 10
  ): Promise<AICommandHistory[]> {
    // Check cache
    const cacheKey = `${clientId}:${limit}`
    const cached = this.historyCache.get(cacheKey)
    if (cached) return cached

    try {
      const { data, error } = await supabase
        .from('ai_commands')
        .select('id, command, command_type, result, created_at')
        .eq('client_id', clientId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Failed to fetch client history:', error)
        return []
      }

      const history: AICommandHistory[] = data.map(cmd => ({
        commandId: cmd.id,
        command: cmd.command,
        commandType: cmd.command_type,
        result: cmd.result,
        createdAt: cmd.created_at
      }))

      // Cache for 5 minutes
      this.historyCache.set(cacheKey, history)
      setTimeout(() => this.historyCache.delete(cacheKey), 5 * 60 * 1000)

      return history
    } catch (error) {
      console.error('Error fetching client history:', error)
      return []
    }
  }

  // Create a prompt context string for AI
  formatContextForAI(context: MultiClientContext): string {
    let prompt = `Agency Context:\n`
    prompt += `- Name: ${context.agency.name}\n`
    prompt += `- Plan: ${context.agency.plan}\n`
    prompt += `- Total Clients: ${context.agency.clients.length}\n\n`

    if (context.activeClient) {
      prompt += `Active Client:\n`
      prompt += `- Name: ${context.activeClient.name}\n`
      prompt += `- Industry: ${context.activeClient.industry || 'Not specified'}\n`
      
      if (context.activeClient.branding) {
        prompt += `- Brand Guidelines: ${JSON.stringify(context.activeClient.branding)}\n`
      }

      if (context.activeClient.history && context.activeClient.history.length > 0) {
        prompt += `\nRecent Commands:\n`
        context.activeClient.history.slice(0, 5).forEach(cmd => {
          prompt += `- ${cmd.command} (${cmd.commandType})\n`
        })
      }
      prompt += '\n'
    }

    if (context.selectedClients && context.selectedClients.length > 1) {
      prompt += `Selected Clients for Bulk Operation:\n`
      context.selectedClients.forEach(client => {
        prompt += `- ${client.name} (${client.industry || 'Unknown industry'})\n`
      })
      prompt += '\n'
    }

    return prompt
  }

  // Clear context cache
  clearCache(agencyId?: string) {
    if (agencyId) {
      this.contextCache.delete(agencyId)
      // Clear related history entries
      for (const key of this.historyCache.keys()) {
        if (key.includes(agencyId)) {
          this.historyCache.delete(key)
        }
      }
    } else {
      this.contextCache.clear()
      this.historyCache.clear()
    }
  }

  // Get similar commands across clients
  async getSimilarCommands(
    agencyId: string,
    commandType: string,
    limit: number = 5
  ): Promise<AICommandHistory[]> {
    try {
      const { data, error } = await supabase
        .from('ai_commands')
        .select('id, command, command_type, result, created_at, client_id')
        .eq('agency_id', agencyId)
        .eq('command_type', commandType)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Failed to fetch similar commands:', error)
        return []
      }

      return data.map(cmd => ({
        commandId: cmd.id,
        command: cmd.command,
        commandType: cmd.command_type,
        result: cmd.result,
        createdAt: cmd.created_at
      }))
    } catch (error) {
      console.error('Error fetching similar commands:', error)
      return []
    }
  }
}

// Export singleton instance
export const contextManager = ContextManager.getInstance()