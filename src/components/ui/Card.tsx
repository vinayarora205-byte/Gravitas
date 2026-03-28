import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
 children: React.ReactNode;
}

export default function Card({ className = "", children, ...props }: CardProps) {
 return (
 <div 
 className={`bg-card border border-border rounded-2xl p-6 shadow-[0px_2px_8px_rgba(0,0,0,0.05)] ${className}`}
 {...props}
 >
 {children}
 </div>
 );
}
