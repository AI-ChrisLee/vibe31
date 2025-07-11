'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Loader2, CheckCircle, Mail } from 'lucide-react'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const waitlistSchema = z.object({
  email: z.string().email('Invalid email address'),
  interestedFeatures: z.array(z.string()).optional(),
  referralCode: z.string().optional(),
})

type WaitlistFormData = z.infer<typeof waitlistSchema>

interface WaitlistFormProps {
  size?: 'default' | 'large'
}

const features = [
  { id: 'ai-assistant', label: 'AI Marketing Assistant' },
  { id: 'funnel-builder', label: 'Natural Language Funnel Builder' },
  { id: 'crm', label: 'Smart CRM' },
  { id: 'email-marketing', label: 'AI Email Campaigns' },
]

export function WaitlistForm({ size = 'default' }: WaitlistFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [position, setPosition] = useState<number | null>(null)

  const form = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      email: '',
      interestedFeatures: [],
      referralCode: '',
    },
  })

  const onSubmit = async (data: WaitlistFormData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Something went wrong')
      }

      const result = await response.json()
      setPosition(result.position)
      setIsSuccess(true)
    } catch (error) {
      console.error('Waitlist signup error:', error)
      form.setError('root', {
        message: error instanceof Error ? error.message : 'Something went wrong',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const buttonSize = size === 'large' ? 'lg' : 'default'

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size={buttonSize} className="gap-2">
          <Mail className="h-4 w-4" />
          Join Waitlist
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        {!isSuccess ? (
          <>
            <DialogHeader>
              <DialogTitle>Join the Waitlist</DialogTitle>
              <DialogDescription>
                Be among the first to experience the future of AI-powered marketing.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <Label>I&apos;m interested in:</Label>
                  {features.map((feature) => (
                    <FormField
                      key={feature.id}
                      control={form.control}
                      name="interestedFeatures"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(feature.id)}
                              onCheckedChange={(checked) => {
                                const updatedValue = checked
                                  ? [...(field.value || []), feature.id]
                                  : field.value?.filter((v) => v !== feature.id) || []
                                field.onChange(updatedValue)
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-normal cursor-pointer">
                            {feature.label}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>

                <FormField
                  control={form.control}
                  name="referralCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Referral Code (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter referral code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.formState.errors.root && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.root.message}
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    'Join Waitlist'
                  )}
                </Button>
              </form>
            </Form>
          </>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
            <DialogTitle className="mb-2">You&apos;re on the list!</DialogTitle>
            <DialogDescription className="text-base">
              You&apos;re #{position} on our waitlist. We&apos;ll email you as soon as we launch.
            </DialogDescription>
            <Button
              variant="outline"
              className="mt-6"
              onClick={() => setIsOpen(false)}
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}