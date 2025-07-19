"use client";


interface WeekInfo {
  week: string;
  dates: string;
  title: string;
  items: string[];
  value: string;
}

interface JourneySectionProps {
  tagline?: string;
  title?: string;
  subtitle?: string;
  weeks?: WeekInfo[];
  graduationInfo?: {
    date: string;
    items: string[];
  };
}

const defaultWeeks: WeekInfo[] = [
  {
    week: "1",
    dates: "Jul 31 - Aug 6",
    title: "Landing Pages",
    items: [
      "Thursday July 31: Office hours + Q&A",
      "Landing Page course drops after office hours",
      "Learn to build $5-10K pages in 48 hours"
    ],
    value: "$5-10K"
  },
  {
    week: "2",
    dates: "Aug 7-13",
    title: "Sales Funnels",
    items: [
      "Thursday Aug 7: Office hours + Landing Page review",
      "Sales Funnel course drops after office hours",
      "Master $15-20K funnel projects"
    ],
    value: "$15-20K"
  },
  {
    week: "3",
    dates: "Aug 14-20",
    title: "Client Dashboards",
    items: [
      "Thursday Aug 14: Office hours + Funnel review",
      "Dashboard course drops after office hours",
      "Create $15-25K analytics dashboards"
    ],
    value: "$15-25K"
  },
  {
    week: "4",
    dates: "Aug 21-27",
    title: "AI Solutions",
    items: [
      "Thursday Aug 21: Office hours + Dashboard review",
      "AI Integration course drops after office hours",
      "Build $10-30K AI solutions"
    ],
    value: "$10-30K"
  }
];

const defaultGraduation = {
  date: "August 28th",
  items: [
    "Final office hours",
    "Showcase your builds",
    "Your agency is now 10X faster"
  ]
};

export function JourneySection({
  tagline = "[THE VIBE BUILDING TRANSFORMATION]",
  title = "From overwhelmed to unstoppable in 4 weeks",
  subtitle = "Starts July 31st, 2025 • Every Thursday Office Hours • New modules weekly",
  weeks = defaultWeeks,
  graduationInfo = defaultGraduation
}: JourneySectionProps) {
  return (
    <section id="journey" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 max-w-[950px]">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-wider mb-4 text-muted-foreground">
            {tagline}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 max-w-3xl mx-auto px-4">
            {title}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-4">
            {subtitle}
          </p>
        </div>

        {/* Week Breakdown */}
        <div className="space-y-6">
          {weeks.map((week, index) => (
            <div key={index} className="bg-background border rounded-lg p-4 sm:p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4">
                <div>
                  <div className="text-xs sm:text-sm text-muted-foreground font-medium">{week.dates}</div>
                  <h3 className="text-xl sm:text-2xl font-black text-primary mt-1">{week.title}</h3>
                </div>
                <div className="bg-primary/10 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 inline-flex items-center gap-2 self-start">
                  <span className="text-xs sm:text-sm text-muted-foreground">Value:</span>
                  <span className="text-base sm:text-lg font-black text-primary">{week.value}</span>
                </div>
              </div>
              <ul className="space-y-2">
                {week.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          
          {/* Graduation Day */}
          <div className="bg-primary text-primary-foreground rounded-lg p-4 sm:p-6 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs sm:text-sm opacity-90">{graduationInfo.date}</div>
                <h3 className="text-xl sm:text-2xl font-black">Graduation Day 🎓</h3>
              </div>
            </div>
            <ul className="space-y-2">
              {graduationInfo.items.map((item, itemIndex) => (
                <li key={itemIndex} className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span className="opacity-90">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-lg text-muted-foreground">
            Thursday office hours at 2 PM PST. New course module drops right after.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Get all 4 project templates ready to use for your agency.
          </p>
        </div>
      </div>
    </section>
  );
}