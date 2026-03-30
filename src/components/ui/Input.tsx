"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export default function Input({ label, error, className = "", icon, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-2 w-full font-sans">
      {label && <label className="text-xs font-bold uppercase tracking-wider text-dark/40 ml-1">{label}</label>}
      <div className="relative group">
        <input
          className={`w-full bg-gray-50 border border-black/5 rounded-2xl px-5 py-3.5 text-sm text-dark font-medium focus:outline-none focus:border-orange/30 focus:bg-white focus:ring-4 focus:ring-orange/5 transition-all duration-300 placeholder:text-dark/20 ${icon ? 'pl-12' : ''} ${error ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/5' : ''} ${className}`}
          {...props}
        />
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-dark/30 group-focus-within:text-orange transition-colors">
            {icon}
          </div>
        )}
      </div>
      {error && <span className="text-[11px] font-bold text-red-500 mt-1 ml-1 uppercase tracking-tight">{error}</span>}
    </div>
  );
}

