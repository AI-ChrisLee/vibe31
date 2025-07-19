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

export default function VideoLandingPage() {
  return (
    <div className="w-full">
      {/* Video Section */}
      <section className="bg-primary py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-8 text-center text-3xl font-black text-primary-foreground sm:text-4xl">
              Copy and Paste $1M MRR Funnel I Rebuilt in 4 Hours using Vibe Coding
            </h1>
            <div className="aspect-video overflow-hidden rounded-lg bg-black">
              <iframe
                className="h-full w-full"
                src="https://www.youtube.com/embed/id_86dBViAk"
                title="Full video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      <HeroSection />
      <SocialProofSection />
      <ExpertiseSection />
      <ProblemSection />
      <JourneySection />
      <PricingSection />
      <FAQSection />
      <FinalCTASection />
      <Footer />
    </div>
  );
}