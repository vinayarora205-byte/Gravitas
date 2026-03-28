"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SquaresFour, ChatCircle, Briefcase, ChatTeardropDots, Diamond, Sun, Moon } from "@phosphor-icons/react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const [hasUnread, setHasUnread] = useState(false);
  const [balance, setBalance] = useState(0);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    if (!user) return;
    checkUserData();

    const channel = supabase
      .channel("sidebar-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "direct_messages" }, () => checkUserData())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles" }, () => checkUserData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const checkUserData = async () => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, hiries_balance, full_name")
      .eq("clerk_user_id", user!.id)
      .maybeSingle();

    if (!profile) return;
    setBalance(profile.hiries_balance || 0);
    setFullName(profile.full_name || "");

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
        { label: "Dashboard", href: "/dashboard/recruiter", icon: SquaresFour },
        { label: "Claura Chat", href: "/chat", icon: ChatCircle },
        { label: "Talent Pool", href: "/dashboard/recruiter/talent-pool", icon: Briefcase },
        { label: "Messages", href: "/dashboard/recruiter/messages", icon: ChatTeardropDots, badge: hasUnread },
      ];
    }
    return [
      { label: "Dashboard", href: "/dashboard/candidate", icon: SquaresFour },
      { label: "Claura Chat", href: "/chat", icon: ChatCircle },
      { label: "Opportunities", href: "/dashboard/candidate/opportunities", icon: Briefcase },
      { label: "Messages", href: "/dashboard/candidate/messages", icon: ChatTeardropDots, badge: hasUnread },
    ];
  };

  const links = getLinks();
  const avatarUrl = fullName ? `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=FF6B3D&color=fff&rounded=true` : "";

  return (
    <aside className="w-[260px] glass border-r border-white/10 shrink-0 flex flex-col h-full hidden md:flex">
      <div className="p-6 flex items-center gap-3 border-b border-white/5">
        <div className="w-8 h-8 rounded-full bg-[linear-gradient(135deg,#FF6B3D,#FF8C5A)] flex items-center justify-center text-white font-bold text-sm shadow-[0_0_10px_rgba(255,107,61,0.5)]">
          C
        </div>
        <div className="text-xl font-extrabold italic text-gradient tracking-tight">Clauhire</div>
      </div>

      <div className="p-4 flex-1 flex flex-col gap-2 mt-4">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-[16px] transition-all duration-300 text-sm font-semibold relative group ${
                isActive 
                  ? "bg-[linear-gradient(135deg,rgba(255,107,61,0.15),rgba(255,209,102,0.1))] border border-orange/20 shadow-sm text-foreground" 
                  : "text-muted hover:bg-orange/5 hover:text-foreground"
              }`}
            >
              <Icon weight={isActive ? "duotone" : "regular"} className={`w-[22px] h-[22px] ${isActive ? 'text-orange' : 'text-muted group-hover:text-orange/80 transition-colors'}`} />
              {link.label}
              {link.badge && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-orange rounded-full shadow-[0_0_8px_rgba(255,107,61,0.8)]" />
              )}
            </Link>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-white/10 bg-black/5 dark:bg-white/5">
         <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-3">
             {avatarUrl && <img src={avatarUrl} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-background" />}
             <div>
               <div className="text-sm font-bold text-foreground truncate max-w-[100px]">{fullName || "User"}</div>
               <div className="text-[11px] text-muted capitalize">{role}</div>
             </div>
           </div>
           <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full glass hover:bg-orange/10 transition-colors">
              {theme === 'dark' ? <Sun size={18} weight="duotone" className="text-gold" /> : <Moon size={18} weight="duotone" className="text-orange" />}
           </button>
         </div>
         <div className="glass px-4 py-2 rounded-xl flex items-center justify-between border border-orange/20 bg-[linear-gradient(135deg,rgba(255,107,61,0.05),rgba(255,209,102,0.05))]">
           <span className="text-xs font-semibold text-muted flex items-center gap-1.5"><Diamond size={14} weight="duotone" className="text-orange"/> Hiries</span>
           <span className="text-sm font-bold text-orange">{balance}</span>
         </div>
      </div>
    </aside>
  );
}
