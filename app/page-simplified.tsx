"use client";

import { 
  HeroSection, 
  SocialProofSection,
  ExpertiseSection,
  ProblemSection,
  ProcessSection,
  PricingSection, 
  FAQSection, 
  FinalCTASection, 
  Footer 
} from "@/components/sections";

export default function HomePage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <HeroSection
        title="Master the Vibe Building Process to build any digital product in 31 days."
        subtitle="For smart, young solopreneurs who want to build without the fluff."
        primaryCTA={{
          text: "Join Vibe Coding - $97/month",
          href: "#pricing"
        }}
        secondaryCTA={{
          text: "See The Process",
          href: "#process"
        }}
        bottomText="Less than your Netflix + Spotify + Disney. But this actually makes you money."
      />

      {/* Social Proof */}
      <SocialProofSection />

      {/* Expertise Section */}
      <ExpertiseSection />

      {/* Problem Section */}
      <ProblemSection />

      {/* Process Section */}
      <ProcessSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Final CTA */}
      <FinalCTASection />

      {/* Footer */}
      <Footer />
    </div>
  );
}