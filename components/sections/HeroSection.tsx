"use client";

import Link from "next/link";

export function HeroSection() {
  // Calendar data for July-August 2025
  const calendarDays = [
    // July days
    { date: 27, month: "Jul", inactive: true },
    { date: 28, month: "Jul", inactive: true },
    { date: 29, month: "Jul", inactive: true },
    { date: 30, month: "Jul", inactive: true },
    { date: 31, month: "Jul", highlight: true, label: "Start" },
    { date: 1, month: "Aug" },
    { date: 2, month: "Aug" },
    // Week 2
    { date: 3, month: "Aug" },
    { date: 4, month: "Aug" },
    { date: 5, month: "Aug" },
    { date: 6, month: "Aug" },
    { date: 7, month: "Aug", highlight: true },
    { date: 8, month: "Aug" },
    { date: 9, month: "Aug" },
    // Week 3
    { date: 10, month: "Aug" },
    { date: 11, month: "Aug" },
    { date: 12, month: "Aug" },
    { date: 13, month: "Aug" },
    { date: 14, month: "Aug", highlight: true },
    { date: 15, month: "Aug" },
    { date: 16, month: "Aug" },
    // Week 4
    { date: 17, month: "Aug" },
    { date: 18, month: "Aug" },
    { date: 19, month: "Aug" },
    { date: 20, month: "Aug" },
    { date: 21, month: "Aug", highlight: true },
    { date: 22, month: "Aug" },
    { date: 23, month: "Aug" },
    // Final week
    { date: 24, month: "Aug" },
    { date: 25, month: "Aug" },
    { date: 26, month: "Aug" },
    { date: 27, month: "Aug" },
    { date: 28, month: "Aug", highlight: true, label: "Grad" },
    { date: 29, month: "Aug" },
    { date: 30, month: "Aug" },
  ];

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Side - Text Content */}
          <div className="text-center lg:text-left space-y-6 lg:space-y-8">
            {/* Date */}
            <p className="text-sm text-muted-foreground tracking-wide uppercase">
              Starts July 31st 2PM PST, 2025
            </p>
            
            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="text-6xl sm:text-7xl lg:text-7xl xl:text-8xl font-black tracking-tight">
                Master Vibe Building
              </h1>
              <h1 className="text-6xl sm:text-7xl lg:text-7xl xl:text-8xl font-black tracking-tight">
                in 31 days.
              </h1>
            </div>
            
            {/* Description */}
            <p className="text-lg sm:text-xl text-muted-foreground">
              For agency owners making $10-50K/month who want to 10X their speed with AI.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 lg:justify-start justify-center pt-4">
              <Link
                href="#pricing"
                className="px-8 py-4 bg-primary text-primary-foreground font-semibold text-lg rounded-lg hover:bg-primary/90 transition-colors"
              >
                Join the Challenge
              </Link>
              <Link
                href="#journey"
                className="px-8 py-4 border-2 border-foreground font-semibold text-lg rounded-lg hover:bg-foreground hover:text-background transition-colors"
              >
                See What You&apos;ll Build
              </Link>
            </div>
          </div>

          {/* Right Side - Calendar */}
          <div className="w-full max-w-lg mx-auto lg:max-w-none">
            <div className="bg-card border rounded-xl p-4 sm:p-6 lg:p-8 shadow-xl">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-center mb-4 sm:mb-6">July - August 2025</h3>
              
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
                {/* Day Headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-xs sm:text-sm font-medium text-muted-foreground p-1 sm:p-2">
                    {day.slice(0, 3)}
                  </div>
                ))}
                
                {/* Calendar Days */}
                {calendarDays.map((day, index) => (
                  <div
                    key={index}
                    className={`
                      relative rounded-lg transition-all min-h-[30px] sm:min-h-[40px] flex flex-col items-center justify-center p-1
                      ${day.inactive ? 'text-muted-foreground/30' : ''}
                      ${day.highlight ? 'bg-primary text-white font-bold' : 'hover:bg-muted'}
                    `}
                  >
                    <span className="text-xs sm:text-sm">{day.date}</span>
                    {day.label && (
                      <span className="text-[9px] sm:text-[10px] mt-0.5">
                        {day.label}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Legend */}
              <div className="mt-6 flex items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded"></div>
                  <span className="text-muted-foreground">Thursday Sessions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}