import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
}

export default function Card({ className = "", children, hoverable = false, ...props }: CardProps) {
  const hoverStyles = hoverable 
    ? "hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-orange/20 transition-all duration-500" 
    : "";

  return (
    <div 
      className={`bg-white border border-black/5 rounded-[32px] p-6 lg:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

