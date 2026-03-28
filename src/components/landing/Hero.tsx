"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

const TYPED_LINES = [
  "> initializing Clauhire...",
  "> scanning talent pools...",
  "> matching candidates...",
  "> pipeline optimized.",
];

export default function Hero() {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleLines((prev) => {
        if (prev >= TYPED_LINES.length) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 600);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 bg-background overflow-hidden">
      {/* Glow orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent/5 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <div className="inline-block mb-6 px-3 py-1 border border-accent/20 text-xs text-accent font-medium tracking-wider uppercase bg-accent/5 rounded-full">
          Recruitment, Engineered.
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95] mb-6">
          <span className="text-foreground">Hire with</span>
          <br />
          <span className="text-accent">Clauhire</span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted mb-10 leading-relaxed">
          AI-powered pipelines. Real-time candidate tracking. 
          The next generation of talent acquisition has arrived.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="/sign-up">
            <Button variant="primary" className="text-base px-8 py-4">
              Get Started →
            </Button>
          </Link>
          <Link href="#features">
            <Button variant="outline" className="text-base px-8 py-4">
              How it works
            </Button>
          </Link>
        </div>

        {/* Console block */}
        <div className="max-w-lg mx-auto bg-card border border-border text-left p-5 shadow-sm rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2.5 h-2.5 rounded-full bg-border" />
            <div className="w-2.5 h-2.5 rounded-full bg-border" />
            <div className="w-2.5 h-2.5 rounded-full bg-border" />
            <span className="ml-3 text-xs text-subtle font-medium">claura@clauhire ~</span>
          </div>
          <div className="space-y-1 font-mono">
            {TYPED_LINES.slice(0, visibleLines).map((line, i) => (
              <div key={i} className="text-sm text-foreground/80 animate-fade-in">
                {line}
              </div>
            ))}
            {visibleLines <= TYPED_LINES.length && (
              <span className="inline-block w-2 h-4 bg-accent animate-pulse" />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
