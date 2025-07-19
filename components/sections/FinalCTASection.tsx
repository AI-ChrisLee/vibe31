"use client";

import Link from "next/link";

interface FinalCTASectionProps {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonHref?: string;
  bottomText?: string;
}

export function FinalCTASection({
  title = "31 days from now, you're shipping $10K projects in 48 hours.",
  description = "4 weeks. 4 course modules. Weekly office hours.\nStop watching gurus. Start building like one.",
  buttonText = "Join the Challenge - $799",
  buttonHref = "#pricing",
  bottomText = "July 31st start. Thursdays at 2 PM PST.\nOnly 30 founding members. Price doubles in September."
}: FinalCTASectionProps) {
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 max-w-[950px] text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 md:mb-6 max-w-3xl mx-auto px-4">
          {title}
        </h2>
        <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 opacity-90 max-w-2xl mx-auto whitespace-pre-line px-4">
          {description}
        </p>
        <Link 
          href={buttonHref}
          className="inline-block bg-white text-primary px-6 sm:px-8 py-3 sm:py-4 rounded-md font-semibold text-base sm:text-lg hover:bg-white/90 transition-colors"
        >
          {buttonText}
        </Link>
        {bottomText && (
          <p className="mt-6 text-sm opacity-80 whitespace-pre-line">
            {bottomText}
          </p>
        )}
      </div>
    </section>
  );
}