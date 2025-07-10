import { Check } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const plans = [
  {
    name: 'Starter',
    price: '$49',
    credits: '1,000 credits',
    description: 'Perfect for solopreneurs and small teams',
    features: [
      'AI Marketing Assistant',
      'Basic funnel templates',
      'Up to 500 contacts',
      'Email support',
      'Credits roll over',
    ],
  },
  {
    name: 'Growth',
    price: '$149',
    credits: '5,000 credits',
    description: 'Scale your marketing with advanced features',
    features: [
      'Everything in Starter',
      'Advanced AI commands',
      'Unlimited funnels',
      'Up to 10,000 contacts',
      'Priority support',
      'A/B testing',
    ],
    popular: true,
  },
  {
    name: 'Scale',
    price: '$449',
    credits: '20,000 credits',
    description: 'Enterprise-grade features for growing companies',
    features: [
      'Everything in Growth',
      'Custom AI training',
      'Unlimited contacts',
      'API access',
      'Dedicated support',
      'White-label options',
    ],
  },
]

export function PricingPreview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {plans.map((plan) => (
        <Card
          key={plan.name}
          className={cn(
            'relative',
            plan.popular && 'border-primary shadow-lg'
          )}
        >
          {plan.popular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                Most Popular
              </span>
            </div>
          )}
          
          <CardHeader>
            <CardTitle>{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">{plan.price}</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-sm text-primary font-medium mt-2">
              {plan.credits}
            </p>
          </CardHeader>
          
          <CardContent>
            <ul className="space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          
          <CardFooter>
            <Button
              className="w-full"
              variant={plan.popular ? 'default' : 'outline'}
              disabled
            >
              Coming Soon
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}