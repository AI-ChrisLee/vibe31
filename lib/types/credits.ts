export type CommandType = 'simple' | 'content' | 'complex' | 'bulk'

export interface CreditCost {
  type: CommandType
  credits: number
  description: string
  examples: string[]
}

// Credit costs for different operation types
export const CREDIT_COSTS: Record<CommandType, CreditCost> = {
  simple: {
    type: 'simple',
    credits: 1,
    description: 'Basic operations and queries',
    examples: [
      'Add a contact',
      'Update client info',
      'Check campaign status',
      'View analytics'
    ]
  },
  content: {
    type: 'content',
    credits: 5,
    description: 'Content generation and creation',
    examples: [
      'Write landing page copy',
      'Create email sequence',
      'Generate blog post',
      'Design social media posts'
    ]
  },
  complex: {
    type: 'complex',
    credits: 10,
    description: 'Complex multi-step operations',
    examples: [
      'Build complete funnel',
      'Setup automation workflow',
      'Create A/B test variants',
      'Generate client reports'
    ]
  },
  bulk: {
    type: 'bulk',
    credits: 20,
    description: 'Bulk operations across multiple clients',
    examples: [
      'Update all client funnels',
      'Generate content for all clients',
      'Create campaigns for multiple clients',
      'Bulk import/export operations'
    ]
  }
}

export interface CreditTransaction {
  id: string
  agency_id: string
  user_id: string
  amount: number // positive for credits added, negative for credits used
  balance_after: number
  type: 'purchase' | 'usage' | 'refund' | 'bonus' | 'overage'
  description: string
  metadata?: {
    command_id?: string
    command_type?: CommandType
    client_id?: string
    stripe_payment_intent?: string
    stripe_invoice_id?: string
  }
  created_at: string
}

export interface CreditPlan {
  plan: 'freelancer' | 'agency' | 'scale' | 'enterprise'
  monthly_credits: number
  overage_rate: number // cost per credit when over limit
  features: string[]
}

export const CREDIT_PLANS: Record<string, CreditPlan> = {
  freelancer: {
    plan: 'freelancer',
    monthly_credits: 500,
    overage_rate: 0.40,
    features: [
      'Up to 5 clients',
      '2 team members',
      'Basic templates',
      'Email support'
    ]
  },
  agency: {
    plan: 'agency',
    monthly_credits: 2500,
    overage_rate: 0.30,
    features: [
      'Up to 25 clients',
      '10 team members',
      'All templates',
      'Priority support',
      'API access'
    ]
  },
  scale: {
    plan: 'scale',
    monthly_credits: 10000,
    overage_rate: 0.20,
    features: [
      'Up to 100 clients',
      'Unlimited team members',
      'Custom templates',
      'Dedicated support',
      'Custom integrations'
    ]
  },
  enterprise: {
    plan: 'enterprise',
    monthly_credits: -1, // unlimited
    overage_rate: 0,
    features: [
      'Unlimited clients',
      'Unlimited team members',
      'Custom everything',
      'SLA guarantee',
      'Dedicated success manager'
    ]
  }
}

export interface CreditUsageSummary {
  agency_id: string
  period_start: string
  period_end: string
  total_credits: number
  used_credits: number
  remaining_credits: number
  overage_credits: number
  usage_by_type: Record<CommandType, number>
  usage_by_user: Array<{
    user_id: string
    user_name: string
    credits_used: number
  }>
  usage_by_client: Array<{
    client_id: string
    client_name: string
    credits_used: number
  }>
  daily_usage: Array<{
    date: string
    credits: number
  }>
}

export interface CreditAlert {
  id: string
  agency_id: string
  type: 'low_credits' | 'overage' | 'unusual_usage'
  threshold: number
  message: string
  triggered_at: string
  acknowledged: boolean
  acknowledged_by?: string
  acknowledged_at?: string
}

// Helper functions for credit calculations
export function calculateOverageCost(
  overageCredits: number, 
  plan: CreditPlan
): number {
  return overageCredits * plan.overage_rate
}

export function getCreditsForCommand(commandType: CommandType): number {
  return CREDIT_COSTS[commandType].credits
}

export function canAffordCommand(
  availableCredits: number, 
  commandType: CommandType
): boolean {
  return availableCredits >= getCreditsForCommand(commandType)
}

export function estimateMonthlyUsage(
  dailyAverage: number,
  daysRemaining: number
): number {
  return Math.ceil(dailyAverage * daysRemaining)
}

export function getCreditWarningThreshold(totalCredits: number): number {
  // Warn when 80% of credits are used
  return Math.floor(totalCredits * 0.8)
}

export function getCreditDangerThreshold(totalCredits: number): number {
  // Critical when 95% of credits are used
  return Math.floor(totalCredits * 0.95)
}