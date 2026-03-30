"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SquaresFour, ChatCircle, Briefcase, ChatTeardropDots, Diamond } from "@phosphor-icons/react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const { user } = useUser();
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

    return () => { supabase.removeChannel(channel); };
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
      .select("*", { count: "exact", head: true })
      .eq("is_read", false)
      .neq("sender_id", profile.id);

    setHasUnread((count || 0) > 0);
  };

  const getLinks = () => {
    const r = role?.toUpperCase();
    if (r === "RECRUITER") {
      return [
        { label: "Dashboard",    href: "/dashboard/recruiter",          icon: SquaresFour },
        { label: "Claura Chat",  href: "/chat",                         icon: ChatCircle },
        { label: "Talent Pool",  href: "/dashboard/recruiter/talent-pool", icon: Briefcase },
        { label: "Messages",     href: "/dashboard/recruiter/messages",  icon: ChatTeardropDots, badge: hasUnread },
      ];
    }
    return [
      { label: "Dashboard",    href: "/dashboard/candidate",            icon: SquaresFour },
      { label: "Claura Chat",  href: "/chat",                           icon: ChatCircle },
      { label: "Opportunities",href: "/dashboard/candidate/opportunities", icon: Briefcase },
      { label: "Messages",     href: "/dashboard/candidate/messages",   icon: ChatTeardropDots, badge: hasUnread },
    ];
  };

  const links = getLinks();
  const initials = fullName ? fullName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "U";
  const roleLabel = role?.charAt(0).toUpperCase() + role?.slice(1).toLowerCase();

  return (
    <aside
      className="w-[240px] bg-white shrink-0 flex flex-col h-full hidden md:flex font-sans"
      style={{ borderRight: "1px solid #E8E3DD" }}
    >
      {/* Logo */}
      <div className="p-6 pb-5 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-full bg-[#FF6A2A] flex items-center justify-center text-white font-bold text-sm font-serif">
          C
        </div>
        <span className="font-serif text-[18px] font-bold italic text-[#0F0F0F]">Clauhire</span>
      </div>

      {/* Nav Links */}
      <nav className="px-3 flex-1 flex flex-col gap-0.5 mt-2">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-4 py-[10px] rounded-[10px] text-[14px] font-medium relative transition-colors"
              style={{
                background: isActive ? "#FFF3EE" : "transparent",
                color: isActive ? "#FF6A2A" : "#666",
                fontWeight: isActive ? 600 : 500,
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "#F6F1EB";
                  (e.currentTarget as HTMLElement).style.color = "#0F0F0F";
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#666";
                }
              }}
            >
              <Icon
                weight={isActive ? "fill" : "regular"}
                style={{ width: 18, height: 18, color: isActive ? "#FF6A2A" : "#999" }}
              />
              {link.label}
              {link.badge && (
                <span
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                  style={{ background: "#FF6A2A" }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom — User + Hiries */}
      <div className="p-6 mt-auto" style={{ borderTop: "1px solid #E8E3DD" }}>
        {/* User Row */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-[13px] shrink-0"
            style={{ background: "#FF6A2A" }}
          >
            {initials}
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-[13px] font-bold text-[#0F0F0F] truncate">{fullName || "User"}</div>
            <div
              className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full mt-0.5 truncate"
              style={{ background: "#F6F1EB", color: "#666" }}
            >
              {roleLabel}
            </div>
          </div>
        </div>

        {/* Hiries Row */}
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded-[10px] mt-1"
          style={{ background: "#FFF3EE" }}
        >
          <Diamond size={16} weight="fill" color="#FF6A2A" />
          <span className="text-[13px] font-bold" style={{ color: "#FF6A2A" }}>
            {balance} Hiries
          </span>
        </div>
      </div>
    </aside>
  );
}
