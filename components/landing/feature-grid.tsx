import { Bot, MousePointer, Users, Mail } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
  {
    title: 'AI Marketing Assistant',
    description: 'Chat with your personal AI to create content, analyze data, and get marketing insights instantly.',
    icon: Bot,
    highlights: [
      'Natural language commands',
      'Context-aware suggestions',
      'Real-time content generation',
    ],
  },
  {
    title: 'Natural Language Funnel Builder',
    description: 'Build complete sales funnels by describing what you want. Click to edit, or keep chatting.',
    icon: MousePointer,
    highlights: [
      'Dual-control interface',
      'Drag-and-drop editing',
      'One-click publishing',
    ],
  },
  {
    title: 'Smart CRM',
    description: 'Manage contacts with AI-powered insights. Ask questions about your data in plain English.',
    icon: Users,
    highlights: [
      'AI lead scoring',
      'Natural language queries',
      'Automated segmentation',
    ],
  },
  {
    title: 'AI Email Campaigns',
    description: 'Create, automate, and optimize email campaigns with AI. Write once, personalize for everyone.',
    icon: Mail,
    highlights: [
      'AI content generation',
      'Smart automation flows',
      'Predictive analytics',
    ],
  },
]

export function FeatureGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {features.map((feature) => (
        <Card key={feature.title} className="relative overflow-hidden">
          <CardHeader>
            <div className="flex items-start justify-between">
              <feature.icon className="h-8 w-8 text-primary" />
              <div className="h-20 w-20 bg-primary/10 rounded-full absolute -top-10 -right-10" />
            </div>
            <CardTitle className="mt-4">{feature.title}</CardTitle>
            <CardDescription className="text-base">
              {feature.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {feature.highlights.map((highlight) => (
                <li key={highlight} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                  {highlight}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}