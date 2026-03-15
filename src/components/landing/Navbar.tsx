"use client";

import React, { useState } from "react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/Button";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Logo />

        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-muted hover:text-accent transition-colors">
            Features
          </a>
          <a href="#stats" className="text-sm text-muted hover:text-accent transition-colors">
            Proof
          </a>
          <a href="#cta" className="text-sm text-muted hover:text-accent transition-colors">
            Start
          </a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/sign-in">
            <Button variant="ghost" className="text-sm px-4 py-2">Log in</Button>
          </Link>
          <Link href="/sign-up">
            <Button variant="primary" className="text-sm px-4 py-2">Get Started</Button>
          </Link>
        </div>

        <button
          className="md:hidden text-foreground hover:text-accent"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            {menuOpen ? (
              <path d="M6 6l12 12M6 18L18 6" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md px-6 py-4 flex flex-col gap-4">
          <a href="#features" className="text-sm text-muted hover:text-accent">Features</a>
          <a href="#stats" className="text-sm text-muted hover:text-accent">Proof</a>
          <a href="#cta" className="text-sm text-muted hover:text-accent">Start</a>
          <div className="flex flex-col gap-2 pt-2 border-t border-border mt-2">
            <Link href="/sign-in">
              <Button variant="ghost" className="text-sm px-4 py-2 w-full">Log in</Button>
            </Link>
            <Link href="/sign-up">
              <Button variant="primary" className="text-sm px-4 py-2 w-full">Get Started</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
