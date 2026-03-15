"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

interface ButtonProps extends HTMLMotionProps<"button"> {
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
  const baseStyles = "font-sans font-medium rounded-xl transition-all duration-200 ease-in-out flex items-center justify-center gap-2 relative overflow-hidden";
  
  const variants = {
    primary: "bg-accent text-white hover:bg-accent-hover hover:-translate-y-px shadow-sm",
    secondary: "bg-background text-foreground border border-border hover:bg-black/5 hover:dark:bg-white/5",
    outline: "bg-transparent text-foreground border border-border hover:border-accent hover:text-accent",
    ghost: "bg-transparent text-foreground hover:bg-black/5 hover:dark:bg-white/5",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2.5 text-body",
    lg: "px-6 py-3.5 text-body-lg",
  };

  const width = fullWidth ? "w-full" : "";

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${width} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
