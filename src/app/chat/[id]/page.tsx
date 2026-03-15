/* eslint-disable */
// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
  _raw?: string;
  hasSuccess?: boolean;
  matchId?: string;
  isStreaming?: boolean;
  matchInfo?: any;
}

export default function ChatPage({ params }: { params: { id: string } }) {
  const { user } = useUser();
  const router = useRouter();

  // ALL STATE FIRST
  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"CANDIDATE" | "RECRUITER" | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);

  // REFS
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeConvo = params.id;

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto focus input after AI responds
  useEffect(() => {
    if (!loading) {
      inputRef.current?.focus();
    }
  }, [loading]);

  // Load role and messages
  useEffect(() => {
    if (user && activeConvo) {
      fetchData();
    }
  }, [user, activeConvo]);

  async function fetchData() {
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, id, clerk_user_id")
      .eq("clerk_user_id", user.id)
      .maybeSingle();

    if (profile) {
      const normalizedRole = profile.role?.toUpperCase() as "CANDIDATE" | "RECRUITER";
      setRole(normalizedRole);
      setProfileId(profile.id);

      // Load sidebar conversations
      const { data: convos } = await supabase
        .from("conversations")
        .select("id, created_at, messages")
        .eq("profile_id", profile.id)
        .order("created_at", { ascending: false });

      if (convos) {
        const formatted = convos.map((c: any) => {
          const firstUserMsg = c.messages?.find((m: any) => m.role === "user");
          const title = firstUserMsg
            ? (firstUserMsg.content.length > 30
              ? firstUserMsg.content.substring(0, 30) + "..."
              : firstUserMsg.content)
            : "New Conversation";
          return { ...c, title };
        });
        setConversations(formatted);
      }

      // Load messages for current conversation
      const { data: convoData } = await supabase
        .from("conversations")
        .select("id, messages")
        .eq("id", activeConvo)
        .maybeSingle();

      if (convoData) {
        const cleanHistory = (convoData.messages || []).map((msg: any) => ({
          ...msg,
          _raw: msg.content,
          content: msg.content
            .replace(/<PROFILE_DATA>[\s\S]*?<\/PROFILE_DATA>/g, "")
            .replace(/<JOB_DATA>[\s\S]*?<\/JOB_DATA>/g, "")
            .replace(/<NEGOTIATION_MATCH>[\s\S]*?<\/NEGOTIATION_MATCH>/g, "")
            .trim(),
          hasSuccess: msg.content.includes("<PROFILE_DATA>") || msg.content.includes("<JOB_DATA>"),
        }));

        if (cleanHistory.length === 0) {
          setMessages([{
            role: "assistant",
            content: normalizedRole === "RECRUITER"
              ? "Hi! I'm GAIA, your AI hiring agent. What role are you looking to fill today?"
              : "Hi! I'm GAIA, your AI talent agent. What kind of role are you looking for?"
          }]);
        } else {
          setMessages(cleanHistory);
        }
      } else {
        // No conversation found, show welcome
        setMessages([{
          role: "assistant",
          content: normalizedRole === "RECRUITER"
            ? "Hi! I'm GAIA, your AI hiring agent. What role are you looking to fill today?"
            : "Hi! I'm GAIA, your AI talent agent. What kind of role are you looking for?"
        }]);
      }
    }
  }

  const createConversation = async () => {
    if (!profileId) return;
    const newId = crypto.randomUUID();
    const { error } = await supabase
      .from("conversations")
      .insert({ id: newId, profile_id: profileId, messages: [] });

    if (!error) {
      router.push(`/chat/${newId}`);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || !activeConvo || !profileId || !role) return;

    const userMessage = input.trim();
    setInput("");

    const tempMsgs = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(tempMsgs);
    setLoading(true);

    try {
      const res = await fetch("/api/gaia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          conversationId: activeConvo,
          profileId,
          role
        }),
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "", isStreaming: true }
      ]);

      let finalContentText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkText = decoder.decode(value);
        finalContentText += chunkText;

        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;

          const displayContent = finalContentText
            .replace(/<PROFILE_DATA>[\s\S]*?<\/PROFILE_DATA>/g, "")
            .replace(/<JOB_DATA>[\s\S]*?<\/JOB_DATA>/g, "")
            .replace(/<NEGOTIATION_MATCH>[\s\S]*?<\/NEGOTIATION_MATCH>/g, "")
            .replace(/<NEGOTIATION_MATCH>[\s\S]*/, "")
            .replace(/<PROFILE_DATA>[\s\S]*/, "")
            .replace(/<JOB_DATA>[\s\S]*/, "")
            .trim();

          newMessages[lastIndex] = {
            ...newMessages[lastIndex],
            content: displayContent,
          };
          return newMessages;
        });
      }

      const hasSuccess = finalContentText.includes("<PROFILE_DATA>") || finalContentText.includes("<JOB_DATA>");
      setMessages(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, isStreaming: false, hasSuccess } : m));

    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setLoading(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  return (
    <div style={{
      display: "flex",
      height: "100vh",
      background: "#F7F6F3",
      fontFamily: "'Inter', sans-serif"
    }}>

      {/* ===== SIDEBAR ===== */}
      <div style={{
        width: "260px",
        background: "#FFFFFF",
        borderRight: "1px solid #E5E5E5",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0
      }}>
        {/* New Chat Button */}
        <div style={{ padding: "16px" }}>
          <button
            onClick={createConversation}
            style={{
              width: "100%",
              padding: "10px 16px",
              background: "#FF6B3D",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500"
            }}
          >
            + New Chat
          </button>
        </div>

        {/* Conversation List */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "0 8px"
        }}>
          <div style={{
            fontSize: "11px",
            fontWeight: "600",
            color: "#999",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            padding: "8px 12px",
            marginBottom: "4px"
          }}>
            Recent
          </div>
          {conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => router.push(`/chat/${c.id}`)}
              style={{
                padding: "10px 12px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                color: c.id === activeConvo ? "#1F1F1F" : "#666",
                background: c.id === activeConvo ? "#FFF5F2" : "transparent",
                borderLeft: c.id === activeConvo
                  ? "3px solid #FF6B3D"
                  : "3px solid transparent",
                marginBottom: "4px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap" as const
              }}
            >
              {c.title || "New Conversation"}
            </div>
          ))}
        </div>

        {/* Back to Dashboard */}
        <div style={{
          padding: "16px",
          borderTop: "1px solid #E5E5E5"
        }}>
          <a
            href={role ? `/dashboard/${role.toLowerCase()}` : "/role-select"}
            style={{
              fontSize: "13px",
              color: "#666",
              textDecoration: "none"
            }}
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>

      {/* ===== MAIN CHAT AREA ===== */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        position: "relative"
      }}>

        {/* Header */}
        <div style={{
          padding: "16px 24px",
          background: "#FFFFFF",
          borderBottom: "1px solid #E5E5E5",
          fontWeight: "600",
          fontSize: "16px",
          color: "#1F1F1F",
          flexShrink: 0
        }}>
          GAIA
        </div>

        {/* Messages Area */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px",
          paddingBottom: "120px"
        }}>
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                marginBottom: "16px",
                alignItems: "flex-start",
                gap: "8px"
              }}>
                {msg.role === "assistant" && (
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: "#FF6B3D",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: "600",
                    flexShrink: 0
                  }}>G</div>
                )}
                <div style={{
                  maxWidth: "70%",
                  padding: "12px 16px",
                  borderRadius: msg.role === "user"
                    ? "16px 16px 4px 16px"
                    : "16px 16px 16px 4px",
                  background: msg.role === "user"
                    ? "#FFF0EB" : "#FFFFFF",
                  border: msg.role === "user"
                    ? "1px solid #FFD4C4"
                    : "1px solid #EAEAEA",
                  fontSize: "15px",
                  lineHeight: "1.6",
                  color: "#1F1F1F",
                  whiteSpace: "pre-wrap" as const
                }}>
                  {msg.content}
                  {msg.hasSuccess && (
                    <div style={{
                      marginTop: "8px",
                      padding: "8px 12px",
                      background: "#E8F8F0",
                      border: "1px solid #A7E8C5",
                      borderRadius: "8px",
                      fontSize: "13px",
                      color: "#2ECC71",
                      fontWeight: "500"
                    }}>
                      ✓ {role === "CANDIDATE" ? "Profile data synchronized" : "Job listing active"}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && !messages[messages.length - 1]?.isStreaming && (
              <div style={{
                display: "flex",
                gap: "8px",
                alignItems: "flex-start",
                marginBottom: "16px"
              }}>
                <div style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "#FF6B3D",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: "600"
                }}>G</div>
                <div style={{
                  padding: "12px 16px",
                  background: "#FFFFFF",
                  border: "1px solid #EAEAEA",
                  borderRadius: "16px 16px 16px 4px",
                  color: "#999",
                  fontSize: "14px"
                }}>
                  GAIA is thinking...
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* ===== INPUT BAR (FIXED BOTTOM) ===== */}
        <div style={{
          position: "fixed",
          bottom: 0,
          right: 0,
          left: "260px",
          background: "#FFFFFF",
          borderTop: "1px solid #E5E5E5",
          padding: "16px 24px",
          display: "flex",
          gap: "12px",
          alignItems: "center",
          zIndex: 100
        }}>
          <form
            onSubmit={handleSend}
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              flex: 1,
              maxWidth: "800px",
              margin: "0 auto"
            }}
          >
            <input
              ref={inputRef}
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Message GAIA..."
              disabled={loading}
              style={{
                flex: 1,
                padding: "12px 20px",
                borderRadius: "24px",
                border: "1px solid #E5E5E5",
                fontSize: "15px",
                outline: "none",
                background: "#F7F6F3",
                color: "#1F1F1F"
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: input.trim() ? "#FF6B3D" : "#E5E5E5",
                border: "none",
                cursor: input.trim() ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                color: "white",
                transition: "background 200ms"
              }}
            >
              →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
