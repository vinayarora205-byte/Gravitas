import React from "react";
import Logo from "@/components/ui/Logo";

const LINKS = {
  Product: ["Features", "Pricing", "Claura AI", "Changelog"],
  Company: ["About", "Blog", "Careers", "Press"],
  Legal: ["Privacy", "Terms", "Security"],
};

export default function Footer() {
  return (
    <footer className="border-t border-void-border bg-void-light py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <Logo className="mb-4" />
            <p className="text-sm text-ghost-dim leading-relaxed">
              Recruitment infrastructure for teams that ship fast.
            </p>
          </div>

          {Object.entries(LINKS).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-xs font-mono uppercase tracking-wider text-ghost-dim mb-4">
                {category}
              </h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-ghost/70 hover:text-cyan transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-void-border mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xs text-ghost-dim">
            © 2026 Clauhire. All rights reserved.
          </span>
          <div className="flex items-center gap-6">
            <span className="text-xs text-ghost-dim">
              Built with <span className="text-cyan">precision</span>
            </span>
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-cyan" />
              <div className="w-1.5 h-1.5 bg-purple" />
              <div className="w-1.5 h-1.5 bg-ghost-dim" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
