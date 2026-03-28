import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
 label?: string;
 error?: string;
 icon?: React.ReactNode;
}

export default function Input({ label, error, className = "", icon, ...props }: InputProps) {
 return (
 <div className="flex flex-col gap-1 w-full">
 {label && <label className="text-small font-medium text-muted">{label}</label>}
 <div className="relative">
 <input
 className={`w-full bg-card border border-border rounded-[20px] px-4 py-3 text-body text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all duration-200 placeholder:text-subtle ${icon ? 'pl-11' : ''} ${error ? 'border-error focus:border-error focus:ring-error' : ''} ${className}`}
 {...props}
 />
 {icon && (
 <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
 {icon}
 </div>
 )}
 </div>
 {error && <span className="text-sm text-error mt-0.5 ml-1">{error}</span>}
 </div>
 );
}
