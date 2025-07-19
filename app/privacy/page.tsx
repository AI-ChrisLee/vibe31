"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
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
        <h1 className="text-4xl font-black mb-8">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-12">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-black mb-4">We Don&apos;t Spy</h2>
            <p className="text-muted-foreground">
              We collect what we need to run the challenge. Nothing more. 
              No creepy tracking. No selling your data. No BS.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4">What We Collect</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Email (to send you stuff)</li>
              <li>• Name (to know who you are)</li>
              <li>• Payment info (processed by Stripe, we don&apos;t see your card)</li>
              <li>• Your weekly builds (to track progress)</li>
              <li>• Discord posts (what you share)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4">What We Don&apos;t Collect</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Your browsing history</li>
              <li>• Your location (we don&apos;t care where you work from)</li>
              <li>• Third-party tracking cookies</li>
              <li>• Anything we don&apos;t need</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4">How We Use Your Data</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Send you course modules and office hour links</li>
              <li>• Process your one-time payment</li>
              <li>• Share wins in the community (with your permission)</li>
              <li>• Track challenge completion</li>
              <li>• Improve future cohorts</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4">Your Content</h2>
            <p className="text-muted-foreground mb-4">
              What you build is yours. What you share in Discord stays in Discord. 
              We might showcase challenge wins (with permission). Your client projects are 100% yours.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4">Cookies</h2>
            <p className="text-muted-foreground mb-4">
              We use basic cookies to keep you logged in. No tracking cookies. 
              No retargeting pixels. No following you around the internet.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4">Third Parties</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• <strong>Stripe:</strong> Handles payments (they&apos;re legit)</li>
              <li>• <strong>Email provider:</strong> Sends course modules</li>
              <li>• <strong>Hosting:</strong> Keeps the site running</li>
              <li>That&apos;s it. No data brokers. No advertisers.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4">Your Rights</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• See what data we have (just ask)</li>
              <li>• Delete your data (just ask)</li>
              <li>• Export your data (we&apos;ll send it)</li>
              <li>• Tell us to stop emailing (unsubscribe link in every email)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4">Security</h2>
            <p className="text-muted-foreground mb-4">
              We use industry-standard security. HTTPS everywhere. Secure passwords. 
              Regular updates. We protect your data like we protect our code.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4">Changes</h2>
            <p className="text-muted-foreground mb-4">
              If we change this policy, we&apos;ll tell you. No sneaky updates. 
              No burying changes in legal speak. Clear communication only.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-black mb-4">Questions?</h2>
            <p className="text-muted-foreground">
              Email chris@vibe31.com. No contact forms. No tickets. 
              Just email me directly and I&apos;ll answer.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t">
          <p className="text-sm text-muted-foreground text-center">
            Privacy matters. So does shipping.<br />
            Ready to transform? <Link href="/#pricing" className="underline hover:text-foreground">Join the Challenge</Link>
          </p>
        </div>
      </main>
    </div>
  );
}