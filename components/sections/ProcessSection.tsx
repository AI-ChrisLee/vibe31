"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "../shared/AnimationWrapper";

interface ProcessPhase {
  number: string;
  title: string;
  heading: string;
  description: string;
  bullets: string[];
  visual?: React.ReactNode;
}

interface ProcessSectionProps {
  tagline?: string;
  title?: string;
  subtitle?: string;
  phases?: ProcessPhase[];
}

const defaultPhases: ProcessPhase[] = [
  {
    number: "PHASE 1: REVERSE ENGINEER",
    title: "Decode what makes products worth $10K+",
    heading: "Decode what makes products worth $10K+",
    description: "Break down winning products into actionable blueprints. No more guessing what clients want.",
    bullets: [
      "Identify core value propositions",
      "Map user flows that convert",
      "Create actionable PRDs"
    ],
    visual: (
      <div className="space-y-3">
        <div className="bg-white rounded p-3 shadow-sm">
          <p className="font-mono text-sm">🔍 Analyzing $10K product...</p>
        </div>
        <div className="bg-white rounded p-3 shadow-sm">
          <p className="font-mono text-sm">📋 Creating blueprint...</p>
        </div>
        <div className="bg-white rounded p-3 shadow-sm">
          <p className="font-mono text-sm">✅ Ready to build</p>
        </div>
      </div>
    )
  },
  {
    number: "PHASE 2: BUILD",
    title: "Ship in 48 hours using AI + modern tools",
    heading: "Ship in 48 hours using AI + modern tools",
    description: "Turn blueprints into live products. What took your team 2 months now takes 2 days.",
    bullets: [
      "Project setup that scales",
      "Frontend that converts",
      "Deploy to production"
    ],
    visual: (
      <div className="text-center">
        <div className="flex gap-4 justify-center mb-4">
          <div className="w-20 h-20 bg-primary/20 rounded flex items-center justify-center">
            <p className="font-bold text-sm">Month 1</p>
          </div>
          <div className="text-4xl font-black text-primary mx-4">→</div>
          <div className="w-20 h-20 bg-primary/40 rounded flex items-center justify-center">
            <p className="font-bold text-sm">Day 2</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">2 months → 48 hours</p>
      </div>
    )
  },
  {
    number: "PHASE 3: PRODUCTIZE",
    title: "Turn builds into agency assets",
    heading: "Turn builds into agency assets",
    description: "Package as templates. Sell to multiple clients. 90% margins, no team needed.",
    bullets: [
      "White-label ready templates",
      "Price for premium value",
      "Scale without hiring"
    ],
    visual: (
      <div className="text-center">
        <div className="text-5xl font-black text-primary mb-2">90%</div>
        <p className="text-sm text-muted-foreground">Profit margins</p>
      </div>
    )
  }
];

export function ProcessSection({
  tagline = "[THE VIBE BUILDING METHOD]",
  title = "From 2-month nightmares to 48-hour wins",
  subtitle = "REVERSE ENGINEER → BUILD → PRODUCTIZE",
  phases = defaultPhases
}: ProcessSectionProps) {
  return (
    <motion.section 
      id="process" 
      className="py-20"
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
      variants={fadeInUp}
    >
      <div className="container mx-auto px-4 max-w-[950px]">
        <div>
          <p className="text-sm uppercase tracking-wider text-center mb-4 text-muted-foreground">
            {tagline}
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-center mb-4">
            {title}
          </h2>
          <p className="text-xl text-center text-muted-foreground mb-16 max-w-3xl mx-auto">
            {subtitle}
          </p>
          
          <div className="space-y-24">
            {phases.map((phase, index) => (
              <div key={index} className="grid md:grid-cols-2 gap-12 items-center">
                {/* Alternate layout for even/odd phases */}
                {index % 2 === 0 ? (
                  <>
                    <div>
                      <p className="text-sm uppercase tracking-wider mb-4 text-muted-foreground">
                        {phase.number}
                      </p>
                      <h3 className="text-3xl font-black mb-4">{phase.heading}</h3>
                      <p className="text-lg text-muted-foreground mb-6">
                        {phase.description}
                      </p>
                      <ul className="space-y-3">
                        {phase.bullets.map((bullet, bulletIndex) => (
                          <li key={bulletIndex} className="flex items-start gap-3">
                            <span className="text-primary mt-1">✓</span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-black/5 rounded-lg p-8 flex items-center justify-center min-h-[300px]">
                      {phase.visual}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="order-2 md:order-1 bg-black/5 rounded-lg p-8 flex items-center justify-center min-h-[300px]">
                      {phase.visual}
                    </div>
                    <div className="order-1 md:order-2">
                      <p className="text-sm uppercase tracking-wider mb-4 text-muted-foreground">
                        {phase.number}
                      </p>
                      <h3 className="text-3xl font-black mb-4">{phase.heading}</h3>
                      <p className="text-lg text-muted-foreground mb-6">
                        {phase.description}
                      </p>
                      <ul className="space-y-3">
                        {phase.bullets.map((bullet, bulletIndex) => (
                          <li key={bulletIndex} className="flex items-start gap-3">
                            <span className="text-primary mt-1">✓</span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}