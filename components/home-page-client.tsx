'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ArrowRight, Check } from 'lucide-react'
import { toast } from 'sonner'
import { Roadmap } from '@/components/landing/roadmap'
export function HomePageClient() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }

      toast.success(`You're #${data.position} on the waitlist!`)
      setEmail('')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to join waitlist')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        {/* Main Content */}
        <div className="max-w-4xl mx-auto text-center w-full">
          {/* Title with stagger animation */}
          <h1 
            className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 sm:mb-6 leading-tight text-black transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Your AI Marketing
            <br />
            Command Center
          </h1>

        {/* Roadmap Animation */}
        <div 
          className={`transition-all duration-700 delay-150 ${
            mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          <Roadmap />
        </div>

        {/* Subtitle */}
        <p 
          className={`text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-12 max-w-2xl mx-auto px-4 transition-all duration-700 delay-300 ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          Control everything through natural language.
        </p>

        {/* Email Form with better mobile optimization */}
        <form 
          onSubmit={handleSubmit} 
          className={`w-full max-w-md mx-auto transition-all duration-700 delay-[450ms] ${
            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <div className="flex flex-col gap-3">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 sm:h-14 px-4 sm:px-6 text-base sm:text-lg border-gray-200 focus:border-black transition-colors"
              required
            />
            <Button 
              type="submit" 
              size="lg"
              disabled={loading}
              className="w-full h-12 sm:h-14 px-6 bg-black hover:bg-gray-800 text-white font-medium text-base sm:text-lg transition-all"
            >
              {loading ? 'Joining...' : 'Get Early Access'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>

        {/* Trust Indicators */}
        <div 
          className={`mt-6 sm:mt-8 flex items-center justify-center text-xs sm:text-sm text-gray-500 transition-all duration-700 delay-[600ms] ${
            mounted ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="flex items-center gap-2">
            <Check className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>Launch July 24, 2025</span>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}