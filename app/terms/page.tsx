"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header with Go Back */}
      <header className="sticky top-0 bg-background/95 backdrop-blur-sm border-b z-50">
        <div className="container mx-auto px-4 max-w-4xl py-4">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 max-w-4xl py-16">
        <h1 className="text-4xl font-black mb-8">Terms of Use</h1>
        <p className="text-sm text-muted-foreground mb-12">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-black mb-4">The Deal</h2>
            <p className="text-muted-foreground">
              You pay $799 once. You get 31 days of transformation. You learn to ship $10K projects in 48 hours. 
              No lawyers needed to understand this.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4">Challenge Rules</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Show up to Thursday office hours</li>
              <li>• No refunds (if $799 hurts, you're not ready)</li>
              <li>• Complete the weekly builds</li>
              <li>• Share wins AND failures</li>
              <li>• Build first, optimize later</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4">What You Get</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• 4 Course Modules (Landing Pages, Funnels, Dashboards, AI)</li>
              <li>• Weekly Office Hours (Every Thursday 2 PM PST)</li>
              <li>• Private Discord Community</li>
              <li>• All project templates with source code</li>
              <li>• Lifetime access to recordings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4">What You Can't Do</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Resell or share your access</li>
              <li>• Spam the community</li>
              <li>• Ask for "quick calls" or meetings</li>
              <li>• Share content outside the community</li>
              <li>• Skip the weekly builds</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4">Content & Code</h2>
            <p className="text-muted-foreground mb-4">
              All course content belongs to Vibe31. All code templates are yours to use forever - 
              build whatever you want with them. Your client projects are yours. We claim no ownership.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4">No Guarantees</h2>
            <p className="text-muted-foreground mb-4">
              We don't promise you'll make money. We don't promise you'll quit your job. 
              We promise to show you exactly how we build and ship. Your results depend on 
              you actually doing the work.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4">After the Challenge</h2>
            <p className="text-muted-foreground mb-4">
              You keep lifetime access to all recordings and templates. 
              No upsells. No "advanced" program. This is everything.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4">Disputes</h2>
            <p className="text-muted-foreground mb-4">
              Got a problem? Email chris@vibe31.com. We'll sort it out like adults. 
              No lawyers, no drama. If we can't agree, you can cancel and move on.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4">The Bottom Line</h2>
            <p className="text-muted-foreground">
              This is a 31-day intensive for agency owners ready to 10X their speed. 
              Not a theory course. Not a mastermind. A build-and-ship bootcamp. 
              If that's you, welcome. If not, keep watching gurus.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t">
          <p className="text-sm text-muted-foreground text-center">
            Questions? Email chris@vibe31.com<br />
            Ready to transform? <Link href="/#pricing" className="underline hover:text-foreground">Join the Challenge</Link>
          </p>
        </div>
      </main>
    </div>
  );
}