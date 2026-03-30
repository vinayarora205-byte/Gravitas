"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { PaperPlaneTilt, CheckCircle, MagnifyingGlass } from "@phosphor-icons/react";

interface Profile { id: string; full_name: string; role: string; }
interface Match {
  id: string; chat_unlocked: boolean; created_at: string;
  job_title: string; company_name: string;
  recruiter_name: string; recruiter_profile_id: string;
  candidate_job_title: string; candidate_name: string; candidate_profile_id: string;
  last_message?: string; last_message_time?: string; unread_count?: number;
}
interface Message {
  id: string; sender_id: string; content: string;
  created_at: string; match_id: string;
  profiles?: { full_name: string } | { full_name: string }[];
}

function getInitials(name: string) {
  return name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
}

const avatarColors = ["#FF6A2A","#0F0F0F","#2E7D32","#1565C0","#6A1B9A","#AD1457"];
function getColor(name: string) {
  let h = 0;
  for (const c of name || "") h = (h * 31 + c.charCodeAt(0)) % avatarColors.length;
  return avatarColors[h];
}

export default function MessagesPage() {
  const { user } = useUser();
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchingMessages, setFetchingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (user) loadInitialData(); }, [user]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    if (!profile) return;
    const channel = supabase
      .channel("global-messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "direct_messages" }, async (payload) => {
        const newMsg = payload.new;
        if (selectedMatch && newMsg.match_id === selectedMatch.id) {
          const { data: fullMsg } = await supabase.from("direct_messages")
            .select("*, profiles:sender_id(full_name)").eq("id", newMsg.id).single();
          if (fullMsg) {
            setMessages(prev => [...prev, fullMsg]);
            if (newMsg.sender_id !== profile.id) markAsRead(selectedMatch.id);
          }
        }
        fetchMatches(profile.id);
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile, selectedMatch]);

  async function loadInitialData() {
    const { data: p } = await supabase.from("profiles")
      .select("id, full_name, role").eq("clerk_user_id", user!.id).single();
    if (!p) return;
    setProfile(p);
    await fetchMatches(p.id);
    setLoading(false);
  }

  async function fetchMatches(profileId: string) {
    const { data: mData } = await supabase.rpc("get_unlocked_matches_with_details", { user_profile_id: profileId });
    const processed = await Promise.all((mData || []).map(async (m: Match) => {
      const { data: lastMsg } = await supabase.from("direct_messages")
        .select("content, created_at").eq("match_id", m.id)
        .order("created_at", { ascending: false }).limit(1).maybeSingle();
      const { count } = await supabase.from("direct_messages")
        .select("*", { count: "exact", head: true })
        .eq("match_id", m.id).eq("is_read", false).neq("sender_id", profileId);
      return { ...m, last_message: lastMsg?.content || "No messages yet", last_message_time: lastMsg?.created_at, unread_count: count || 0 };
    }));
    setMatches(processed);
  }

  async function selectChat(match: Match) {
    setSelectedMatch(match);
    setFetchingMessages(true);
    const { data: msgs } = await supabase.from("direct_messages")
      .select("*, profiles:sender_id(full_name)").eq("match_id", match.id).order("created_at", { ascending: true });
    setMessages(msgs || []);
    setFetchingMessages(false);
    await markAsRead(match.id);
    setMatches(prev => prev.map(m => m.id === match.id ? { ...m, unread_count: 0 } : m));
  }

  async function markAsRead(matchId: string) {
    if (!profile) return;
    await supabase.from("direct_messages").update({ is_read: true })
      .eq("match_id", matchId).neq("sender_id", profile.id).eq("is_read", false);
  }

  async function sendMessage() {
    if (!input.trim() || !profile || !selectedMatch) return;
    const content = input.trim();
    setInput("");
    const { data: newMsg } = await supabase.from("direct_messages")
      .insert({ match_id: selectedMatch.id, sender_id: profile.id, content })
      .select("*, profiles:sender_id(full_name)").single();
    if (newMsg) {
      setMessages(prev => [...prev, newMsg]);
      setMatches(prev => prev.map(m => m.id === selectedMatch.id ? { ...m, last_message: content, last_message_time: new Date().toISOString() } : m));
    }
    inputRef.current?.focus();
  }

  const otherName = (m: Match) => profile?.role === "recruiter" ? m.candidate_name : m.recruiter_name;
  const contextLabel = (m: Match) => profile?.role === "recruiter" ? m.job_title : m.company_name;
  const filtered = matches.filter(m => otherName(m)?.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-[#E8E3DD] border-t-[#FF6A2A] animate-spin" />
          <span className="text-[12px] text-gray-400 font-medium">Loading messages…</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex overflow-hidden font-sans"
      style={{ height: "calc(100vh - 64px)", margin: "-24px -40px -24px -40px" }}
    >
      {/* ── LEFT: Conversation List ── */}
      <div className="w-[300px] bg-white flex flex-col shrink-0" style={{ borderRight: "1px solid #E8E3DD" }}>
        {/* Header */}
        <div className="px-6 pt-6 pb-4" style={{ borderBottom: "1px solid #E8E3DD" }}>
          <h1 className="font-serif text-[20px] font-bold italic text-[#0F0F0F] mb-4">Messages</h1>
          <div className="relative">
            <MagnifyingGlass size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Search conversations…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-[13px] font-medium text-[#0F0F0F] placeholder:text-gray-400 outline-none transition-colors"
              style={{
                background: "#F6F1EB",
                border: "1px solid #E8E3DD",
                borderRadius: "10px",
              }}
            />
          </div>
        </div>

        {/* Conversation items */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <div className="text-[13px] font-medium">No conversations yet</div>
              <div className="text-[12px] mt-1">Unlock a match to start chatting</div>
            </div>
          ) : (
            filtered.map((m) => {
              const isActive = selectedMatch?.id === m.id;
              const name = otherName(m) || "Unknown";
              const color = getColor(name);
              return (
                <button
                  key={m.id}
                  onClick={() => selectChat(m)}
                  className="w-full text-left px-5 py-4 transition-colors flex items-start gap-3 relative"
                  style={{
                    borderBottom: "1px solid #F0EDE8",
                    background: isActive ? "#FFF3EE" : "white",
                    borderLeft: isActive ? "3px solid #FF6A2A" : "3px solid transparent",
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "#FAFAFA"; }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "white"; }}
                >
                  {/* Avatar */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-[13px] shrink-0"
                    style={{ background: color }}
                  >
                    {getInitials(name)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[14px] font-bold text-[#0F0F0F] truncate">{name}</span>
                      {m.last_message_time && (
                        <span className="text-[11px] text-gray-300 ml-2 shrink-0">
                          {new Date(m.last_message_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                    <div className="text-[12px] text-[#FF6A2A] font-medium truncate mb-1">{contextLabel(m)}</div>
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] text-gray-400 truncate flex-1">{m.last_message}</p>
                      {(m.unread_count ?? 0) > 0 && (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold ml-2 shrink-0"
                          style={{ background: "#FF6A2A" }}
                        >
                          {m.unread_count}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── RIGHT: Chat Window ── */}
      <div className="flex-1 flex flex-col" style={{ background: "#F6F1EB" }}>
        {!selectedMatch ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-white">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ border: "1px solid #E8E3DD" }}
            >
              <PaperPlaneTilt size={28} weight="duotone" className="opacity-30" />
            </div>
            <p className="text-[14px] font-medium">Select a conversation</p>
            <p className="text-[12px] mt-1">Choose from the list to start messaging</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full">
            {/* Chat Header */}
            <div
              className="bg-white px-7 py-4 flex items-center gap-4 shrink-0"
              style={{ borderBottom: "1px solid #E8E3DD" }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-[13px] shrink-0"
                style={{ background: getColor(otherName(selectedMatch) || "") }}
              >
                {getInitials(otherName(selectedMatch) || "")}
              </div>
              <div>
                <h2 className="font-serif text-[17px] font-bold italic text-[#0F0F0F]">
                  {otherName(selectedMatch)}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[12px] text-[#FF6A2A] font-medium">{contextLabel(selectedMatch)}</span>
                  <div className="w-1 h-1 rounded-full bg-gray-300" />
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-[12px] text-green-600 font-medium">Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto px-7 py-6 space-y-4 scrollbar-hide pb-24" style={{ background: "#F6F1EB" }}>
              {fetchingMessages ? (
                <div className="flex justify-center pt-12">
                  <div className="w-8 h-8 rounded-full border-2 border-[#E8E3DD] border-t-[#FF6A2A] animate-spin" />
                </div>
              ) : (
                <>
                  {messages.length === 0 && (
                    <div className="text-center py-16 text-gray-400">
                      <p className="text-[14px] font-medium mb-1">No messages yet</p>
                      <p className="text-[13px]">Say hello to {otherName(selectedMatch)}!</p>
                    </div>
                  )}
                  {messages.map((msg, i) => {
                    const isMe = msg.sender_id === profile?.id;
                    return (
                      <div key={msg.id || i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] space-y-1 flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                          <div
                            className="px-4 py-3 text-[14px] font-medium leading-[1.6]"
                            style={{
                              background: isMe ? "#0F0F0F" : "white",
                              color: isMe ? "white" : "#0F0F0F",
                              border: isMe ? "none" : "1px solid #E8E3DD",
                              borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                            }}
                          >
                            {msg.content}
                          </div>
                          <div className="flex items-center gap-1.5 px-1">
                            <span className="text-[11px] text-gray-400">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            {isMe && <CheckCircle size={11} color="#FF6A2A" weight="fill" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </>
              )}
            </div>

            {/* Input Bar */}
            <div
              className="bg-white px-7 py-4 absolute bottom-0 left-[300px] right-0"
              style={{ borderTop: "1px solid #E8E3DD" }}
            >
              <div className="flex items-center gap-3">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder={`Message ${otherName(selectedMatch)}…`}
                  className="flex-1 py-2.5 px-5 text-[14px] font-medium text-[#0F0F0F] outline-none transition-colors"
                  style={{
                    background: "#F6F1EB",
                    border: "1px solid #E8E3DD",
                    borderRadius: "24px",
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = "#FF6A2A")}
                  onBlur={e => (e.currentTarget.style.borderColor = "#E8E3DD")}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
                  style={{ background: input.trim() ? "#FF6A2A" : "#E8E3DD" }}
                  onMouseEnter={e => { if (input.trim()) (e.currentTarget as HTMLElement).style.transform = "scale(1.05)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                >
                  <PaperPlaneTilt size={17} weight="fill" color={input.trim() ? "white" : "#aaa"} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
