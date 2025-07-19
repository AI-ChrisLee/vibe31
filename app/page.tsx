"use client";

import { 
  HeroSection, 
  SocialProofSection,
  ExpertiseSection,
  ProblemSection,
  JourneySection,
  PricingSection, 
  FAQSection, 
  FinalCTASection, 
  Footer 
} from "@/components/sections";

export default function HomePage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <HeroSection />

      {/* Social Proof */}
      <SocialProofSection />

      {/* Expertise Section */}
      <ExpertiseSection />

      {/* Problem Section */}
      <ProblemSection />

      {/* Journey Section */}
      <JourneySection />

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