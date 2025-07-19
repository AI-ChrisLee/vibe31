"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import "./fade.css";

export default function OptInPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/submit-lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          funnelId: "10mfunnels",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(data.redirectUrl || "/template/10mfunnels/video");
      } else {
        alert(data.error || "Failed to submit email");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handlePlayClick = () => {
    const formElement = document.getElementById('opt-in-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl space-y-8">
        <div className="mx-auto w-full max-w-xl fade-in">
          <div className="aspect-video overflow-hidden rounded-lg bg-muted relative group cursor-pointer" onClick={handlePlayClick}>
            <Image
              src="/hero-optimized.gif"
              alt="$1M MRR Funnel Demo"
              fill
              className="object-cover"
              priority
              unoptimized
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-all group-hover:bg-black/30">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform group-hover:scale-110">
                <svg
                  className="ml-1 h-8 w-8 text-black"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center fade-in-delay-1">
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl">
            Copy and Paste $1M MRR Funnel I Rebuilt in 4 Hours using Vibe Coding
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg font-medium text-muted-foreground">
            In this video I break down the exact funnel, and show you how to recreate it in just a few clicks.
          </p>
        </div>

        <div id="opt-in-form" className="mx-auto w-full max-w-md fade-in-delay-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 w-full rounded-md border border-input bg-background px-4 text-base font-medium placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className="h-12 w-full rounded-md bg-primary text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Unlock Video Now 👉"}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Get Free Video Access Now
          </p>
        </div>

        <div className="mx-auto max-w-2xl space-y-4 text-center fade-in-delay-3">
          <p className="text-sm font-medium text-muted-foreground">⭐⭐⭐⭐⭐</p>
          <p className="text-sm italic text-muted-foreground">
            &quot;Finally someone who shows the REAL funnel mechanics. This saved me $10K in development costs!&quot;
          </p>
          <p className="text-sm font-medium">- Sarah Johnson, Marketing Manager</p>
        </div>
      </div>
    </div>
  );
}