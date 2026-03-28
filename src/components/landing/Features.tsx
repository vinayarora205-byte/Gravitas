import React from "react";
import Card from "@/components/ui/Card";

const FEATURES = [
 {
 icon: "⚡",
 title: "AI Candidate Matching",
 description:
 "Claura analyzes job requirements and surfaces the right candidates instantly. No more manual screening.",
 },
 {
 icon: "◉",
 title: "Pipeline Tracking",
 description:
 "Kanban-style boards with real-time stage updates. Every candidate, every status, one view.",
 },
 {
 icon: "◆",
 title: "Recruiter Analytics",
 description:
 "Time-to-hire, source quality, pipeline velocity — all the metrics that matter, rendered live.",
 },
 {
 icon: "▣",
 title: "Team Collaboration",
 description:
 "Share candidate notes, schedule interviews, and coordinate hiring decisions in real-time.",
 },
 {
 icon: "△",
 title: "Smart Job Posting",
 description:
 "Post once, distribute everywhere. AI-optimized descriptions that attract the right talent.",
 },
 {
 icon: "☰",
 title: "Candidate Portal",
 description:
 "Branded candidate experience. Application tracking, status updates, and direct messaging.",
 },
];

export default function Features() {
 return (
 <section id="features" className="py-24 md:py-32 bg-background">
 <div className="max-w-7xl mx-auto px-6">
 <div className="text-center mb-16">
 <span className="text-xs text-accent font-semibold uppercase tracking-wider">
 Capabilities
 </span>
 <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-4 text-foreground">
 Engineered for velocity
 </h2>
 <p className="text-muted max-w-xl mx-auto">
 Every tool a modern recruitment team needs, built with precision.
 </p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
 {FEATURES.map((feature, i) => (
 <Card key={i} className="group hover:-translate-y-1 hover:border-accent/30 transition-all shadow-sm rounded-2xl p-8 bg-card border-border">
 <div className="text-2xl mb-4 text-accent group-hover:scale-110 transition-transform inline-block">
 {feature.icon}
 </div>
 <h3 className="text-lg font-semibold text-foreground mb-2">
 {feature.title}
 </h3>
 <p className="text-sm text-muted leading-relaxed">
 {feature.description}
 </p>
 </Card>
 ))}
 </div>
 </div>
 </section>
 );
}
