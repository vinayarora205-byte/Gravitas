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
  fileName?: string;
  fileType?: string;
  fileData?: string;
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // REFS
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const attachmentRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

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
              ? "Hi! I'm Claura, your AI hiring agent. What role are you looking to fill today?"
              : "Hi! I'm Claura, your AI talent agent. What kind of role are you looking for?"
          }]);
        } else {
          setMessages(cleanHistory);
        }
      } else {
        // No conversation found, show welcome
        setMessages([{
          role: "assistant",
          content: normalizedRole === "RECRUITER"
            ? "Hi! I'm Claura, your AI hiring agent. What role are you looking to fill today?"
            : "Hi! I'm Claura, your AI talent agent. What kind of role are you looking for?"
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (file.type.startsWith("image/")) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!input.trim() && !selectedFile) || !activeConvo || !profileId || !role) return;

    const userMessage = input.trim();
    setInput("");
    
    let fileData = null;
    let fileName = null;
    let fileType = null;
    
    if (selectedFile) {
      fileName = selectedFile.name;
      fileType = selectedFile.type;
      fileData = await getBase64(selectedFile);
    }

    const currentFile = selectedFile;
    const currentPreviewUrl = previewUrl;

    setSelectedFile(null);
    setPreviewUrl(null);

    const tempMsgs = [...messages, { 
      role: "user" as const, 
      content: userMessage,
      fileName,
      fileType,
      fileData: currentPreviewUrl || undefined
    }];
    setMessages(tempMsgs);
    setLoading(true);

    try {
      const res = await fetch("/api/claura", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          conversationId: activeConvo,
          profileId,
          role,
          fileData,
          fileName,
          fileType
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
    <div className="flex h-screen bg-background relative overflow-hidden font-sans">
      <div className="fixed inset-0 z-[-1] transition-colors duration-500 bg-[linear-gradient(135deg,#FFF5F2,#FAFAFA,#FFF0E8)] dark:bg-[linear-gradient(135deg,#0F0F1A,#1A1A2E,#1F0F0A)]" />
      
      {/* ===== SIDEBAR ===== */}
      <div className="w-[260px] glass border-r border-white/10 flex-col shrink-0 hidden md:flex h-full relative z-10">
        <div className="p-5 border-b border-white/5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[linear-gradient(135deg,#FF6B3D,#FF8C5A)] flex items-center justify-center text-white font-bold text-sm shadow-[0_0_10px_rgba(255,107,61,0.5)]">
            C
          </div>
          <div className="text-xl font-extrabold italic text-gradient tracking-tight">Claura</div>
        </div>

        <div className="p-4">
          <button
            onClick={createConversation}
            className="w-full py-2.5 bg-[linear-gradient(135deg,rgba(255,107,61,0.1),rgba(255,209,102,0.1))] border border-orange/20 text-orange rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange/10 transition-colors"
          >
            + New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3">
          <div className="text-[10px] font-bold text-muted uppercase tracking-wider px-3 mb-2">History</div>
          {conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => router.push(`/chat/${c.id}`)}
              className={`px-4 py-3 rounded-[12px] cursor-pointer text-sm font-semibold mb-1 truncate transition-colors border ${
                c.id === activeConvo
                  ? "bg-orange/10 text-orange border-orange/20"
                  : "text-muted hover:bg-white/5 border-transparent hover:text-foreground"
              }`}
            >
              {c.title || "New Conversation"}
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-white/10">
          <a
            href={role ? `/dashboard/${role.toLowerCase()}` : "/role-select"}
            className="text-sm font-semibold text-muted hover:text-foreground transition-colors flex items-center gap-2"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>

      {/* ===== MAIN CHAT AREA ===== */}
      <div className="flex-1 flex flex-col relative h-full">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8 pb-32">
          <div className="max-w-[800px] mx-auto flex flex-col gap-6">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  key={i} 
                  className={`flex items-end gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-[linear-gradient(135deg,#FF6B3D,#FF8C5A)] text-white flex items-center justify-center text-sm font-bold shadow-[0_0_10px_rgba(255,107,61,0.4)] shrink-0 mb-1">C</div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl p-4 text-[15px] leading-relaxed relative ${
                    msg.role === "user"
                      ? "bg-orange/10 border border-orange/20 text-foreground rounded-br-sm"
                      : "glass border border-white/10 text-foreground rounded-bl-sm"
                  }`}>
                    {msg.fileName && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-black/10 dark:bg-white/5 rounded-lg mb-2 text-[13px] font-semibold">
                        <span>{msg.fileType?.startsWith("image/") ? "🖼️" : "📎"}</span>
                        {msg.fileName}
                      </div>
                    )}
                    <div className="whitespace-pre-wrap font-medium">{msg.content}</div>
                    {msg.hasSuccess && (
                      <div className="mt-3 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-lg text-[13px] text-green-500 font-bold flex items-center gap-2">
                        ✓ {role === "CANDIDATE" ? "Profile data synchronized" : "Job listing active"}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && !messages[messages.length - 1]?.isStreaming && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-end gap-3 justify-start"
              >
                <div className="w-8 h-8 rounded-full bg-[linear-gradient(135deg,#FF6B3D,#FF8C5A)] text-white flex items-center justify-center text-sm font-bold shadow-sm shrink-0 mb-1">C</div>
                <div className="glass border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-subtle font-medium flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-orange rounded-full animate-bounce delay-75"></span>
                    <span className="w-1.5 h-1.5 bg-orange rounded-full animate-bounce delay-150"></span>
                    <span className="w-1.5 h-1.5 bg-orange rounded-full animate-bounce delay-300"></span>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={bottomRef} className="h-4" />
          </div>
        </div>

        {/* ===== INPUT BAR (FLOATING PILL) ===== */}
        <div className="absolute bottom-6 left-0 right-0 px-4 flex justify-center z-20">
          <div className="w-full max-w-[800px] relative">
            {selectedFile && (
              <div className="absolute bottom-[calc(100%+12px)] left-0 glass border border-white/10 rounded-xl p-3 flex items-center gap-3 shadow-xl">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  <div className="text-2xl">📎</div>
                )}
                <div className="text-sm font-bold text-foreground max-w-[200px] truncate">{selectedFile.name}</div>
                <button 
                  onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                  className="text-muted hover:text-red-500 transition-colors p-1"
                >
                  ✕
                </button>
              </div>
            )}
            
            <form
              onSubmit={handleSend}
              className="glass border border-white/10 rounded-full p-2 flex items-center gap-2 shadow-[0_8px_32px_rgba(0,0,0,0.1)] focus-within:border-orange/50 focus-within:shadow-[0_0_20px_rgba(255,107,61,0.2)] transition-all duration-300"
            >
              <input 
                id="doc-upload-input"
                type="file" 
                ref={attachmentRef} 
                className="hidden" 
                accept=".pdf,.doc,.docx" 
                onChange={handleFileSelect} 
              />
              <input 
                id="image-upload-input"
                type="file" 
                ref={imageRef} 
                className="hidden" 
                accept="image/jpeg,image/png,image/webp" 
                onChange={handleFileSelect} 
              />
              
              <div className="flex gap-1 pl-2">
                <button
                  type="button"
                  onClick={() => attachmentRef.current?.click()}
                  disabled={loading}
                  className="p-2 text-muted hover:text-orange transition-colors rounded-full hover:bg-orange/5"
                  title="Attach Document"
                >
                  📎
                </button>
                <button
                  type="button"
                  onClick={() => imageRef.current?.click()}
                  disabled={loading}
                  className="p-2 text-muted hover:text-orange transition-colors rounded-full hover:bg-orange/5"
                  title="Attach Image"
                >
                  🖼️
                </button>
              </div>

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
                placeholder="Message Claura..."
                disabled={loading}
                className="flex-1 bg-transparent outline-none text-[15px] font-medium text-foreground px-2 placeholder:text-muted"
              />
              
              <button
                type="submit"
                disabled={(!input.trim() && !selectedFile) || loading}
                className={`w-[44px] h-[44px] rounded-full flex items-center justify-center transition-all duration-300 ${
                  (input.trim() || selectedFile) 
                    ? "bg-orange text-white shadow-[0_4px_12px_rgba(255,107,61,0.4)] hover:scale-105" 
                    : "bg-black/5 dark:bg-white/5 text-muted cursor-not-allowed"
                }`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
