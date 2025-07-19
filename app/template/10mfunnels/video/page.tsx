export default function VideoLandingPage() {
  return (
    <div className="w-full">
      {/* Video Section */}
      <section className="bg-primary py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-8 text-center text-3xl font-black text-primary-foreground sm:text-4xl">
              Copy and Paste $1M MRR Funnel I Rebuilt in 4 Hours using Vibe Coding
            </h1>
            <div className="aspect-video overflow-hidden rounded-lg bg-black">
              <iframe
                className="h-full w-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="Full video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 text-4xl font-black sm:text-5xl">
              We help early-stage B2B startups look and feel like established players
            </h2>
            <p className="mx-auto max-w-2xl text-lg font-medium text-muted-foreground">
              Transform your startup&apos;s marketing presence with proven strategies that convert
            </p>
          </div>
        </div>
      </section>

      {/* Portfolio Showcase */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <h3 className="mb-12 text-center text-3xl font-black">Our Work</h3>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="overflow-hidden rounded-lg bg-background shadow-md">
                <div className="aspect-video bg-muted"></div>
                <div className="p-4">
                  <p className="font-semibold">Project {i}</p>
                  <p className="text-sm text-muted-foreground">SaaS • Landing Page</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h3 className="mb-8 text-center text-2xl font-black">Trusted by Industry Leaders</h3>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 w-32 rounded bg-muted"></div>
            ))}
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h3 className="mb-8 text-center text-3xl font-black">Hear directly from Riley.</h3>
            <p className="mb-8 text-center text-lg font-medium">
              We&apos;ve helped 50+ B2B software startups across fintech, edtech, and martech—from pre-seed to Series B. 
              Many of our customers have gone on to raise funding, land enterprise customers, or book more demos after 
              working with us.
            </p>
            <div className="mx-auto max-w-2xl">
              <div className="aspect-video overflow-hidden rounded-lg bg-muted"></div>
              <div className="mt-4 text-center">
                <p className="font-semibold">Riley Thompson</p>
                <p className="text-muted-foreground">Founder & CEO</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem/Pain Points */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h3 className="mb-8 text-center text-3xl font-black">[sound familiar?]</h3>
            <div className="space-y-4">
              <div className="rounded-lg border p-6">
                <p className="font-medium">
                  ❌ Your website looks like it was built in 2010 (even though you just launched)
                </p>
              </div>
              <div className="rounded-lg border p-6">
                <p className="font-medium">
                  ❌ Potential customers can&apos;t understand what you do in 5 seconds
                </p>
              </div>
              <div className="rounded-lg border p-6">
                <p className="font-medium">
                  ❌ You&apos;re losing deals to competitors with worse products but better marketing
                </p>
              </div>
              <div className="rounded-lg border p-6">
                <p className="font-medium">
                  ❌ Your conversion rates are embarrassingly low
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h3 className="mb-12 text-center text-3xl font-black">Our Proven Process</h3>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mb-4 text-5xl font-black text-primary">1</div>
                <h4 className="mb-2 text-xl font-black">Discovery</h4>
                <p className="text-muted-foreground">
                  We dive deep into your business, audience, and goals
                </p>
              </div>
              <div className="text-center">
                <div className="mb-4 text-5xl font-black text-primary">2</div>
                <h4 className="mb-2 text-xl font-black">Creation</h4>
                <p className="text-muted-foreground">
                  We design and build your high-converting funnel
                </p>
              </div>
              <div className="text-center">
                <div className="mb-4 text-5xl font-black text-primary">3</div>
                <h4 className="mb-2 text-xl font-black">Launch</h4>
                <p className="text-muted-foreground">
                  We deploy your funnel and optimize for results
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-5xl">
            <h3 className="mb-12 text-center text-3xl font-black">Simple, Transparent Pricing</h3>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-lg border p-8">
                <h4 className="mb-2 text-xl font-black">Starter</h4>
                <p className="mb-4 text-3xl font-black">$2,497</p>
                <p className="mb-6 text-muted-foreground">One-time payment</p>
                <ul className="mb-8 space-y-2 text-sm">
                  <li>✓ Landing page design</li>
                  <li>✓ Mobile responsive</li>
                  <li>✓ Basic SEO setup</li>
                  <li>✓ 7-day delivery</li>
                </ul>
                <button className="w-full rounded-md bg-primary py-3 font-semibold text-primary-foreground hover:bg-primary/90">
                  Get Started
                </button>
              </div>
              
              <div className="relative rounded-lg border-2 border-primary p-8">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-sm font-semibold text-primary-foreground">
                  POPULAR
                </div>
                <h4 className="mb-2 text-xl font-black">Professional</h4>
                <p className="mb-4 text-3xl font-black">$4,997</p>
                <p className="mb-6 text-muted-foreground">One-time payment</p>
                <ul className="mb-8 space-y-2 text-sm">
                  <li>✓ Complete funnel system</li>
                  <li>✓ Email automation</li>
                  <li>✓ A/B testing setup</li>
                  <li>✓ Analytics integration</li>
                  <li>✓ 14-day delivery</li>
                </ul>
                <button className="w-full rounded-md bg-primary py-3 font-semibold text-primary-foreground hover:bg-primary/90">
                  Get Started
                </button>
              </div>
              
              <div className="rounded-lg border p-8">
                <h4 className="mb-2 text-xl font-black">Enterprise</h4>
                <p className="mb-4 text-3xl font-black">Custom</p>
                <p className="mb-6 text-muted-foreground">Let&apos;s talk</p>
                <ul className="mb-8 space-y-2 text-sm">
                  <li>✓ Everything in Professional</li>
                  <li>✓ Custom development</li>
                  <li>✓ Priority support</li>
                  <li>✓ Ongoing optimization</li>
                </ul>
                <button className="w-full rounded-md border bg-background py-3 font-semibold hover:bg-muted">
                  Contact Us
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Extended Testimonials */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h3 className="mb-12 text-center text-3xl font-black">What Our Clients Say</h3>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="rounded-lg bg-background p-6">
                <p className="mb-4 italic">
                  &quot;Working with this team transformed our online presence. We went from 2% to 8% conversion rate 
                  in just 3 months.&quot;
                </p>
                <p className="font-semibold">Michael Chen</p>
                <p className="text-sm text-muted-foreground">CEO, TechFlow</p>
              </div>
              <div className="rounded-lg bg-background p-6">
                <p className="mb-4 italic">
                  &quot;Finally, a team that understands B2B marketing. They delivered exactly what we needed to 
                  compete with bigger players.&quot;
                </p>
                <p className="font-semibold">Sarah Martinez</p>
                <p className="text-sm text-muted-foreground">CMO, DataSync</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h3 className="mb-12 text-center text-3xl font-black">Frequently Asked Questions</h3>
            <div className="space-y-6">
              <div className="rounded-lg border p-6">
                <h4 className="mb-2 font-semibold">How long does it take to build a funnel?</h4>
                <p className="text-muted-foreground">
                  Most projects are completed within 7-14 days, depending on complexity.
                </p>
              </div>
              <div className="rounded-lg border p-6">
                <h4 className="mb-2 font-semibold">Do you offer guarantees?</h4>
                <p className="text-muted-foreground">
                  Yes, we offer a 30-day satisfaction guarantee. If you&apos;re not happy, we&apos;ll make it right.
                </p>
              </div>
              <div className="rounded-lg border p-6">
                <h4 className="mb-2 font-semibold">What&apos;s included in the price?</h4>
                <p className="text-muted-foreground">
                  Everything you need to launch: design, development, copywriting, and initial setup.
                </p>
              </div>
              <div className="rounded-lg border p-6">
                <h4 className="mb-2 font-semibold">Can you integrate with our existing tools?</h4>
                <p className="text-muted-foreground">
                  Absolutely. We work with all major CRMs, email platforms, and analytics tools.
                </p>
              </div>
              <div className="rounded-lg border p-6">
                <h4 className="mb-2 font-semibold">Do you provide ongoing support?</h4>
                <p className="text-muted-foreground">
                  Yes, we offer ongoing support and optimization packages after launch.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="mb-4 text-3xl font-black text-primary-foreground">
            Ready to Transform Your Marketing?
          </h3>
          <p className="mb-8 text-lg text-primary-foreground/90">
            Join 50+ startups that have elevated their brand
          </p>
          <button className="rounded-md bg-white px-8 py-3 font-semibold text-primary hover:bg-white/90">
            Get Started Today
          </button>
        </div>
      </section>
    </div>
  );
}