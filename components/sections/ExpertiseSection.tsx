"use client";

import { useState } from "react";
import Image from "next/image";

interface SocialLink {
  platform: "youtube" | "twitter" | "linkedin";
  url: string;
}

interface ExpertiseSectionProps {
  title?: string;
  description?: string;
  founderName?: string;
  founderTitle?: string;
  profileImage?: string;
  socialLinks?: SocialLink[];
  videoId?: string;
  videoTitle?: string;
}

const defaultSocialLinks: SocialLink[] = [
  { platform: "youtube", url: "https://www.youtube.com/@AIChrisLee" }
];

const socialIcons = {
  youtube: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  twitter: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  ),
  linkedin: (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  )
};

export function ExpertiseSection({
  title = "The Anti-Guru Truth",
  description = "Built a $600K agency in Korea. Hit $40K/month.\n40K YouTube subscribers by sharing EVERYTHING.\n\nBut while gurus film courses in Dubai,\nI'm in Vancouver at 5 AM actually building.\n\nThey show Lambos. I show shipped products.\nThey talk about scale. I actually do it.",
  founderName = "Chris Lee",
  founderTitle = "Founder, Vibe31",
  profileImage = "/Profile-Chris.png",
  socialLinks = defaultSocialLinks,
  videoId = "id_86dBViAk",
  videoTitle = "How I deliver $10K projects in 48 hours"
}: ExpertiseSectionProps) {
  const [showVideo, setShowVideo] = useState(false);

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 max-w-[950px]">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-black mb-6 md:mb-8 max-w-3xl mx-auto px-4">{title}</h2>
          <p className="text-base sm:text-lg mb-6 md:mb-8 text-muted-foreground font-medium whitespace-pre-line px-4">
            {description}
          </p>
          
          {/* Profile Badge */}
          <div className="mb-8">
            <div className="flex flex-col items-center gap-4">
              <div className="w-32 h-32 relative rounded-full overflow-hidden">
                <Image
                  src={profileImage}
                  alt={founderName}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-bold text-xl mb-1">{founderName}</p>
                <p className="text-muted-foreground mb-3">{founderTitle}</p>
                <div className="flex gap-3 justify-center">
                  {socialLinks.map((link) => (
                    <a 
                      key={link.platform}
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {socialIcons[link.platform]}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Video Section */}
          {videoId && (
            <div 
              className="relative aspect-video max-w-2xl mx-auto bg-black rounded-lg overflow-hidden cursor-pointer group" 
              onClick={() => setShowVideo(true)}
            >
              {!showVideo ? (
                <>
                  <Image
                    src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                    alt={videoTitle}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white rounded-full p-6 shadow-lg group-hover:scale-110 transition-transform">
                      <svg className="w-12 h-12 text-red-600 ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </>
              ) : (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                  title={videoTitle}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}