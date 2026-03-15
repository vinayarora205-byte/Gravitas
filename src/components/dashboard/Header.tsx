/* eslint-disable */
// @ts-nocheck
"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Bell, Sun, Moon } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

export default function Header({ role }: { role?: string }) {
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      try {
        const { data: profile } = await supabase.from('profiles').select('id').eq('clerk_user_id', user.id).maybeSingle();
        if (profile) {
          const res = await fetch(`/api/notifications?profileId=${profile.id}`);
          if (res.ok) {
             const data = await res.json();
             setNotifications(data.notifications || []);
          }
        }
      } catch(e) {}
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAsRead = async (id: string) => {
    await fetch(`/api/notifications?id=${id}`, { method: "PATCH" });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 shrink-0 relative z-50">
      <div className="flex items-center gap-3">
        <Link href="/" className="font-bold text-xl tracking-tight text-foreground flex items-center gap-2">
          GRAVITAS
        </Link>
        {role && (
          <span className="hidden sm:inline-flex px-2.5 py-1 bg-black/5 dark:bg-white/5 text-muted text-xs font-medium rounded-full ml-4">
            {role}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        {mounted && (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 text-muted hover:text-foreground transition-colors rounded-full hover:bg-black/5 dark:hover:bg-white/5"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        )}

        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="p-2 text-muted hover:text-foreground transition-colors relative rounded-full hover:bg-black/5 dark:hover:bg-white/5"
          >
             <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full border border-card" />
            )}
          </button>
          
          <AnimatePresence>
            {showDropdown && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -8 }}
                transition={{ duration: 0.12, ease: "easeOut" }}
                className="absolute right-0 mt-2 w-80 bg-card border border-border shadow-lg rounded-2xl max-h-96 overflow-y-auto z-50 overflow-hidden"
              >
                <div className="p-3 border-b border-border font-medium text-foreground text-sm">
                  Notifications {unreadCount > 0 && <span className="text-accent ml-1">({unreadCount})</span>}
                </div>
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-muted text-sm">No new notifications</div>
                ) : (
                  <div className="py-1">
                    {notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => markAsRead(n.id)}
                        className={`px-4 py-3 border-b border-border/50 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${!n.is_read ? 'bg-accent/5' : ''}`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className={`text-xs font-medium ${!n.is_read ? 'text-accent' : 'text-subtle'}`}>{n.type}</span>
                          {!n.is_read && <span className="w-2 h-2 rounded-full bg-accent mt-1 shrink-0"></span>}
                        </div>
                        <p className="font-medium text-foreground text-sm leading-tight mb-1">{n.title}</p>
                        <p className="text-subtle text-xs leading-relaxed">{n.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="ml-2 pl-4 border-l border-border flex items-center">
           <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: "w-8 h-8" } }} />
        </div>
      </div>
    </header>
  );
}
