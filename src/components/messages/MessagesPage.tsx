"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function MessagesPage() {
  const { user } = useUser();
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) loadInitialData();
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
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
    const processedMatches = await Promise.all((mData || []).map(async (m: any) => {
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

  async function selectChat(match: any) {
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

    const { data: newMsg, error } = await supabase.from("direct_messages").insert({
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
      <div className="flex items-center justify-center h-full bg-[#1A1A1A] text-white">
        <p>Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#1A1A1A] overflow-hidden">
      {/* Left Column — Conversation List */}
      <div className="w-[320px] border-r border-[#2A2A2A] flex flex-col bg-[#111]">
        <div className="p-6 border-b border-[#2A2A2A]">
          <h1 className="text-xl font-bold text-white">Messages</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {matches.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              <p className="text-3xl mb-2">💬</p>
              <p className="text-sm">No matches yet. Accept a match to start chatting!</p>
            </div>
          ) : (
            matches.map((m) => (
              <div
                key={m.id}
                onClick={() => selectChat(m)}
                className={`p-4 cursor-pointer transition-colors border-l-4 ${
                  selectedMatch?.id === m.id
                    ? "bg-[#222] border-[#FF6B3D]"
                    : "hover:bg-[#1A1A1A] border-transparent"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-semibold text-white text-sm truncate w-[160px]">
                    {profile?.role === "recruiter" ? m.candidate_name : m.recruiter_name}
                  </h3>
                  {m.last_message_time && (
                    <span className="text-[10px] text-gray-500">
                      {new Date(m.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <p className="text-xs text-orange-500 font-medium truncate mb-1">
                  {profile?.role === "recruiter" ? m.job_title : m.company_name}
                </p>
                <div className="flex justify-between items-center">
                  <p className="text-[11px] text-gray-400 truncate w-[200px]">
                    {m.last_message}
                  </p>
                  {m.unread_count > 0 && (
                    <span className="bg-[#FF6B3D] text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
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
      <div className="flex-1 flex flex-col relative bg-[#1A1A1A]">
        {!selectedMatch ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <div className="text-6xl mb-4 text-[#2A2A2A]">💬</div>
            <p className="text-lg">Select a conversation to start messaging</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-[#2A2A2A] bg-[#222] flex items-center px-6 gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FF6B3D] flex items-center justify-center font-bold text-white">
                {(profile?.role === "recruiter" ? selectedMatch.candidate_name : selectedMatch.recruiter_name)?.[0]?.toUpperCase()}
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">
                  {profile?.role === "recruiter" ? selectedMatch.candidate_name : selectedMatch.recruiter_name}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-400">
                    {profile?.role === "recruiter" ? selectedMatch.job_title : selectedMatch.company_name}
                  </span>
                  <span className="text-[10px] text-green-500 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Connected
                  </span>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3 pb-32">
              {messages.length === 0 && (
                <div className="text-center py-10 text-gray-500">
                  <span className="text-2xl">👋</span>
                  <p className="text-sm mt-2">Chat unlocked! Say hello to {profile?.role === "recruiter" ? selectedMatch.candidate_name : selectedMatch.recruiter_name}</p>
                </div>
              )}
              {messages.map((msg, i) => {
                const isMe = msg.sender_id === profile.id;
                return (
                  <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] px-4 py-3 rounded-2xl relative ${
                        isMe
                          ? "bg-[#FF6B3D] text-white rounded-br-none"
                          : "bg-[#2A2A2A] text-gray-100 rounded-bl-none"
                      }`}
                    >
                      {!isMe && (
                        <p className="text-[10px] font-bold text-orange-400 mb-1">
                          {msg.profiles?.full_name}
                        </p>
                      )}
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <p className={`text-[9px] mt-1 ${isMe ? "text-orange-200" : "text-gray-500"} text-right`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Chat Input */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#1A1A1A] via-[#1A1A1A] to-transparent">
              <div className="flex gap-3 bg-[#222] p-2 rounded-2xl border border-[#333] shadow-xl">
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
                  className="flex-1 bg-transparent border-none outline-none text-white px-4 py-2 text-sm"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    input.trim() ? "bg-[#FF6B3D] text-white" : "bg-[#2A2A2A] text-gray-600"
                  }`}
                >
                  <span className="text-xl">→</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
