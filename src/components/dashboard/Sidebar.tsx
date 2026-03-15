"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, LayoutDashboard, UserCheck, Briefcase } from "lucide-react";

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();

  const getLinks = () => {
    if (role === 'RECRUITER') {
      return [
        { label: "Dashboard", href: "/dashboard/recruiter", icon: LayoutDashboard },
        { label: "GAIA Chat", href: "/chat", icon: MessageSquare },
        { label: "Talent Pool", href: "/dashboard/recruiter/talent-pool", icon: UserCheck },
      ];
    }
    return [
      { label: "Dashboard", href: "/dashboard/candidate", icon: LayoutDashboard },
      { label: "GAIA Chat", href: "/chat", icon: MessageSquare },
      { label: "Opportunities", href: "/dashboard/candidate/opportunities", icon: Briefcase },
    ];
  };

  const links = getLinks();

  return (
    <aside className="w-60 bg-card border-r border-border shrink-0 flex flex-col h-full hidden md:flex">
      <div className="p-4 flex-1 flex flex-col gap-1 mt-2">
        <div className="text-xs font-medium text-subtle uppercase tracking-wider mb-2 px-3">Menu</div>
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                isActive 
                  ? "bg-[#FFF5F2] dark:bg-[#33150C] text-foreground relative" 
                  : "text-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-accent' : 'text-subtle'}`} strokeWidth={1.5} />
              {link.label}
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-accent rounded-r-full" />
              )}
            </Link>
          );
        })}
      </div>
      
      <div className="p-6 border-t border-border bg-black/5 dark:bg-white/5 mt-auto">
         <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm">
             G
           </div>
           <div>
             <div className="text-sm font-medium text-foreground">GAIA Agent</div>
             <div className="text-xs text-success flex items-center gap-1">
               <span className="w-1.5 h-1.5 rounded-full bg-success"></span> Online
             </div>
           </div>
         </div>
      </div>
    </aside>
  );
}
