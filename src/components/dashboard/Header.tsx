"use client";

import React, { useState, useEffect } from "react";
import { Bell, List } from "@phosphor-icons/react";
import { UserButton, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Header({ role }: { role?: string }) {
  const { user } = useUser();
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("clerk_user_id", user.id)
          .maybeSingle();
        if (profile) {
          const res = await fetch(`/api/notifications?profileId=${profile.id}`);
          if (res.ok) {
            const data = await res.json();
            setNotifications(data.notifications || []);
          }
        }
      } catch (e) {}
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications?id=${id}`, { method: "PATCH" });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const pageLabel = (() => {
    const seg = pathname.split("/").pop() || "";
    if (seg === "recruiter" || seg === "candidate") return "Overview";
    return seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Dashboard";
  })();

  return (
    <header
      className="h-16 bg-white flex items-center justify-between px-8 shrink-0 z-40 font-sans"
      style={{ borderBottom: "1px solid #E8E3DD" }}
    >
      {/* Left */}
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 text-gray-400 hover:text-[#FF6A2A] transition-colors">
          <List size={22} weight="regular" />
        </button>
        <h1 className="hidden sm:block font-serif text-[20px] font-bold italic text-[#0F0F0F]">
          {pageLabel}
        </h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Bell */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-9 h-9 flex items-center justify-center rounded-full transition-colors relative"
            style={{ color: "#666" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#FF6A2A")}
            onMouseLeave={e => (e.currentTarget.style.color = "#666")}
          >
            <Bell size={20} weight="regular" />
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 w-2 h-2 rounded-full border-2 border-white"
                style={{ background: "#FF6A2A" }}
              />
            )}
          </button>

          {showDropdown && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
              />
              <div
                className="absolute right-0 mt-2 w-80 bg-white rounded-[16px] overflow-hidden z-50"
                style={{
                  border: "1px solid #E8E3DD",
                  boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
                  top: "100%",
                }}
              >
                <div
                  className="flex items-center justify-between px-5 py-4"
                  style={{ borderBottom: "1px solid #E8E3DD" }}
                >
                  <span className="font-bold text-[15px] text-[#0F0F0F]">Notifications</span>
                  {unreadCount > 0 && (
                    <span
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "#FFF3EE", color: "#FF6A2A" }}
                    >
                      {unreadCount} new
                    </span>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-[13px]">
                    <Bell size={28} className="mx-auto mb-3 opacity-30" />
                    All caught up!
                  </div>
                ) : (
                  <div className="max-h-[340px] overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className="px-5 py-4 cursor-pointer transition-colors flex gap-3"
                        style={{
                          borderBottom: "1px solid #F0EDE8",
                          background: !n.is_read ? "#FFFAF8" : "white",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#FAFAFA")}
                        onMouseLeave={e => (e.currentTarget.style.background = !n.is_read ? "#FFFAF8" : "white")}
                      >
                        <div
                          className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                          style={{ background: !n.is_read ? "#FF6A2A" : "transparent" }}
                        />
                        <div className="flex-1">
                          <p className="font-bold text-[13px] text-[#0F0F0F] mb-0.5">{n.title}</p>
                          <p className="text-[12px] text-gray-400 line-clamp-2">{n.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* User Avatar */}
        <div
          className="pl-3 ml-1 flex items-center"
          style={{ borderLeft: "1px solid #E8E3DD" }}
        >
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                userButtonAvatarBox: "w-8 h-8 rounded-full",
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}
