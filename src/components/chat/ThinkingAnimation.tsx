"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Sparkles, Search, Cpu, Zap } from "lucide-react";

const statuses = [
  { text: "Scanning profile benchmarks...", icon: Search, color: "text-blue-400" },
  { text: "Analyzing market compatibility...", icon: Cpu, color: "text-purple-400" },
  { text: "Optimizing neural negotiation...", icon: Zap, color: "text-amber-400" },
  { text: "Finalizing secure handshake...", icon: Sparkles, color: "text-emerald-400" },
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
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card border border-border/50 rounded-2xl p-6 shadow-xl max-w-sm w-full"
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center relative overflow-hidden">
            <motion.div
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-0 border-2 border-dashed border-accent/30 rounded-full"
            />
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, rotate: -20, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 20, scale: 0.5 }}
                className={statuses[index].color}
              >
                <CurrentIcon className="w-6 h-6" />
              </motion.div>
            </AnimatePresence>
          </div>
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-card"
          />
        </div>

        <div className="flex-1">
          <div className="text-[10px] uppercase tracking-wider font-bold text-accent mb-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Neural Link Active
          </div>
          <div className="h-5 relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="text-sm font-medium text-foreground whitespace-nowrap"
              >
                {statuses[index].text}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-1 h-1 bg-border/30 rounded-full overflow-hidden">
        <motion.div
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-1/3 h-full bg-gradient-to-r from-transparent via-accent to-transparent"
        />
      </div>
    </motion.div>
  );
}
