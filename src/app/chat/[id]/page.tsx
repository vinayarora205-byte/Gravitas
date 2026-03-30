"use client";

import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import {
  Paperclip,
  Image as ImageIcon,
  PaperPlaneRight,
  Plus,
  Checks,
  ArrowLeft,
} from "@phosphor-icons/react";

interface Message {
  role: "user" | "assistant";
  content: string;
  _raw?: string;
  hasSuccess?: boolean;
  isStreaming?: boolean;
  fileName?: string | null;
  fileType?: string | null;
  fileData?: string | null;
}

export default function ChatPage({ params }: { params: { id: string } }) {
  const { user } = useUser();
  const router = useRouter();

  const [conversations, setConversations] = useState<any[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"CANDIDATE" | "RECRUITER" | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const attachmentRef = useRef<HTMLInputElement>(null);

  const activeConvo = params.id;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!loading) inputRef.current?.focus();
  }, [loading]);

  useEffect(() => {
    if (user && activeConvo) fetchData();
  }, [user, activeConvo]);

  async function fetchData() {
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role, id")
      .eq("clerk_user_id", user.id)
      .maybeSingle();

    if (profile) {
      const normalizedRole = profile.role?.toUpperCase() as "CANDIDATE" | "RECRUITER";
      setRole(normalizedRole);
      setProfileId(profile.id);

      const { data: convos } = await supabase
        .from("conversations")
        .select("id, created_at, messages")
        .eq("profile_id", profile.id)
        .order("created_at", { ascending: false });

      if (convos) {
        setConversations(
          convos.map((c: any) => {
            const first = c.messages?.find((m: any) => m.role === "user");
            const title = first
              ? first.content.length > 28
                ? first.content.slice(0, 28) + "…"
                : first.content
              : "New Chat";
            return { ...c, title };
          })
        );
      }

      const { data: convoData } = await supabase
        .from("conversations")
        .select("id, messages")
        .eq("id", activeConvo)
        .maybeSingle();

      if (convoData) {
        const clean = (convoData.messages || []).map((msg: any) => ({
          ...msg,
          content: msg.content
            .replace(/<PROFILE_DATA>[\s\S]*?<\/PROFILE_DATA>/g, "")
            .replace(/<JOB_DATA>[\s\S]*?<\/JOB_DATA>/g, "")
            .replace(/<NEGOTIATION_MATCH>[\s\S]*?<\/NEGOTIATION_MATCH>/g, "")
            .trim(),
          hasSuccess:
            msg.content.includes("<PROFILE_DATA>") ||
            msg.content.includes("<JOB_DATA>"),
        }));

        setMessages(
          clean.length === 0
            ? [
                {
                  role: "assistant",
                  content:
                    normalizedRole === "RECRUITER"
                      ? "Hi! I'm Claura, your AI-powered hiring agent. Ready to define your next stellar hire?"
                      : "Hi! I'm Claura, your career intelligence agent. How can I help you find your next move today?",
                },
              ]
            : clean
        );
      }
    }
  }

  const createConversation = async () => {
    if (!profileId) return;
    const { data: newConvo } = await supabase
      .from("conversations")
      .insert({ profile_id: profileId, messages: [] })
      .select()
      .maybeSingle();
    if (newConvo) router.push(`/chat/${newConvo.id}`);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(file.type.startsWith("image/") ? URL.createObjectURL(file) : null);
    }
  };

  const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
    });

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!input.trim() && !selectedFile) || !activeConvo || !profileId || !role) return;

    const userMessage = input.trim();
    setInput("");

    let fileData = null, fileName = null, fileType = null;
    if (selectedFile) {
      fileName = selectedFile.name;
      fileType = selectedFile.type;
      fileData = await getBase64(selectedFile);
    }
    const currentPreview = previewUrl;
    setSelectedFile(null);
    setPreviewUrl(null);

    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMessage, fileName, fileType, fileData: currentPreview || undefined },
    ]);
    setLoading(true);

    try {
      const res = await fetch("/api/claura", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, conversationId: activeConvo, profileId, role, fileData, fileName, fileType }),
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      setMessages((prev) => [...prev, { role: "assistant", content: "", isStreaming: true }]);

      let fullText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value);
        const display = fullText
          .replace(/<PROFILE_DATA>[\s\S]*?<\/PROFILE_DATA>/g, "")
          .replace(/<JOB_DATA>[\s\S]*?<\/JOB_DATA>/g, "")
          .replace(/<NEGOTIATION_MATCH>[\s\S]*?<\/NEGOTIATION_MATCH>/g, "")
          .replace(/<PROFILE_DATA>[\s\S]*/, "")
          .replace(/<JOB_DATA>[\s\S]*/, "")
          .trim();
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { ...next[next.length - 1], content: display };
          return next;
        });
      }

      const hasSuccess =
        fullText.includes("<PROFILE_DATA>") || fullText.includes("<JOB_DATA>");
      setMessages((prev) =>
        prev.map((m, i) =>
          i === prev.length - 1 ? { ...m, isStreaming: false, hasSuccess } : m
        )
      );
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen font-sans overflow-hidden" style={{ background: "#F6F1EB" }}>

      {/* ── SIDEBAR ── */}
      <div
        className="w-[240px] bg-white flex flex-col shrink-0 hidden md:flex"
        style={{ borderRight: "1px solid #E8E3DD" }}
      >
        {/* Header */}
        <div className="p-5" style={{ borderBottom: "1px solid #E8E3DD" }}>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-7 h-7 rounded-full bg-[#FF6A2A] flex items-center justify-center text-white font-bold text-sm font-serif">C</div>
            <span className="font-serif text-[17px] font-bold italic text-[#0F0F0F]">Claura</span>
            <div className="ml-auto flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[11px] text-green-600 font-medium">Online</span>
            </div>
          </div>

          <button
            onClick={createConversation}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[10px] text-[14px] font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: "#0F0F0F" }}
          >
            <Plus size={15} weight="bold" />
            New Chat
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto py-3 px-2 scrollbar-hide">
          <div className="px-3 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">History</div>
          {conversations.map((c) => {
            const isActive = c.id === activeConvo;
            return (
              <button
                key={c.id}
                onClick={() => router.push(`/chat/${c.id}`)}
                className="w-full text-left px-3 py-3 rounded-[8px] text-[13px] font-medium transition-colors truncate block"
                style={{
                  background: isActive ? "#FFF3EE" : "transparent",
                  color: isActive ? "#FF6A2A" : "#666",
                  borderLeft: isActive ? "2px solid #FF6A2A" : "2px solid transparent",
                }}
                onMouseEnter={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = "#F6F1EB";
                }}
                onMouseLeave={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                {c.title}
              </button>
            );
          })}
        </div>

        {/* Back button */}
        <div className="p-4" style={{ borderTop: "1px solid #E8E3DD" }}>
          <button
            onClick={() => router.push(role ? `/dashboard/${role.toLowerCase()}` : "/role-select")}
            className="flex items-center gap-2 text-[12px] font-medium text-gray-400 hover:text-[#0F0F0F] transition-colors"
          >
            <ArrowLeft size={14} weight="bold" /> Back to Dashboard
          </button>
        </div>
      </div>

      {/* ── MAIN CHAT ── */}
      <div className="flex-1 flex flex-col relative h-full">

        {/* Chat Header */}
        <div className="bg-white px-6 py-4 flex items-center gap-4 shrink-0" style={{ borderBottom: "1px solid #E8E3DD" }}>
          <div className="w-9 h-9 rounded-full bg-[#FF6A2A] flex items-center justify-center text-white font-bold font-serif text-sm">C</div>
          <div>
            <div className="font-serif text-[17px] font-bold italic text-[#0F0F0F]">Claura</div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-[12px] text-gray-400 font-medium">Your AI Hiring Agent · Online</span>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 md:px-12 py-8 scrollbar-hide pb-28">
          <div className="max-w-[720px] mx-auto space-y-6">
            {messages.map((msg, i) => {
              const isUser = msg.role === "user";
              return (
                <div key={i} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-3 max-w-[75%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
                    {/* Avatar */}
                    <div
                      className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white text-[12px] font-bold"
                      style={{ background: isUser ? "#0F0F0F" : "#FF6A2A" }}
                    >
                      {isUser ? "U" : "C"}
                    </div>

                    <div className="space-y-1.5">
                      {/* File attachment preview */}
                      {msg.fileName && (
                        <div
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-medium mb-1"
                          style={{ background: "rgba(0,0,0,0.05)" }}
                        >
                          <Paperclip size={14} />
                          <span className="truncate">{msg.fileName}</span>
                        </div>
                      )}

                      {/* Message bubble */}
                      <div
                        className="px-4 py-3 text-[14px] leading-[1.6] font-medium whitespace-pre-wrap"
                        style={{
                          background: isUser ? "#0F0F0F" : "white",
                          color: isUser ? "white" : "#0F0F0F",
                          border: isUser ? "none" : "1px solid #E8E3DD",
                          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                        }}
                      >
                        {msg.content || (msg.isStreaming ? "" : "…")}
                        {msg.isStreaming && (
                          <span className="inline-flex gap-1 ml-2 align-middle">
                            <span className="dot-bounce" />
                            <span className="dot-bounce" />
                            <span className="dot-bounce" />
                          </span>
                        )}
                      </div>

                      {/* Success badge */}
                      {msg.hasSuccess && (
                        <div
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold w-fit"
                          style={{ background: "#E8F5E9", color: "#2E7D32" }}
                        >
                          <Checks size={13} weight="bold" /> Profile Saved
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {loading && !messages[messages.length - 1]?.isStreaming && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#FF6A2A]/20 flex items-center justify-center text-[#FF6A2A] font-bold text-[12px]">C</div>
                <div
                  className="px-4 py-3 flex items-center gap-1.5"
                  style={{
                    background: "white",
                    border: "1px solid #E8E3DD",
                    borderRadius: "18px 18px 18px 4px",
                  }}
                >
                  <span className="dot-bounce" />
                  <span className="dot-bounce" />
                  <span className="dot-bounce" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* ── INPUT BAR ── */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-white px-5 md:px-12 py-4"
          style={{ borderTop: "1px solid #E8E3DD" }}
        >
          {/* File preview */}
          {selectedFile && (
            <div
              className="flex items-center gap-3 mb-3 px-4 py-3 rounded-xl text-[13px]"
              style={{ background: "#F6F1EB", border: "1px solid #E8E3DD" }}
            >
              {previewUrl ? (
                <img src={previewUrl} className="w-10 h-10 rounded-lg object-cover" alt="preview" />
              ) : (
                <Paperclip size={20} color="#FF6A2A" />
              )}
              <span className="font-medium text-[#0F0F0F] truncate flex-1">{selectedFile.name}</span>
              <button
                onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                className="text-gray-400 hover:text-red-500 transition-colors text-lg leading-none"
              >×</button>
            </div>
          )}

          <form
            onSubmit={handleSend}
            className="max-w-[720px] mx-auto flex items-center gap-3"
          >
            {/* Attachment buttons */}
            <input type="file" ref={attachmentRef} className="hidden" accept=".pdf,.doc,.docx" onChange={handleFileSelect} />
            <button
              type="button"
              onClick={() => attachmentRef.current?.click()}
              className="text-gray-400 hover:text-[#FF6A2A] transition-colors p-2"
            >
              <Paperclip size={20} />
            </button>

            {/* Text input */}
            <input
              ref={inputRef}
              autoFocus
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message Claura..."
              disabled={loading}
              className="flex-1 py-2.5 px-5 text-[14px] font-medium text-[#0F0F0F] outline-none transition-colors"
              style={{
                background: "#F6F1EB",
                border: "1px solid #E8E3DD",
                borderRadius: "24px",
              }}
              onFocus={e => (e.currentTarget.style.borderColor = "#FF6A2A")}
              onBlur={e => (e.currentTarget.style.borderColor = "#E8E3DD")}
            />

            {/* Send button */}
            <button
              type="submit"
              disabled={(!input.trim() && !selectedFile) || loading}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
              style={{
                background: (input.trim() || selectedFile) ? "#FF6A2A" : "#E8E3DD",
                transform: "scale(1)",
              }}
              onMouseEnter={e => {
                if (input.trim() || selectedFile)
                  (e.currentTarget as HTMLElement).style.transform = "scale(1.05)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = "scale(1)";
              }}
            >
              <PaperPlaneRight size={18} weight="fill" color={input.trim() || selectedFile ? "white" : "#aaa"} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
