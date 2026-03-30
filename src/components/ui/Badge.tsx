import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error" | "primary";
}

export default function Badge({ variant = "default", className = "", children, ...props }: BadgeProps) {
  const variants = {
    default: "bg-black/5 text-dark/60 border border-black/5",
    success: "bg-green-500/10 text-green-600 border border-green-500/20",
    warning: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
    error: "bg-red-500/10 text-red-600 border border-red-500/20",
    primary: "bg-orange/10 text-orange border border-orange/20",
  };

  return (
    <span 
      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

