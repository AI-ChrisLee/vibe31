"use client";


interface Tool {
  name: string;
  icon: React.ReactNode;
}

interface SocialProofSectionProps {
  title?: string;
  tools?: Tool[];
}

const defaultTools: Tool[] = [
  {
    name: "Cursor",
    icon: (
      <svg className="w-6 h-6 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
    )
  },
  {
    name: "Claude",
    icon: (
      <svg className="w-6 h-6 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 12h8"/>
        <path d="M12 16v-8"/>
      </svg>
    )
  },
  {
    name: "Supabase",
    icon: (
      <svg className="w-6 h-6 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 7h16v10a2 2 0 01-2 2H6a2 2 0 01-2-2V7z"/>
        <path d="M9 5V3a2 2 0 012-2h2a2 2 0 012 2v2"/>
      </svg>
    )
  },
  {
    name: "Vercel",
    icon: (
      <svg className="w-6 h-6 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 19.5h20L12 2z"/>
      </svg>
    )
  },
  {
    name: "Stripe",
    icon: (
      <svg className="w-6 h-6 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="8" width="18" height="8" rx="2"/>
        <path d="M7 12h.01M12 12h4"/>
      </svg>
    )
  }
];

export function SocialProofSection({
  title = "MASTER THE TOOLS THAT MATTER",
  tools = defaultTools
}: SocialProofSectionProps) {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4 max-w-[950px]">
        <h3 className="text-center text-base sm:text-lg md:text-xl font-black mb-6 md:mb-8 text-muted-foreground">
          {title}
        </h3>
        <div className="flex flex-wrap justify-center items-center gap-x-6 sm:gap-x-8 md:gap-x-12 gap-y-4 md:gap-y-6">
          {tools.map((tool) => (
            <div key={tool.name} className="flex items-center gap-2">
              <div className="scale-75 sm:scale-100">{tool.icon}</div>
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-muted-foreground">{tool.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}