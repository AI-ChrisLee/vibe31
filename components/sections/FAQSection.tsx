"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  title?: string;
  questions?: FAQItem[];
}

const defaultQuestions: FAQItem[] = [
  {
    question: "How is this different from other agency courses?",
    answer: "They teach theory. I show real builds. They promise someday. I give you templates that work today. They have million-dollar launches. I have a system that actually delivers. This is implementation-focused, not just learning."
  },
  {
    question: "Do I need to be technical?",
    answer: "No. I use Cursor + Claude. If you can think logically and follow instructions, you can build $10K products. The AI does the heavy lifting. You do the strategic thinking."
  },
  {
    question: "What if I can't make all the live sessions?",
    answer: "Everything is recorded with lifetime access. Office hours are for Q&A and previewing next week's content. Course modules drop after each office hour. You can watch recordings if you miss the live session."
  },
  {
    question: "Can I really deliver projects in 48 hours?",
    answer: "Yes. Current students do it weekly. The key: systemized process + AI tools + proven templates. Week 1 you'll build your first 48-hour project. By week 4, it's second nature."
  },
  {
    question: "What exactly will I build?",
    answer: "Week 1: Landing pages ($5-10K value). Week 2: Sales funnels ($15-20K). Week 3: Client dashboards ($15-25K). Week 4: AI integrations ($10-30K). You get all 4 templates with source code, ready to customize for clients."
  },
  {
    question: "Is there ongoing support after?",
    answer: "You keep Discord access and all recordings forever. Most graduates don't need ongoing support - the system just works. But the community is there when you need it."
  },
  {
    question: "Why only $799?",
    answer: "Founding price for first 30. Your first project pays back 13X. September cohort is $1,997. October is $2,997. This is the lowest it will ever be."
  }
];

export function FAQSection({
  title = "Real Questions From Agency Owners",
  questions = defaultQuestions
}: FAQSectionProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 max-w-[950px]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-center mb-8 md:mb-12 max-w-3xl mx-auto px-4">{title}</h2>
          <div className="space-y-4">
            {questions.map((item, index) => (
              <div key={index} className="border rounded-lg bg-background overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full p-4 sm:p-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <h3 className="font-bold text-base sm:text-lg pr-2">{item.question}</h3>
                  <ChevronDown className={`w-5 h-5 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === index && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                    <p className="text-sm sm:text-base text-muted-foreground">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}