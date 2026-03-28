import React from "react";

export default function Logo({ className = "" }: { className?: string }) {
 return (
 <div className={`flex items-center gap-2 ${className}`}>
 <div className="w-3 h-3 bg-cyan animate-glow-pulse" />
 <span className="text-xl font-bold font-mono tracking-[0.2em] text-ghost">
 Clauhire
 </span>
 </div>
 );
}
