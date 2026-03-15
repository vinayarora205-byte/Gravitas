"use client";

import React, { useEffect, useRef, useState } from "react";

const STATS = [
  { value: 2400, suffix: "+", label: "Companies onboarded" },
  { value: 180, suffix: "K", label: "Placements made" },
  { value: 72, suffix: "%", label: "Faster time-to-hire" },
  { value: 99.9, suffix: "%", label: "System uptime" },
];

function useCountUp(target: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current * 10) / 10);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { count, ref };
}

function StatItem({ stat }: { stat: typeof STATS[0] }) {
  const { count, ref } = useCountUp(stat.value);
  return (
    <div
      ref={ref}
      className="text-center p-8 border border-border bg-card hover:border-accent/30 transition-colors rounded-2xl"
    >
      <div className="text-4xl md:text-5xl font-bold text-accent mb-2">
        {Number.isInteger(stat.value) ? Math.floor(count) : count.toFixed(1)}
        {stat.suffix}
      </div>
      <div className="text-sm text-muted">{stat.label}</div>
    </div>
  );
}

export default function Stats() {
  return (
    <section id="stats" className="py-24 md:py-32 border-y border-border bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-xs text-accent font-semibold uppercase tracking-wider">
            Numbers don&apos;t lie
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mt-3 text-foreground">
            The proof is in the data
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-1">
          {STATS.map((stat, i) => (
            <StatItem key={i} stat={stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
