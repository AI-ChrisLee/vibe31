'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, MousePointer, MessageSquare, Edit2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function InteractiveDemo() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Try me! Say "Create a landing page for a gym"' },
  ])
  const [input, setInput] = useState('')
  const [pageTitle, setPageTitle] = useState('Your Amazing Gym')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [buttonColor, setButtonColor] = useState('bg-primary')

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage = input.toLowerCase()
    setMessages([...messages, { role: 'user', content: input }])
    setInput('')

    // Simulate AI responses
    setTimeout(() => {
      if (userMessage.includes('landing page') && userMessage.includes('gym')) {
        setMessages((prev) => [
          ...prev,
          { 
            role: 'assistant', 
            content: '✨ Creating a gym landing page... You can click elements to edit them directly!' 
          },
        ])
        setPageTitle('FitLife Gym - Transform Your Body')
        setButtonColor('bg-red-600')
      } else if (userMessage.includes('blue')) {
        setButtonColor('bg-blue-600')
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: '✓ Changed button color to blue' },
        ])
      } else if (userMessage.includes('title')) {
        setIsEditingTitle(true)
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: '✓ Click the title to edit it' },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Try: "Make the button blue" or "Change the title"' },
        ])
      }
    }, 500)
  }

  return (
    <Card className="overflow-hidden">
      <div className="grid md:grid-cols-2 h-[600px]">
        {/* Chat Panel */}
        <div className="border-r bg-muted/20 flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">AI Assistant</h3>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-lg p-3 max-w-[90%]',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground ml-auto'
                    : 'bg-background border'
                )}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Try: Create a landing page for a gym"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <Button onClick={handleSend} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Interactive Preview Panel */}
        <div className="bg-background flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center gap-2">
              <MousePointer className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Live Interactive Preview</h3>
              <span className="text-xs text-muted-foreground ml-auto">
                Click elements to edit
              </span>
            </div>
          </div>
          
          <div className="flex-1 p-8 overflow-y-auto">
            {/* Mini Landing Page */}
            <div className="space-y-6">
              <div className="text-center space-y-4">
                {isEditingTitle ? (
                  <Input
                    value={pageTitle}
                    onChange={(e) => setPageTitle(e.target.value)}
                    onBlur={() => {
                      setIsEditingTitle(false)
                      setMessages((prev) => [
                        ...prev,
                        { role: 'assistant', content: `✓ Title updated to "${pageTitle}"` },
                      ])
                    }}
                    className="text-3xl font-bold text-center"
                    autoFocus
                  />
                ) : (
                  <h1
                    className="text-3xl font-bold cursor-pointer hover:bg-muted/50 rounded px-2 py-1 transition-colors group relative"
                    onClick={() => setIsEditingTitle(true)}
                  >
                    {pageTitle}
                    <Edit2 className="h-4 w-4 absolute -right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h1>
                )}
                
                <p className="text-muted-foreground">
                  Click any element to edit it directly
                </p>
                
                <Button
                  className={cn('transition-colors', buttonColor)}
                  onClick={() => {
                    const colors = ['bg-primary', 'bg-blue-600', 'bg-red-600', 'bg-green-600']
                    const currentIndex = colors.indexOf(buttonColor)
                    const nextColor = colors[(currentIndex + 1) % colors.length]
                    setButtonColor(nextColor)
                    setMessages((prev) => [
                      ...prev,
                      { role: 'assistant', content: `✓ Changed button color` },
                    ])
                  }}
                >
                  Join Now
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-8">
                {['Cardio Zone', 'Weight Training', 'Group Classes'].map((feature) => (
                  <div
                    key={feature}
                    className="text-center p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-12 w-12 bg-primary/20 rounded-full mx-auto mb-2" />
                    <p className="text-sm font-medium">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}