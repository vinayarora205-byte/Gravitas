"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, LayoutDashboard, UserCheck, Briefcase, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const { user } = useUser();
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (!user) return;
    checkUnread();

    const channel = supabase
      .channel("sidebar-unread")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "direct_messages" },
        () => checkUnread()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "direct_messages" },
        () => checkUnread()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const checkUnread = async () => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("clerk_user_id", user!.id)
      .maybeSingle();

    if (!profile) return;

    const { count } = await supabase
      .from("direct_messages")
      .select("*", { count: 'exact', head: true })
      .eq("is_read", false)
      .neq("sender_id", profile.id);

    setHasUnread((count || 0) > 0);
  };

  const getLinks = () => {
    const r = role?.toUpperCase();
    if (r === 'RECRUITER') {
      return [
        { label: "Dashboard", href: "/dashboard/recruiter", icon: LayoutDashboard },
        { label: "Claura Chat", href: "/chat", icon: MessageSquare },
        { label: "Talent Pool", href: "/dashboard/recruiter/talent-pool", icon: UserCheck },
        { label: "Messages", href: "/dashboard/recruiter/messages", icon: Mail, badge: hasUnread },
      ];
    }
    return [
      { label: "Dashboard", href: "/dashboard/candidate", icon: LayoutDashboard },
      { label: "Claura Chat", href: "/chat", icon: MessageSquare },
      { label: "Opportunities", href: "/dashboard/candidate/opportunities", icon: Briefcase },
      { label: "Messages", href: "/dashboard/candidate/messages", icon: Mail, badge: hasUnread },
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium relative ${
                isActive 
                  ? "bg-[#FFF5F2] dark:bg-[#33150C] text-foreground" 
                  : "text-muted hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-accent' : 'text-subtle'}`} strokeWidth={1.5} />
              {link.label}
              {link.badge && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
              )}
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
             C
           </div>
           <div>
             <div className="text-sm font-medium text-foreground">Claura Agent</div>
             <div className="text-xs text-success flex items-center gap-1">
               <span className="w-1.5 h-1.5 rounded-full bg-success"></span> Online
             </div>
           </div>
         </div>
      </div>
    </aside>
  );
}

