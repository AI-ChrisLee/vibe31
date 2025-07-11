'use client'

import { useCreditUsage } from '@/hooks/useCredits'
import { CREDIT_COSTS } from '@/lib/types/credits'

interface CreditUsageChartProps {
  agencyId: string
  startDate?: Date
  endDate?: Date
}

export function CreditUsageChart({ 
  agencyId, 
  startDate, 
  endDate 
}: CreditUsageChartProps) {
  const { usage, isLoading, error } = useCreditUsage(agencyId, startDate, endDate)

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !usage) {
    return (
      <div className="text-center py-8 text-gray-500">
        Failed to load usage data
      </div>
    )
  }

  const maxDailyUsage = Math.max(...usage.daily_usage.map(d => d.credits))

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Total Used</div>
          <div className="text-2xl font-bold">{usage.used_credits.toLocaleString()}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Remaining</div>
          <div className="text-2xl font-bold text-green-600">
            {usage.remaining_credits.toLocaleString()}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Overage</div>
          <div className="text-2xl font-bold text-red-600">
            {usage.overage_credits.toLocaleString()}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">Daily Avg</div>
          <div className="text-2xl font-bold">
            {Math.round(usage.used_credits / usage.daily_usage.length)}
          </div>
        </div>
      </div>

      {/* Usage by Type */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="font-semibold mb-4">Usage by Command Type</h3>
        <div className="space-y-3">
          {Object.entries(usage.usage_by_type).map(([type, credits]) => {
            const percentage = usage.used_credits > 0 
              ? (credits / usage.used_credits) * 100 
              : 0
            const info = CREDIT_COSTS[type as keyof typeof CREDIT_COSTS]
            
            return (
              <div key={type} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium capitalize">{type}</span>
                  <span className="text-gray-600">
                    {credits} credits ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500">{info.description}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Daily Usage Chart */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="font-semibold mb-4">Daily Usage</h3>
        <div className="h-32 flex items-end justify-between gap-1">
          {usage.daily_usage.map((day) => {
            const height = maxDailyUsage > 0 
              ? (day.credits / maxDailyUsage) * 100 
              : 0
            
            return (
              <div 
                key={day.date}
                className="flex-1 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors relative group"
                style={{ height: `${height}%` }}
              >
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {day.credits} credits
                  <br />
                  {new Date(day.date).toLocaleDateString()}
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-2 text-xs text-gray-500 text-center">
          Last {usage.daily_usage.length} days
        </div>
      </div>

      {/* Top Users */}
      {usage.usage_by_user.length > 0 && (
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-semibold mb-4">Top Users</h3>
          <div className="space-y-2">
            {usage.usage_by_user.slice(0, 5).map((user) => (
              <div key={user.user_id} className="flex justify-between">
                <span className="text-sm">{user.user_name}</span>
                <span className="text-sm font-medium">
                  {user.credits_used.toLocaleString()} credits
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Clients */}
      {usage.usage_by_client.length > 0 && (
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-semibold mb-4">Top Clients</h3>
          <div className="space-y-2">
            {usage.usage_by_client.slice(0, 5).map((client) => (
              <div key={client.client_id} className="flex justify-between">
                <span className="text-sm">{client.client_name}</span>
                <span className="text-sm font-medium">
                  {client.credits_used.toLocaleString()} credits
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}