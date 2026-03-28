"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface Profile {
 id: string;
 full_name: string;
 role: string;
}

interface Match {
 id: string;
 chat_unlocked: boolean;
 created_at: string;
 job_title: string;
 company_name: string;
 recruiter_name: string;
 recruiter_profile_id: string;
 candidate_job_title: string;
 candidate_name: string;
 candidate_profile_id: string;
 last_message?: string;
 last_message_time?: string;
 unread_count?: number;
}

interface Message {
 id: string;
 sender_id: string;
 content: string;
 created_at: string;
 match_id: string;
 profiles?: { full_name: string } | { full_name: string }[];
}


export default function MessagesPage() {
 const { user } = useUser();
 // router removed to fix unused variable warning
 const [matches, setMatches] = useState<Match[]>([]);
 const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
 const [messages, setMessages] = useState<Message[]>([]);
 const [input, setInput] = useState("");
 const [profile, setProfile] = useState<Profile | null>(null);
 const [loading, setLoading] = useState(true);
 const bottomRef = useRef<HTMLDivElement>(null);
 const inputRef = useRef<HTMLInputElement>(null);

 useEffect(() => {
 if (user) loadInitialData();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [user]);

 useEffect(() => {
 bottomRef.current?.scrollIntoView({ behavior: "smooth" });
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [messages]);

 // Subscribe to new messages globally for unread counts and current chat
 useEffect(() => {
 if (!profile) return;

 const channel = supabase
 .channel("global-messages")
 .on(
 "postgres_changes",
 { event: "INSERT", schema: "public", table: "direct_messages" },
 async (payload) => {
 const newMsg = payload.new;

 // 1. If it belongs to current selected chat, add to messages
 if (selectedMatch && newMsg.match_id === selectedMatch.id) {
 // Fetch with profile
 const { data: fullMsg } = await supabase
 .from("direct_messages")
 .select("*, profiles:sender_id(full_name)")
 .eq("id", newMsg.id)
 .single();
 if (fullMsg) {
 setMessages((prev) => [...prev, fullMsg]);
 // Mark as read immediately if active
 if (newMsg.sender_id !== profile.id) {
 markAsRead(selectedMatch.id);
 }
 }
 }

 // 2. Refresh match list to update previews and unread counts
 fetchMatches(profile.id);
 }
 )
 .subscribe();

 return () => {
 supabase.removeChannel(channel);
 };
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [profile, selectedMatch]);

 async function loadInitialData() {
 const { data: p } = await supabase
 .from("profiles")
 .select("id, full_name, role")
 .eq("clerk_user_id", user!.id)
 .single();
 
 if (!p) return;
 setProfile(p);
 await fetchMatches(p.id);
 setLoading(false);
 }

 async function fetchMatches(profileId: string) {
 // Complex query to get unlocked matches with other party details
 const { data: mData, error } = await supabase
 .rpc('get_unlocked_matches_with_details', { user_profile_id: profileId });

 if (error) {
 console.error("Error fetching matches:", error);
 // Fallback or handle error
 return;
 }

 // Process matches to include unread counts and last message
 const processedMatches = await Promise.all((mData || []).map(async (m: Match) => {
 // Get last message
 const { data: lastMsg } = await supabase
 .from("direct_messages")
 .select("content, created_at")
 .eq("match_id", m.id)
 .order("created_at", { ascending: false })
 .limit(1)
 .maybeSingle();

 // Get unread count
 const { count } = await supabase
 .from("direct_messages")
 .select("*", { count: 'exact', head: true })
 .eq("match_id", m.id)
 .eq("is_read", false)
 .neq("sender_id", profileId);

 return {
 ...m,
 last_message: lastMsg?.content || "No messages yet",
 last_message_time: lastMsg?.created_at,
 unread_count: count || 0
 };
 }));

 setMatches(processedMatches);
 }

 async function selectChat(match: Match) {
 setSelectedMatch(match);
 setLoading(true);

 // Load messages
 const { data: msgs } = await supabase
 .from("direct_messages")
 .select("*, profiles:sender_id(full_name)")
 .eq("match_id", match.id)
 .order("created_at", { ascending: true });

 setMessages(msgs || []);
 setLoading(false);

 // Mark as read
 await markAsRead(match.id);
 // Refresh match list to clear badge locally
 setMatches(prev => prev.map(m => m.id === match.id ? { ...m, unread_count: 0 } : m));
 }

 async function markAsRead(matchId: string) {
 if (!profile) return;
 await supabase
 .from("direct_messages")
 .update({ is_read: true })
 .eq("match_id", matchId)
 .neq("sender_id", profile.id)
 .eq("is_read", false);
 }

 async function sendMessage() {
 if (!input.trim() || !profile || !selectedMatch) return;
 const content = input.trim();
 setInput("");

 const { data: newMsg, error: _error } = await supabase.from("direct_messages").insert({
 match_id: selectedMatch.id,
 sender_id: profile.id,
 content,
 }).select("*, profiles:sender_id(full_name)").single();

 if (newMsg) {
 setMessages((prev) => [...prev, newMsg]);
 // Update preview in match list locally
 setMatches(prev => prev.map(m => m.id === selectedMatch.id ? { ...m, last_message: content, last_message_time: new Date().toISOString() } : m));
 }
 
 inputRef.current?.focus();
 }

 if (loading && !selectedMatch) {
 return (
 <div className="flex items-center justify-center h-full">
 <div className="w-8 h-8 rounded-full border-4 border-orange border-t-transparent animate-spin"></div>
 </div>
 );
 }

 return (
 <div className="flex h-[calc(100vh-64px)] overflow-hidden m-[-24px] lg:m-[-40px]">
 <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,107,61,0.03),rgba(255,209,102,0.02))] z-[-1]" />
 
 {/* Left Column — Conversation List */}
 <div className="w-[320px] glass border-r border-white/10 flex flex-col shrink-0 z-10">
 <div className="p-6 border-b border-white/5">
 <h1 className="text-xl font-extrabold text-foreground italic tracking-tight">Messages</h1>
 </div>
 <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
 {matches.length === 0 ? (
 <div className="p-8 text-center text-muted flex flex-col items-center">
 <span className="text-3xl mb-3 opacity-50">💬</span>
 <p className="text-sm font-medium leading-relaxed">No matches yet. Accept a match to start chatting!</p>
 </div>
 ) : (
 matches.map((m) => (
 <div
 key={m.id}
 onClick={() => selectChat(m)}
 className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 mb-2 border ${
 selectedMatch?.id === m.id
 ? "bg-[linear-gradient(135deg,rgba(255,107,61,0.1),rgba(255,209,102,0.05))] border-orange/30 shadow-sm"
 : "hover:bg-white/5 border-transparent"
 }`}
 >
 <div className="flex justify-between items-start mb-1.5">
 <h3 className={`font-bold text-sm truncate w-[160px] ${selectedMatch?.id === m.id ? 'text-foreground' : 'text-foreground'}`}>
 {profile?.role === "recruiter" ? m.candidate_name : m.recruiter_name}
 </h3>
 {m.last_message_time && (
 <span className="text-[10px] font-semibold text-muted">
 {new Date(m.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
 </span>
 )}
 </div>
 <p className="text-[11px] text-orange font-bold truncate mb-2 uppercase tracking-wide flex items-center gap-1">
 <span>💼</span> {profile?.role === "recruiter" ? m.job_title : m.company_name}
 </p>
 <div className="flex justify-between items-center gap-2">
 <p className="text-xs text-muted truncate flex-1 font-medium">
 {m.last_message}
 </p>
 {(m.unread_count ?? 0) > 0 && (
 <span className="bg-orange text-white text-[10px] font-bold h-5 min-w-[20px] px-1.5 rounded-full flex items-center justify-center shadow-[0_0_8px_rgba(255,107,61,0.6)] shrink-0">
 {m.unread_count}
 </span>
 )}
 </div>
 </div>
 ))
 )}
 </div>
 </div>

 {/* Right Column — Chat Window */}
 <div className="flex-1 flex flex-col relative z-0">
 {!selectedMatch ? (
 <div className="flex-1 flex flex-col items-center justify-center text-muted">
 <div className="w-16 h-16 rounded-full glass mb-4 flex items-center justify-center shadow-lg border border-white/10 text-2xl">
 💬
 </div>
 <p className="text-[15px] font-semibold">Select a conversation to start messaging</p>
 </div>
 ) : (
 <>
 {/* Chat Header */}
 <div className="h-[72px] glass border-b border-white/10 flex items-center px-6 gap-4 shrink-0 shadow-sm z-20">
 <div className="w-11 h-11 rounded-full bg-[linear-gradient(135deg,#FF6B3D,#FF8C5A)] flex items-center justify-center font-bold text-white shadow-[0_0_10px_rgba(255,107,61,0.4)] text-lg">
 {(profile?.role === "recruiter" ? selectedMatch.candidate_name : selectedMatch.recruiter_name)?.[0]?.toUpperCase()}
 </div>
 <div className="flex-1">
 <h2 className="text-base font-extrabold text-foreground italic tracking-tight">
 {profile?.role === "recruiter" ? selectedMatch.candidate_name : selectedMatch.recruiter_name}
 </h2>
 <div className="flex items-center gap-3 mt-0.5">
 <span className="text-[11px] font-semibold text-muted flex items-center gap-1 uppercase tracking-wider">
 {profile?.role === "recruiter" ? selectedMatch.job_title : selectedMatch.company_name}
 </span>
 <span className="w-1 h-1 rounded-full bg-white/20"></span>
 <span className="text-[11px] text-green-500 font-bold flex items-center gap-1">
 <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)]"></span>
 Online
 </span>
 </div>
 </div>
 </div>

 {/* Chat Messages */}
 <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 pb-32">
 {messages.length === 0 && (
 <div className="text-center py-12 text-muted max-w-sm mx-auto">
 <div className="w-16 h-16 rounded-full glass mx-auto mb-4 flex items-center justify-center shadow-lg border border-white/10 text-2xl">👋</div>
 <p className="text-sm font-semibold">Chat unlocked!</p>
 <p className="text-xs mt-1">Say hello to {profile?.role === "recruiter" ? selectedMatch?.candidate_name : selectedMatch?.recruiter_name}</p>
 </div>
 )}
 {messages.map((msg: Message, i) => {
 const isMe = msg.sender_id === profile?.id;
 return (
 <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
 <div
 className={`max-w-[75%] px-4 py-3 rounded-2xl relative shadow-sm ${
 isMe
 ? "bg-orange/10 border border-orange/20 text-foreground rounded-br-sm"
 : "glass border border-white/10 text-foreground rounded-bl-sm"
 }`}
 >
 {!isMe && (
 <p className="text-[10px] font-extrabold uppercase tracking-wider text-orange mb-1">
 {Array.isArray(msg.profiles) ? (msg.profiles[0] as any)?.full_name : (msg.profiles as any)?.full_name}
 </p>
 )}
 <p className="text-[14px] leading-relaxed font-medium">{msg.content}</p>
 <p className={`text-[10px] mt-2 font-semibold ${isMe ? "text-orange/60" : "text-muted"} text-right`}>
 {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
 </p>
 </div>
 </div>
 );
 })}
 <div ref={bottomRef} className="h-4" />
 </div>

 {/* Chat Input */}
 <div className="absolute bottom-6 left-0 right-0 px-6 z-20">
 <div className="max-w-[800px] mx-auto relative glass border border-white/10 rounded-full p-2 flex items-center gap-2 shadow-[0_8px_32px_rgba(0,0,0,0.1)] focus-within:border-orange/50 focus-within:shadow-[0_0_20px_rgba(255,107,61,0.2)] transition-all duration-300">
 <input
 ref={inputRef}
 value={input}
 onChange={(e) => setInput(e.target.value)}
 onKeyDown={(e) => {
 if (e.key === "Enter" && !e.shiftKey) {
 e.preventDefault();
 sendMessage();
 }
 }}
 autoFocus
 placeholder={`Message ${profile?.role === "recruiter" ? selectedMatch.candidate_name : selectedMatch.recruiter_name}...`}
 className="flex-1 bg-transparent border-none outline-none text-foreground px-4 py-2 text-[15px] font-medium placeholder:text-muted"
 />
 <button
 onClick={sendMessage}
 disabled={!input.trim()}
 className={`w-[44px] h-[44px] rounded-full flex items-center justify-center transition-all duration-300 shrink-0 ${
 input.trim() 
 ? "bg-orange text-white shadow-[0_4px_12px_rgba(255,107,61,0.4)] hover:scale-105" 
 : "bg-black/5 text-muted cursor-not-allowed"
 }`}
 >
 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
 </button>
 </div>
 </div>
 </>
 )}
 </div>
 </div>
 );
}
