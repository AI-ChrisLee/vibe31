import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Coming Soon</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Login functionality will be available after launch.
          </p>
        </div>
        
        <div className="mt-8">
          <Link href="/">
            <Button variant="outline" className="w-full gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Homepage
            </Button>
          </Link>
        </div>
        
        <p className="text-center text-sm text-muted-foreground">
          Join our waitlist to be notified when we launch!
        </p>
      </div>
    </div>
  )
}