/* eslint-disable */
// @ts-nocheck
"use client";
import React from "react";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Stats from "@/components/landing/Stats";
import CTA from "@/components/landing/CTA";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-sans">
      <Navbar />
      <Hero />
      <Features />
      <Stats />
      <CTA />
      
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-border flex flex-col md:flex-row items-center justify-between text-sm text-muted">
        <p>© 2026 Clauhire • Intelligent Recruitment</p>
        <div className="flex gap-8 mt-4 md:mt-0">
          <a href="#" className="hover:text-foreground transition-colors">Terms</a>
          <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          <a href="#" className="hover:text-foreground transition-colors">Status</a>
        </div>
      </footer>
    </div>
  );
}
