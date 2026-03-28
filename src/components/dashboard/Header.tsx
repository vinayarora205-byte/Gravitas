"use client";

import React, { useState, useEffect } from "react";
import { Bell, MagnifyingGlass, List } from "@phosphor-icons/react";
import { UserButton, useUser } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

export default function Header({ role }: { role?: string }) {
 const { user } = useUser();
 const pathname = usePathname();
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

 const formattedPath = pathname
 .split("/")
 .pop()
 ?.replace(/-/g, " ")
 .replace(/\b\w/g, (c) => c.toUpperCase()) || "Dashboard";

 return (
 <header className="h-16 glass border-b border-white/10 flex items-center justify-between px-6 shrink-0 relative z-40">
 <div className="flex items-center gap-4">
 <button className="md:hidden p-2 text-muted hover:text-orange transition-colors">
 <List size={24} weight="duotone" />
 </button>
 <h1 className="hidden sm:block text-lg font-bold italic text-foreground tracking-tight">
 {formattedPath === 'Recruiter' || formattedPath === 'Candidate' ? 'Dashboard' : formattedPath}
 </h1>
 </div>

 <div className="flex items-center gap-3">
 <button className="p-2.5 rounded-full glass border border-white/10 text-muted hover:text-orange hover:bg-orange/5 transition-colors">
 <MagnifyingGlass size={20} weight="duotone" />
 </button>

 <div className="relative">
 <button 
 onClick={() => setShowDropdown(!showDropdown)}
 className="p-2.5 rounded-[12px] glass border border-white/10 text-muted hover:text-orange hover:bg-orange/5 transition-colors relative"
 >
 <Bell size={20} weight="duotone" />
 {unreadCount > 0 && (
 <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange rounded-full shadow-[0_0_8px_rgba(255,107,61,0.8)]" />
 )}
 </button>
 
 <AnimatePresence>
 {showDropdown && mounted && (
 <motion.div 
 initial={{ opacity: 0, scale: 0.95, y: -8 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: -8 }}
 transition={{ duration: 0.12, ease: "easeOut" }}
 className="absolute right-0 mt-3 w-80 glass bg-card/90 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-2xl max-h-96 overflow-y-auto z-50 overflow-hidden"
 >
 <div className="p-4 border-b border-white/10 font-bold text-foreground text-sm flex justify-between items-center">
 <span>Notifications</span>
 {unreadCount > 0 && <span className="bg-orange/20 text-orange px-2 py-0.5 rounded-full text-xs">{unreadCount} New</span>}
 </div>
 {notifications.length === 0 ? (
 <div className="p-6 text-center text-muted text-sm flex flex-col items-center gap-2">
 <Bell size={24} className="text-white/10" />
 No new notifications
 </div>
 ) : (
 <div className="py-1">
 {notifications.map(n => (
 <div 
 key={n.id} 
 onClick={() => markAsRead(n.id)}
 className={`px-4 py-3 border-b border-white/5 cursor-pointer hover:bg-orange/5 transition-colors ${!n.is_read ? 'bg-[linear-gradient(135deg,rgba(255,107,61,0.05),rgba(255,209,102,0.05))]' : ''}`}
 >
 <div className="flex justify-between items-start mb-1">
 <span className={`text-[10px] font-bold uppercase tracking-wider ${!n.is_read ? 'text-orange' : 'text-muted'}`}>{n.type}</span>
 {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-orange mt-1 shrink-0 shadow-[0_0_4px_rgba(255,107,61,0.6)]"></span>}
 </div>
 <p className="font-semibold text-foreground text-sm leading-tight mb-1">{n.title}</p>
 <p className="text-muted text-xs leading-relaxed">{n.message}</p>
 </div>
 ))}
 </div>
 )}
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 
 <div className="ml-2 pl-4 border-l border-white/10 flex items-center">
 <div className="p-0.5 rounded-full border-2 border-orange/40">
 <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: "w-8 h-8 rounded-full" } }} />
 </div>
 </div>
 </div>
 </header>
 );
}
