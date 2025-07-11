'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Github, Mail, Chrome, Loader2 } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().optional(),
})

type LoginValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isGithubLoading, setIsGithubLoading] = useState(false)
  const [usePassword, setUsePassword] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: LoginValues) {
    setIsLoading(true)
    setMessage(null)

    try {
      if (usePassword && values.password) {
        const supabase = createClient()
        const { data, error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        })

        if (error) {
          setMessage({ type: 'error', text: error.message })
        } else if (data.user) {
          router.push('/dashboard')
        }
      } else {
        const supabase = createClient()
        const { error } = await supabase.auth.signInWithOtp({
          email: values.email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })

        if (error) {
          setMessage({ type: 'error', text: error.message })
        } else {
          setMessage({ 
            type: 'success', 
            text: 'Check your email for the magic link to sign in!' 
          })
          form.reset()
        }
      }
    } catch {
      setMessage({ 
        type: 'error', 
        text: 'Something went wrong. Please try again.' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleOAuthLogin(provider: 'google' | 'github') {
    const setLoading = provider === 'google' ? setIsGoogleLoading : setIsGithubLoading
    setLoading(true)
    setMessage(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setMessage({ type: 'error', text: error.message })
        setLoading(false)
      }
    } catch {
      setMessage({ 
        type: 'error', 
        text: 'Something went wrong. Please try again.' 
      })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <Card className="w-full max-w-md border-gray-200">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-black text-center text-black">Welcome back</CardTitle>
          <CardDescription className="text-center text-gray-600">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => handleOAuthLogin('google')}
              disabled={isGoogleLoading || isGithubLoading || isLoading}
              className="border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            >
              {isGoogleLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Chrome className="h-4 w-4" />
              )}
              <span className="ml-2">Google</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => handleOAuthLogin('github')}
              disabled={isGoogleLoading || isGithubLoading || isLoading}
              className="border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            >
              {isGithubLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Github className="h-4 w-4" />
              )}
              <span className="ml-2">GitHub</span>
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-600">
                Or continue with
              </span>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="name@example.com"
                        type="email"
                        disabled={isLoading || isGoogleLoading || isGithubLoading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {usePassword && (
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your password"
                          type="password"
                          disabled={isLoading || isGoogleLoading || isGithubLoading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <Button 
                type="submit" 
                className="w-full bg-black hover:bg-gray-800 text-white"
                disabled={isLoading || isGoogleLoading || isGithubLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {usePassword ? 'Signing in...' : 'Sending magic link...'}
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    {usePassword ? 'Sign in' : 'Sign in with Magic Link'}
                  </>
                )}
              </Button>
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setUsePassword(!usePassword)}
                  className="text-sm text-gray-600 hover:text-black"
                >
                  {usePassword ? 'Use magic link instead' : 'Sign in with password'}
                </Button>
              </div>
            </form>
          </Form>

          {message && (
            <div
              className={`text-sm text-center p-3 rounded-md ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-900 dark:bg-green-900/20 dark:text-green-400'
                  : 'bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-400'
              }`}
            >
              {message.text}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-black hover:underline font-medium">
              Sign up
            </Link>
          </div>
          <Link href="/" className="text-sm text-gray-600 hover:text-black">
            Back to homepage
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}