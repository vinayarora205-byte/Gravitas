"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export default function Button({
  className = "",
  variant = "primary",
  size = "md",
  fullWidth = false,
  children,
  ...props
}: ButtonProps) {
  const base = "font-sans font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-[#FF6A2A] text-white hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0",
    secondary: "bg-white text-[#0F0F0F] border border-[#E8E3DD] hover:bg-[#F6F1EB] hover:-translate-y-0.5",
    outline: "bg-transparent text-[#0F0F0F] border-2 border-[#E8E3DD] hover:border-[#FF6A2A] hover:text-[#FF6A2A]",
    ghost: "bg-transparent text-[#0F0F0F]/60 hover:bg-black/5 hover:text-[#0F0F0F]",
  };

  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
