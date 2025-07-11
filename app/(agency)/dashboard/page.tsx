'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/components/providers/AuthProvider'
import { 
  MessageSquare, 
  FileText, 
  Users, 
  ArrowRight,
  Briefcase,
  BarChart
} from 'lucide-react'
import Link from 'next/link'

export default function AgencyDashboardPage() {
  const { profile, agency, clients } = useAuth()

  const firstName = profile?.full_name?.split(' ')[0] || 'there'
  const creditPercentage = agency 
    ? ((agency.credits_total - agency.credits_used) / agency.credits_total) * 100 
    : 0

  const features = [
    {
      title: 'Client Management',
      description: 'Manage all your clients in one place',
      icon: Briefcase,
      href: '/dashboard/clients',
      count: clients?.length || 0,
      countLabel: 'Active Clients'
    },
    {
      title: 'Funnel Builder',
      description: 'Build high-converting funnels for clients',
      icon: FileText,
      href: '/dashboard/funnels',
    },
    {
      title: 'CRM',
      description: 'Track leads and conversions',
      icon: Users,
      href: '/dashboard/crm',
    },
    {
      title: 'Analytics',
      description: 'Monitor performance across all clients',
      icon: BarChart,
      href: '/dashboard/analytics',
    },
  ]

  const quickActions = [
    { label: 'Add new client', icon: Briefcase },
    { label: 'Create a funnel', icon: FileText },
    { label: 'Generate content', icon: MessageSquare },
    { label: 'View reports', icon: BarChart },
  ]

  return (
    <div className="p-8 space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-4xl font-black text-black">Welcome back, {firstName}!</h1>
        <p className="text-gray-600 mt-2 text-lg">
          Manage your {agency?.name || 'agency'} and all client projects from here.
        </p>
      </div>

      {/* Agency Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Credits Card */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-black">AI Credits</CardTitle>
            <CardDescription className="text-gray-600">
              Available for all operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-black">
                  {agency ? agency.credits_total - agency.credits_used : 0}
                </span>
                <span className="text-sm text-gray-500">
                  of {agency?.credits_total || 0}
                </span>
              </div>
              <Progress value={creditPercentage} className="h-2 bg-gray-100" />
            </div>
          </CardContent>
        </Card>

        {/* Active Clients Card */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-black">Active Clients</CardTitle>
            <CardDescription className="text-gray-600">
              Currently managing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-black">
                {clients?.length || 0}
              </span>
              <Link href="/dashboard/clients">
                <Button variant="link" size="sm" className="h-auto p-0 text-black hover:text-gray-700">
                  View all <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Plan Card */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-black">Current Plan</CardTitle>
            <CardDescription className="text-gray-600">
              Your subscription tier
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-black capitalize">
                {agency?.plan || 'Free'}
              </span>
              <Button variant="link" size="sm" className="h-auto p-0 text-black hover:text-gray-700">
                Upgrade <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Grid */}
      <div>
        <h2 className="text-2xl font-bold text-black mb-6">Manage Your Agency</h2>
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
                        {feature.count !== undefined && (
                          <p className="mt-2 text-sm font-medium text-black">
                            {feature.count} {feature.countLabel}
                          </p>
                        )}
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
        <p className="text-gray-600 mb-4">Ask the AI assistant to help with any of these tasks:</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.label}
                variant="outline"
                className="justify-start h-auto py-3 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-black"
                onClick={() => {
                  // This will trigger the AI chat to open with a suggestion
                  const event = new CustomEvent('ai-chat-suggestion', { 
                    detail: { suggestion: action.label } 
                  })
                  window.dispatchEvent(event)
                }}
              >
                <Icon className="h-4 w-4 mr-2" />
                {action.label}
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}