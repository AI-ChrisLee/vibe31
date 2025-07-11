'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useCredits } from '@/lib/hooks/use-credits'
import { useAuth } from '@/components/auth/auth-provider'
import { 
  CreditCard, 
  TrendingUp, 
  Calendar,
  AlertCircle,
  Check,
  Zap
} from 'lucide-react'
import { format } from 'date-fns'

export default function CreditsPage() {
  useAuth()
  const { credits, loading } = useCredits()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading credits...</p>
        </div>
      </div>
    )
  }

  const creditPercentage = credits 
    ? (credits.available_credits / credits.total_credits) * 100 
    : 0

  const plans = [
    {
      name: 'Starter',
      price: 49,
      credits: 1000,
      features: [
        'AI Marketing Assistant',
        'Funnel Builder',
        'Basic CRM',
        'Email support',
      ],
    },
    {
      name: 'Growth',
      price: 149,
      credits: 5000,
      popular: true,
      features: [
        'Everything in Starter',
        'Advanced automations',
        'Priority support',
        'Custom domains',
        'A/B testing',
      ],
    },
    {
      name: 'Scale',
      price: 449,
      credits: 20000,
      features: [
        'Everything in Growth',
        'Dedicated account manager',
        'Custom integrations',
        'White-label options',
        'API access',
      ],
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-black">Credits & Billing</h1>
        <p className="text-gray-600 mt-2 text-lg">
          Manage your credits and subscription plan
        </p>
      </div>

      {/* Current Credits */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-black">Current Balance</CardTitle>
          <CardDescription className="text-gray-600">
            Your credit usage for this billing period
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <CreditCard className="h-4 w-4 mr-2" />
                Available Credits
              </div>
              <p className="text-3xl font-black text-black">{credits?.available_credits || 0}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <TrendingUp className="h-4 w-4 mr-2" />
                Used This Period
              </div>
              <p className="text-3xl font-black text-black">{credits?.used_credits || 0}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                Reset Date
              </div>
              <p className="text-lg font-medium text-black">
                {credits?.reset_date ? format(new Date(credits.reset_date), 'MMM d, yyyy') : '-'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Credit Usage</span>
              <span>{Math.round(100 - creditPercentage)}% remaining</span>
            </div>
            <Progress value={100 - creditPercentage} className="h-2 bg-gray-100" />
          </div>

          {creditPercentage > 80 && (
            <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                You&apos;ve used {Math.round(creditPercentage)}% of your credits. Consider upgrading your plan.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage History */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-black">Recent Usage</CardTitle>
          <CardDescription className="text-gray-600">
            Your credit consumption over the last 7 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Usage history will be displayed here once you start using credits.
          </p>
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <div>
        <h2 className="text-2xl font-bold text-black mb-6">Upgrade Your Plan</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.name} className={plan.popular ? 'border-black' : 'border-gray-200'}>
              {plan.popular && (
                <div className="px-6 py-2 bg-black text-white text-sm font-medium text-center">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl font-bold text-black">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-3xl font-black text-black">${plan.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <Badge variant="secondary" className="w-fit mt-2 bg-gray-100 text-black">
                  {plan.credits.toLocaleString()} credits/mo
                </Badge>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="h-4 w-4 text-black mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full mt-6 ${
                    plan.popular 
                      ? 'bg-black hover:bg-gray-800 text-white' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-black'
                  }`} 
                  variant={plan.popular ? 'default' : 'outline'}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Upgrade to {plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}