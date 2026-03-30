"use client";

import { useEffect, useState } from "react";
import { Sparkles, Search, Cpu, Zap } from "lucide-react";

const statuses = [
  { text: "Scanning profile benchmarks...", icon: Search, color: "text-blue-500" },
  { text: "Analyzing market compatibility...", icon: Cpu, color: "text-purple-500" },
  { text: "Optimizing neural negotiation...", icon: Zap, color: "text-amber-500" },
  { text: "Finalizing secure handshake...", icon: Sparkles, color: "text-emerald-500" },
];

export default function ThinkingAnimation() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % statuses.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const CurrentIcon = statuses[index].icon;

  return (
    <div className="bg-white border border-black/10 rounded-2xl p-6 shadow-sm max-w-sm w-full fade-up">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-orange/10 flex items-center justify-center relative overflow-hidden">
            <div className={`transition-all duration-500 transform ${statuses[index].color}`}>
              <CurrentIcon className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange rounded-full border-2 border-white" />
        </div>

        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-wider font-bold text-orange mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange" />
            Neural Link Active
          </div>
          <div className="h-5 relative overflow-hidden">
            <div 
              key={index}
              className="text-sm font-medium text-dark whitespace-nowrap fade-up"
            >
              {statuses[index].text}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 h-1 bg-black/5 rounded-full overflow-hidden">
        <div 
          className="h-full bg-orange transition-all duration-1000 ease-in-out"
          style={{ width: `${((index + 1) / statuses.length) * 100}%` }}
        />
      </div>
    </div>
  );
}
