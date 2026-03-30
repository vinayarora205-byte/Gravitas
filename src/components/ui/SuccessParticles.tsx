"use client";

import { useEffect, useState } from "react";

export default function SuccessParticles() {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; color: string; duration: number; delay: number }[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      color: ["#FF6A2A", "#10b981", "#3b82f6", "#8b5cf6"][Math.floor(Math.random() * 4)],
      duration: Math.random() * 1 + 1,
      delay: Math.random() * 0.5,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full opacity-0"
          style={{
            backgroundColor: p.color,
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            animation: `fadeUp ${p.duration}s ease-out ${p.delay}s forwards`,
          }}
        />
      ))}
    </div>
  );
}
