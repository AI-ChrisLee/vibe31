import Link from "next/link";

interface FooterProps {
  companyName?: string;
  founderName?: string;
  email?: string;
  socialLinks?: {
    youtube?: string;
    twitter?: string;
    linkedin?: string;
  };
  showLegalLinks?: boolean;
  tagline?: string;
}

export function Footer({
  companyName = "Vibe31",
  founderName = "Chris Lee",
  email = "chris@vibe31.com",
  socialLinks = {
    youtube: "https://www.youtube.com/@AIChrisLee"
  },
  showLegalLinks = true,
  tagline = "Ship in 48 hours or stay stuck."
}: FooterProps) {
  return (
    <footer className="py-12 bg-background border-t">
      <div className="container mx-auto px-4 max-w-[950px]">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="font-black text-xl mb-4">{companyName}</h3>
            <p className="text-muted-foreground mb-2">Built by {founderName}</p>
            <a href={`mailto:${email}`} className="text-muted-foreground hover:text-foreground transition-colors">
              {email}
            </a>
          </div>
          
          {/* Social Links */}
          <div className="md:text-right">
            <p className="font-semibold mb-4">Connect</p>
            <div className="flex gap-4 md:justify-end">
              {socialLinks.youtube && (
                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              )}
              {socialLinks.twitter && (
                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              )}
              {socialLinks.linkedin && (
                <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
        
        {/* Legal Links */}
        {showLegalLinks && (
          <div className="border-t pt-8 text-center">
            <div className="flex gap-6 justify-center text-sm">
              <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms of Use
              </Link>
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              © {new Date().getFullYear()} {companyName}. {tagline}
            </p>
          </div>
        )}
      </div>
    </footer>
  );
}