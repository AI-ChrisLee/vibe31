"use client";


interface PricingFeature {
  title: string;
  description: string;
}

interface PricingSectionProps {
  sectionTitle?: string;
  planName?: string;
  price?: number;
  period?: string;
  features?: PricingFeature[];
  buttonText?: string;
  buttonAction?: () => void;
  bottomNote?: string;
}

const defaultFeatures: PricingFeature[] = [
  {
    title: "4 Course Modules + Templates",
    description: "Landing pages, funnels, dashboards, AI tools. Get all templates with source code."
  },
  {
    title: "Weekly Office Hours",
    description: "Every Thursday: Q&A + preview next module. Course drops right after."
  },
  {
    title: "Private Discord Community",
    description: "Get help between sessions. Connect with agency owners implementing the system."
  },
  {
    title: "Lifetime Access",
    description: "All recordings, templates, and future updates. Watch at your own pace."
  }
];

export function PricingSection({
  sectionTitle = "The 31-Day Challenge That Changes Everything",
  planName = "Vibe Building Challenge",
  price = 799,
  period = "one-time (founding price)",
  features = defaultFeatures,
  buttonText = "Secure Your Spot",
  buttonAction,
  bottomNote = "Next price: $1,997 (September). Then $2,997.\nOne landing page profit = 13X your investment."
}: PricingSectionProps) {
  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 max-w-[950px]">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-black mb-8 md:mb-12 max-w-3xl mx-auto px-4">{sectionTitle}</h2>
          
          <div className="bg-background border-2 border-primary rounded-lg p-6 sm:p-8 md:p-12">
            <h3 className="text-xl sm:text-2xl font-black mb-4">{planName}</h3>
            <div className="text-5xl sm:text-6xl font-black mb-2">${price}</div>
            <p className="text-lg sm:text-xl text-muted-foreground mb-6 md:mb-8">{period}</p>
            
            <div className="text-left space-y-4 mb-8 max-w-md mx-auto">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <div>
                    <p className="font-semibold">{feature.title}</p>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={buttonAction}
              className="w-full md:w-auto px-8 sm:px-12 py-3 sm:py-4 bg-primary text-primary-foreground font-semibold text-base sm:text-lg rounded-md hover:bg-primary/90 transition-colors"
            >
              {buttonText}
            </button>
            
            {bottomNote && (
              <p className="mt-6 text-sm text-muted-foreground whitespace-pre-line">
                {bottomNote}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}