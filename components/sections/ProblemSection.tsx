"use client";


interface Problem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface ProblemSectionProps {
  tagline?: string;
  title?: string;
  subtitle?: string;
  problems?: Problem[];
  background?: "dark" | "light";
}

const defaultProblems: Problem[] = [
  {
    icon: (
      <svg className="w-12 h-12 mx-auto text-gray-500" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "60+ hour weeks, endless revisions",
    description: "Making $10-50K/month but clients own your life. Every project drags on."
  },
  {
    icon: (
      <svg className="w-12 h-12 mx-auto text-gray-500" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: "Gurus sell dreams, not systems",
    description: "They teach theory from Dubai. You need someone who ships daily."
  },
  {
    icon: (
      <svg className="w-12 h-12 mx-auto text-gray-500" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Your competitors use AI, you don't",
    description: "While you resist, smart agencies deliver 10X faster with AI."
  }
];

export function ProblemSection({
  tagline = "[YOUR AGENCY REALITY]",
  title = "You follow Iman Gadzhi, Charlie Morgan, Tai Lopez...",
  subtitle = "But you're still taking 2 months per project. They promise millions. You're drowning in revisions.",
  problems = defaultProblems,
  background = "dark"
}: ProblemSectionProps) {
  const isDark = background === "dark";
  
  return (
    <section className={`py-20 ${isDark ? 'bg-black text-white' : 'bg-muted/30'}`}>
      <div className="container mx-auto px-4 max-w-[950px]">
        <div className="text-center mb-12">
          <p className={`text-sm uppercase tracking-wider mb-4 ${isDark ? 'text-gray-400' : 'text-muted-foreground'}`}>
            {tagline}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 md:mb-6 max-w-3xl mx-auto px-4">
            {title}
          </h2>
          <p className={`text-base sm:text-lg md:text-xl ${isDark ? 'text-gray-300' : 'text-muted-foreground'} max-w-3xl mx-auto px-4`}>
            {subtitle}
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
          {problems.map((problem, index) => (
            <div 
              key={index}
              className={`rounded-lg p-6 text-center ${
                isDark 
                  ? 'bg-zinc-900 border border-zinc-800' 
                  : 'bg-background border'
              }`}
            >
              <div className={`mb-4 ${isDark ? 'text-gray-500' : 'text-muted-foreground'}`}>
                {problem.icon}
              </div>
              <h3 className="font-bold text-base sm:text-lg mb-2 md:mb-3">{problem.title}</h3>
              <p className={`text-sm leading-relaxed ${
                isDark ? 'text-gray-400' : 'text-muted-foreground'
              }`}>
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}