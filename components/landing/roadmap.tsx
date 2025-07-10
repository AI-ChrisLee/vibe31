'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { MousePointerClick, Mail, Users } from 'lucide-react'

const features = [
  { icon: MousePointerClick, label: 'Funnel', description: 'Build pages' },
  { icon: Mail, label: 'Email', description: 'Send campaigns' },
  { icon: Users, label: 'CRM', description: 'Manage leads' },
]

export function Roadmap() {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % features.length)
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full max-w-xl mx-auto my-8 sm:my-12 px-4">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute left-12 right-12 h-[1px] bg-gray-200 top-6" />
        <div 
          className="absolute left-12 h-[1px] bg-black top-6 transition-all duration-1000 ease-out"
          style={{ 
            width: `calc(${(activeIndex / (features.length - 1)) * 100}% * (100% - 96px) / 100%)` 
          }}
        />

        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <div 
              key={feature.label}
              className="relative flex flex-col items-center z-10"
            >
              {/* Icon Circle */}
              <div 
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 bg-white",
                  index <= activeIndex 
                    ? "border-2 border-black scale-110" 
                    : "border-2 border-gray-200"
                )}
              >
                <Icon 
                  className={cn(
                    "h-5 w-5 transition-all duration-500",
                    index <= activeIndex ? "text-black" : "text-gray-400"
                  )} 
                />
              </div>
              
              {/* Label */}
              <span 
                className={cn(
                  "mt-3 text-sm font-medium transition-all duration-500",
                  index <= activeIndex ? "text-black" : "text-gray-400"
                )}
              >
                {feature.label}
              </span>
              
              {/* Description */}
              <span 
                className={cn(
                  "text-xs transition-all duration-500",
                  index <= activeIndex ? "text-gray-600" : "text-gray-400"
                )}
              >
                {feature.description}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}