'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/components/auth/auth-provider'
import { useCredits } from '@/lib/hooks/use-credits'
import { 
  MessageSquare, 
  FileText, 
  Users, 
  Mail,
  TrendingUp,
  Zap,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user } = useAuth()
  const { credits } = useCredits()

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'there'
  const creditPercentage = credits 
    ? (credits.available_credits / credits.total_credits) * 100 
    : 0

  const features = [
    {
      title: 'AI Assistant',
      description: 'Create marketing content with natural language',
      icon: MessageSquare,
      href: '/dashboard/assistant',
    },
    {
      title: 'Funnel Builder',
      description: 'Build high-converting funnels in minutes',
      icon: FileText,
      href: '/dashboard/funnels',
    },
    {
      title: 'CRM',
      description: 'Manage leads and customers effortlessly',
      icon: Users,
      href: '/dashboard/crm',
    },
    {
      title: 'Email Marketing',
      description: 'Send campaigns that convert',
      icon: Mail,
      href: '/dashboard/email',
    },
  ]

  const quickActions = [
    { label: 'Create a landing page', icon: FileText },
    { label: 'Write email campaign', icon: Mail },
    { label: 'Build a sales funnel', icon: TrendingUp },
    { label: 'Generate ad copy', icon: Zap },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-4xl font-black text-black">Welcome back, {firstName}!</h1>
        <p className="text-gray-600 mt-2 text-lg">
          Here&apos;s what&apos;s happening with your marketing today.
        </p>
      </div>

      {/* Credits Overview */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-black">Credit Balance</CardTitle>
          <CardDescription className="text-gray-600">
            Your available credits for this billing period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-3xl font-black text-black">
                {credits?.available_credits || 0}
              </span>
              <span className="text-sm text-gray-500">
                of {credits?.total_credits || 0} total
              </span>
            </div>
            <Progress value={creditPercentage} className="h-2 bg-gray-100" />
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                {credits?.used_credits || 0} used
              </span>
              <Link href="/dashboard/credits">
                <Button variant="link" size="sm" className="h-auto p-0 text-black hover:text-gray-700">
                  Manage credits <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div>
        <h2 className="text-2xl font-bold text-black mb-6">Start Creating</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Link key={feature.href} href={feature.href}>
                <Card className="border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start space-x-4">
                      <div className="bg-gray-100 p-3 rounded-lg">
                        <Icon className="h-6 w-6 text-black" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-black">{feature.title}</CardTitle>
                        <CardDescription className="mt-1 text-gray-600">
                          {feature.description}
                        </CardDescription>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-black mb-6">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.label}
                variant="outline"
                className="justify-start h-auto py-3 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-black"
                asChild
              >
                <Link href="/dashboard/assistant">
                  <Icon className="h-4 w-4 mr-2" />
                  {action.label}
                </Link>
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}