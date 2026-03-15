import React from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function CTA() {
  return (
    <section id="cta" className="py-24 md:py-32 bg-background relative overflow-hidden">
      {/* Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent/5 blur-[150px] pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
        <div className="border border-border p-12 md:p-16 bg-card rounded-3xl shadow-sm">
          <span className="text-xs text-accent font-semibold uppercase tracking-wider">
            Ready to evolve?
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mt-4 mb-4 text-foreground">
            Stop searching.<br />
            Start <span className="text-accent">hiring</span> with precision.
          </h2>
          <p className="text-muted mb-8 max-w-lg mx-auto">
            GRAVITAS gives you the precision tools to build world-class teams. 
            No friction. Just matches.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button variant="primary" className="text-base px-8 py-4">
                Launch Now →
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="ghost" className="text-base px-8 py-4">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
