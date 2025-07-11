'use client'

import { useCredits } from '@/hooks/useCredits'
import { cn } from '@/lib/utils'

export function CreditDisplay({ className }: { className?: string }) {
  const { credits, creditStatus } = useCredits()

  if (!credits) {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="h-4 w-20 bg-gray-200 rounded"></div>
      </div>
    )
  }

  const statusColors = {
    good: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    overage: 'text-red-600'
  }

  const statusBgColors = {
    good: 'bg-green-100',
    warning: 'bg-yellow-100',
    danger: 'bg-red-100',
    overage: 'bg-red-100'
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn(
        "px-3 py-1 rounded-full text-sm font-medium",
        statusColors[creditStatus],
        statusBgColors[creditStatus]
      )}>
        {credits.remaining.toLocaleString()} credits
      </div>
      {creditStatus === 'overage' && (
        <span className="text-xs text-red-600">Overage charges apply</span>
      )}
    </div>
  )
}

export function CreditBar({ 
  className,
  showPercentage = true,
  showNumbers = true 
}: { 
  className?: string
  showPercentage?: boolean
  showNumbers?: boolean
}) {
  const { credits, creditStatus } = useCredits()

  if (!credits) {
    return (
      <div className={cn("space-y-2", className)}>
        <div className="animate-pulse">
          <div className="h-2 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    )
  }

  const progressColors = {
    good: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    overage: 'bg-red-600'
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-sm">
        {showNumbers && (
          <>
            <span className="text-gray-600">
              {credits.used.toLocaleString()} used
            </span>
            <span className="font-medium">
              {credits.total.toLocaleString()} total
            </span>
          </>
        )}
      </div>
      <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full transition-all duration-300",
            progressColors[creditStatus]
          )}
          style={{ 
            width: `${Math.min(100, credits.percentage)}%` 
          }}
        />
      </div>
      {showPercentage && (
        <div className="text-xs text-gray-500 text-right">
          {credits.percentage.toFixed(1)}% used
        </div>
      )}
    </div>
  )
}