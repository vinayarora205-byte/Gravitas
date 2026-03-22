/* eslint-disable */
// @ts-nocheck
"use client";
import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DirectChatPage() {
  const { user } = useUser();
  const params = useParams();
  const router = useRouter();
  const matchId = params.match_id as string;

  const [match, setMatch] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [myProfileId, setMyProfileId] = useState("");
  const [otherName, setOtherName] = useState("Chat Partner");
  const [loading, setLoading] = useState(true);
  const [chatLocked, setChatLocked] = useState(false);
  const [showHireBanner, setShowHireBanner] = useState(false);
  const [hireSubmitted, setHireSubmitted] = useState(false);
  const [myRole, setMyRole] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    loadChat();
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!matchId) return;
    const channel = supabase
      .channel(`direct-${matchId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "direct_messages",
        filter: `match_id=eq.${matchId}`,
      }, (payload: any) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [matchId]);

  async function loadChat() {
    const { data: profile } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("clerk_user_id", user!.id)
      .maybeSingle();

    if (!profile) return;
    setMyProfileId(profile.id);
    setMyRole(profile.role?.toUpperCase() || "");

    const { data: m } = await supabase
      .from("matches")
      .select(`
        *, 
        job_listings(
          profile_id, 
          job_title, 
          company_name, 
          profiles(full_name)
        ), 
        candidate_profiles:candidate_id(
          profile_id, 
          job_title, 
          profiles(full_name)
        )
      `)
      .eq("id", match_id)
      .maybeSingle();

    if (!m) {
      setLoading(false);
      return;
    }

    if (!m.chat_unlocked) {
      setChatLocked(true);
      setMatch(m);
      setLoading(false);
      return;
    }

    setMatch(m);

    // Determine other person's name
    if (profile.role?.toUpperCase() === "RECRUITER") {
      setOtherName(m.candidate_profiles?.profiles?.full_name || "Candidate");
    } else {
      setOtherName(m.job_listings?.profiles?.full_name || "Recruiter");
    }

    // Check if 3 days old
    const created = new Date(m.created_at);
    const now = new Date();
    const daysDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff >= 3 && m.hire_status === "pending") {
      setShowHireBanner(true);
    }

    // Load messages
    const { data: msgs } = await supabase
      .from("direct_messages")
      .select("*, profiles:sender_id(full_name)")
      .eq("match_id", match_id)
      .order("created_at", { ascending: true });

    setMessages(msgs || []);
    setLoading(false);
  }

  async function sendMessage() {
    if (!newMsg.trim()) return;
    const msgText = newMsg;
    setNewMsg("");

    await supabase.from("direct_messages").insert({
      match_id: matchId,
      sender_id: myProfileId,
      content: msgText,
    });
  }

  async function handleHireResponse(response: string) {
    setHireSubmitted(true);
    await fetch("/api/hiries/hire-response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ match_id: matchId, response }),
    });
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#1A1A1A", color: "#fff" }}>
        <p>Loading chat...</p>
      </div>
    );
  }

  if (chatLocked) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#1A1A1A", color: "#E0E0E0", fontFamily: "'Inter', sans-serif", justifyContent: "center", alignItems: "center", padding: "40px", textAlign: "center" }}>
        <p style={{ fontSize: "64px", margin: "0 0 24px" }}>🔒</p>
        <h1 style={{ fontSize: "24px", fontWeight: "700", margin: "0 0 16px", color: "#fff" }}>Chat Not Unlocked Yet</h1>
        <p style={{ fontSize: "16px", color: "#888", maxWidth: "400px", lineHeight: "1.6", margin: "0 0 32px" }}>
          Both parties must accept the match to unlock direct messaging. 
          {myRole === "RECRUITER" 
            ? (match?.recruiter_accepted ? " You've accepted. Waiting for the candidate..." : " You haven't accepted this match yet.") 
            : (match?.candidate_accepted ? " You've accepted. Waiting for the recruiter..." : " You haven't accepted this match yet.")
          }
        </p>
        <button 
          onClick={() => router.back()}
          style={{ padding: "12px 24px", borderRadius: "12px", border: "1px solid #333", background: "#222", color: "#E0E0E0", fontWeight: "600", cursor: "pointer" }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#1A1A1A", color: "#E0E0E0", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid #2A2A2A", background: "#222" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "#FF6B3D", fontSize: "20px", cursor: "pointer" }}>←</button>
          <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, #FF6B3D, #FF8F6B)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700", color: "#fff" }}>
            {otherName.charAt(0)}
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: "600", fontSize: "16px" }}>{otherName}</p>
            <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>
              {match?.job_listings?.job_title || "Direct Chat"} • Score: {match?.score}%
            </p>
          </div>
        </div>
        {match?.hire_status === "hired" && (
          <span style={{ background: "#22C55E", color: "#fff", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" }}>
            ✅ Hired
          </span>
        )}
      </div>

      {/* Hire Banner */}
      {showHireBanner && !hireSubmitted && (
        <div style={{ padding: "16px 24px", background: "linear-gradient(135deg, #2A1A0A, #1A1A2A)", border: "1px solid #FF6B3D33", borderRadius: "12px", margin: "12px 24px", textAlign: "center" }}>
          <p style={{ margin: "0 0 12px", fontWeight: "600", fontSize: "15px" }}>How did it go? Let us know!</p>
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => handleHireResponse("hired")} style={{ padding: "8px 20px", borderRadius: "8px", border: "none", background: "#22C55E", color: "#fff", fontWeight: "600", cursor: "pointer" }}>
              We Got Hired! 🎉
            </button>
            <button onClick={() => handleHireResponse("ongoing")} style={{ padding: "8px 20px", borderRadius: "8px", border: "1px solid #555", background: "transparent", color: "#E0E0E0", fontWeight: "600", cursor: "pointer" }}>
              Still in Process
            </button>
            <button onClick={() => handleHireResponse("not_interested")} style={{ padding: "8px 20px", borderRadius: "8px", border: "1px solid #555", background: "transparent", color: "#888", fontWeight: "600", cursor: "pointer" }}>
              Not Interested
            </button>
          </div>
        </div>
      )}
      {hireSubmitted && (
        <div style={{ padding: "12px 24px", margin: "12px 24px", background: "#22C55E22", borderRadius: "12px", textAlign: "center", color: "#22C55E", fontWeight: "600" }}>
          ✅ Response submitted. Thank you!
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px", display: "flex", flexDirection: "column", gap: "8px" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "#666", padding: "40px 0" }}>
            <p style={{ fontSize: "32px", margin: "0 0 8px" }}>💬</p>
            <p style={{ margin: 0 }}>No messages yet. Say hello!</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender_id === myProfileId;
          return (
            <div key={msg.id} style={{ display: "flex", justifyContent: isMine ? "flex-end" : "flex-start" }}>
              <div style={{
                maxWidth: "70%", padding: "10px 16px", borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                background: isMine ? "linear-gradient(135deg, #FF6B3D, #FF8F6B)" : "#2A2A2A",
                color: isMine ? "#fff" : "#E0E0E0",
              }}>
                {!isMine && <p style={{ margin: "0 0 4px", fontSize: "11px", color: "#FF6B3D", fontWeight: "600" }}>{(Array.isArray(msg.profiles) ? msg.profiles[0]?.full_name : msg.profiles?.full_name) || "User"}</p>}
                <p style={{ margin: 0, fontSize: "14px", lineHeight: "1.5" }}>{msg.content}</p>
                <p style={{ margin: "4px 0 0", fontSize: "10px", color: isMine ? "#fff9" : "#666", textAlign: "right" }}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "12px 24px", borderTop: "1px solid #2A2A2A", background: "#222" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            style={{ flex: 1, padding: "12px 16px", borderRadius: "12px", border: "1px solid #333", background: "#2A2A2A", color: "#E0E0E0", fontSize: "14px", outline: "none" }}
          />
          <button onClick={sendMessage} style={{ padding: "12px 20px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg, #FF6B3D, #FF8F6B)", color: "#fff", fontWeight: "600", cursor: "pointer", fontSize: "16px" }}>
            →
          </button>
        </div>
      </div>
    </div>
  );
}
