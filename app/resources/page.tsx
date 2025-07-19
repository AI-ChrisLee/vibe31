"use client";

import { 
  HeroSection, 
  SocialProofSection, 
  FAQSection, 
  FinalCTASection, 
  Footer 
} from "@/components/sections";

// Example data for resources page FAQs
const resourcesFAQ = [
  {
    question: "Are these resources really free?",
    answer: "Yes. All resources here are 100% free. No email required. No strings attached. Just download and build."
  },
  {
    question: "Can I use these in commercial projects?",
    answer: "Yes. Everything is MIT licensed. Build whatever you want. Sell it. Keep all the profits."
  },
  {
    question: "How often are new resources added?",
    answer: "Weekly. Every Friday we drop new templates, checklists, or code snippets from our builds."
  },
  {
    question: "Do I need to be a member to access these?",
    answer: "No. Resources are free for everyone. Members get the full course, community, and live builds."
  }
];

export default function ResourcesPage() {
  return (
    <div className="w-full">
      {/* Hero Section - Different content for resources */}
      <HeroSection
        title="Free Resources for Builders Who Ship"
        subtitle="Templates, checklists, and code from real projects. No email required."
        primaryCTA={{
          text: "Browse Resources",
          href: "#resources"
        }}
        secondaryCTA={{
          text: "Join Full Course",
          href: "/#pricing"
        }}
        bottomText="Everything MIT licensed. Build whatever you want."
        height="h-[50vh]"
      />

      {/* Resource Grid Section - Custom for this page */}
      <section className="py-20" id="resources">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-black text-center mb-12">Download & Ship</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="border rounded-lg p-6 hover:border-primary transition-colors">
              <h3 className="font-bold text-lg mb-2">SaaS Starter Template</h3>
              <p className="text-muted-foreground mb-4">Next.js + Supabase + Stripe. Ready to deploy.</p>
              <a href="#" className="text-primary hover:underline">Download →</a>
            </div>
            <div className="border rounded-lg p-6 hover:border-primary transition-colors">
              <h3 className="font-bold text-lg mb-2">MVP Checklist</h3>
              <p className="text-muted-foreground mb-4">31-point checklist for shipping your first product.</p>
              <a href="#" className="text-primary hover:underline">Download →</a>
            </div>
            <div className="border rounded-lg p-6 hover:border-primary transition-colors">
              <h3 className="font-bold text-lg mb-2">Pricing Calculator</h3>
              <p className="text-muted-foreground mb-4">Calculate margins and pricing for 90%+ profit.</p>
              <a href="#" className="text-primary hover:underline">Download →</a>
            </div>
            <div className="border rounded-lg p-6 hover:border-primary transition-colors">
              <h3 className="font-bold text-lg mb-2">Launch Email Templates</h3>
              <p className="text-muted-foreground mb-4">5 emails that actually convert. Tested on real launches.</p>
              <a href="#" className="text-primary hover:underline">Download →</a>
            </div>
            <div className="border rounded-lg p-6 hover:border-primary transition-colors">
              <h3 className="font-bold text-lg mb-2">API Boilerplate</h3>
              <p className="text-muted-foreground mb-4">Express + TypeScript setup for high-margin APIs.</p>
              <a href="#" className="text-primary hover:underline">Download →</a>
            </div>
            <div className="border rounded-lg p-6 hover:border-primary transition-colors">
              <h3 className="font-bold text-lg mb-2">Chrome Extension Kit</h3>
              <p className="text-muted-foreground mb-4">Manifest V3 template with monetization built-in.</p>
              <a href="#" className="text-primary hover:underline">Download →</a>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof - Same as main page */}
      <SocialProofSection 
        title="BUILT WITH THESE TOOLS"
      />

      {/* FAQ Section - Different questions for resources */}
      <FAQSection 
        title="Resources FAQ"
        questions={resourcesFAQ}
      />

      {/* Final CTA - Different message */}
      <FinalCTASection
        title="Ready for the full experience?"
        description="Free resources are great. But the real magic happens in the community.\nJoin builders shipping real products every week."
        buttonText="Join Vibe Building - $97/month"
        buttonHref="/#pricing"
        bottomText="Ship your first product in 30 days.\nGuaranteed."
      />

      {/* Footer - Same as main page */}
      <Footer />
    </div>
  );
}