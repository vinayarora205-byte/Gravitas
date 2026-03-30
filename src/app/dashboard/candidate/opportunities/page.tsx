"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Diamond, Sparkle, MapPin, Briefcase, CurrencyCircleDollar,
  Lock, ChatCircleText, CaretDown, CaretUp,
  Envelope, WhatsappLogo, LinkedinLogo, Globe, User
} from "@phosphor-icons/react";

export default function OpportunitiesPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBalance = async () => {
    const res = await fetch("/api/hiries/balance");
    if (res.ok) { const d = await res.json(); setBalance(d.balance || 0); }
  };

  const fetchOpportunities = async () => {
    if (!user) return;
    const { data: profile } = await supabase.from("profiles").select("id").eq("clerk_user_id", user.id).maybeSingle();
    if (!profile) { setLoading(false); return; }

    const { data } = await supabase
      .from("matches")
      .select(`id, score, status, created_at, candidate_accepted, recruiter_accepted, chat_unlocked, hire_status,
        job_listings!job_id (id, job_title, company_name, salary_min, salary_max, work_type, location, description,
          profiles!profile_id (full_name, email, whatsapp_number, linkedin_url, company_website))`)
      .eq("candidate_id", profile.id)
      .order("score", { ascending: false });

    const transformed = (data || []).map((m: any) => ({
      ...m,
      job_listings: {
        ...m.job_listings,
        profiles: Array.isArray(m.job_listings?.profiles) ? m.job_listings.profiles[0] : m.job_listings?.profiles,
      },
    }));
    setMatches(transformed);
    setLoading(false);
  };

  useEffect(() => { if (isLoaded) { fetchOpportunities(); fetchBalance(); } }, [user, isLoaded]);

  const handleAcceptMatch = async (matchId: string) => {
    setActionLoading(matchId);
    try {
      const res = await fetch("/api/hiries/accept-match", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ match_id: matchId }) });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "Failed to accept match"); } else { setBalance(data.balance); }
      fetchOpportunities();
    } catch (err) { console.error(err); }
    setActionLoading(null);
  };

  const handleDeclineMatch = async (matchId: string) => {
    setActionLoading(matchId);
    try {
      await fetch("/api/hiries/decline-match", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ match_id: matchId }) });
      fetchOpportunities();
    } catch (err) { console.error(err); }
    setActionLoading(null);
  };

  if (!isLoaded || loading) return (
    <div className="flex items-center justify-center min-h-[400px] flex-col gap-3">
      <div className="w-10 h-10 rounded-full border-2 border-[#E8E3DD] border-t-[#FF6A2A] animate-spin" />
      <p className="text-[13px] text-gray-400 font-medium">Loading opportunities…</p>
    </div>
  );

  const scoreStyle = (score: number) => {
    if (score >= 80) return { background: "#E8F5E9", color: "#2E7D32" };
    if (score >= 60) return { background: "#FFF3EE", color: "#FF6A2A" };
    return { background: "#FFEBEE", color: "#C62828" };
  };

  return (
    <div className="max-w-[900px] mx-auto py-8 px-1">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-8">
        <div>
          <h1 className="font-serif text-[28px] font-bold italic text-[#0F0F0F]">Opportunities</h1>
          <p className="text-[13px] text-gray-400 mt-1 font-medium">AI-matched roles tailored to your profile</p>
        </div>
        {/* Balance badge */}
        <div
          className="flex items-center gap-3 px-5 py-3 rounded-[12px] shrink-0"
          style={{ background: "white", border: "1px solid #E8E3DD" }}
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#FFF3EE" }}>
            <Diamond size={16} weight="fill" color="#FF6A2A" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Hiries Balance</div>
            <div className="font-bold text-[16px] text-[#0F0F0F]">{balance} 💎</div>
          </div>
          <button
            onClick={() => router.push("/pricing")}
            className="ml-2 px-3 py-1.5 rounded-[8px] text-[12px] font-medium text-[#FF6A2A] transition-colors"
            style={{ background: "#FFF3EE" }}
            onMouseEnter={e => (e.currentTarget.style.background = "#FFE4D6")}
            onMouseLeave={e => (e.currentTarget.style.background = "#FFF3EE")}
          >
            Top Up
          </button>
        </div>
      </div>

      {/* Empty state */}
      {matches.length === 0 ? (
        <div
          className="py-20 text-center rounded-[16px]"
          style={{ background: "white", border: "1px solid #E8E3DD" }}
        >
          <div className="w-16 h-16 rounded-[14px] mx-auto mb-5 flex items-center justify-center" style={{ background: "#F6F1EB" }}>
            <Sparkle size={32} weight="duotone" color="#ccc" />
          </div>
          <h3 className="font-serif text-[20px] font-bold italic text-[#0F0F0F] mb-2">No Matches Yet</h3>
          <p className="text-[14px] text-gray-400 mb-6 max-w-[320px] mx-auto">Complete your profile with Claura to start receiving matched opportunities.</p>
          <button
            onClick={() => router.push("/chat")}
            className="bg-[#FF6A2A] text-white text-[14px] font-medium px-6 py-3 rounded-[10px] hover:opacity-90 transition-opacity"
          >
            Start with Claura
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {matches.map((match) => {
            const isExpanded = expandedId === match.id;
            const jl = match.job_listings;
            const recruiter = jl?.profiles;
            const isCandidateAccepted = match.candidate_accepted;
            const isRecruiterAccepted = match.recruiter_accepted;
            const chatUnlocked = match.chat_unlocked;
            const isHired = match.hire_status === "hired";
            const isRejected = match.status === "REJECTED";

            return (
              <div
                key={match.id}
                className="bg-white rounded-[16px] overflow-hidden"
                style={{ border: "1px solid #E8E3DD" }}
              >
                <div className="p-6">
                  {/* Top row: Company + Role + Score */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-5">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
                        style={{ background: "#F6F1EB" }}
                      >
                        <Briefcase size={20} weight="duotone" color="#FF6A2A" />
                      </div>
                      <div>
                        <div className="text-[12px] font-bold text-gray-400 uppercase tracking-wide mb-0.5">{jl?.company_name}</div>
                        <h3 className="font-serif text-[20px] font-bold italic text-[#0F0F0F]">{jl?.job_title}</h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Score badge */}
                      <div
                        className="px-3 py-1.5 rounded-[8px] text-[13px] font-bold"
                        style={scoreStyle(match.score)}
                      >
                        {match.score}% Match
                      </div>

                      {/* Status badges */}
                      {isHired && <div className="px-3 py-1.5 rounded-[8px] text-[12px] font-bold badge-accepted">Hired ✓</div>}
                      {chatUnlocked && !isHired && <div className="px-3 py-1.5 rounded-[8px] text-[12px] font-bold badge-accepted">Chat Unlocked</div>}
                      {isCandidateAccepted && !isRecruiterAccepted && !isRejected && <div className="px-3 py-1.5 rounded-[8px] text-[12px] font-bold badge-pending">Pending Recruiter</div>}
                      {!isCandidateAccepted && isRecruiterAccepted && !isRejected && <div className="px-3 py-1.5 rounded-[8px] text-[12px] font-bold badge-pending">Recruiter Interested</div>}
                      {isRejected && <div className="px-3 py-1.5 rounded-[8px] text-[12px] font-bold badge-rejected">Declined</div>}
                    </div>
                  </div>

                  {/* Middle: tags */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-medium" style={{ background: "#F6F1EB", color: "#555" }}>
                      <MapPin size={13} weight="bold" color="#FF6A2A" /> {jl?.location}
                    </span>
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-medium" style={{ background: "#F6F1EB", color: "#555" }}>
                      <CurrencyCircleDollar size={13} weight="bold" color="#FF6A2A" /> ₹{jl?.salary_min?.toLocaleString()} – ₹{jl?.salary_max?.toLocaleString()}
                    </span>
                    <span className="px-3 py-1.5 rounded-[8px] text-[12px] font-medium" style={{ background: "#F6F1EB", color: "#555" }}>
                      {jl?.work_type}
                    </span>
                  </div>

                  {/* Lock wall */}
                  {!chatUnlocked && !isRejected && (
                    <div
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-[12px] mb-5"
                      style={{ background: "#F9F9F9", border: "1px solid #F0EDE8" }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center" style={{ border: "1px solid #E8E3DD" }}>
                          <Lock size={16} weight="bold" color="#999" />
                        </div>
                        <p className="text-[13px] font-medium text-gray-500">Recruiter details are locked until you accept this match</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        {!isCandidateAccepted && isRecruiterAccepted && (
                          <button
                            onClick={() => handleAcceptMatch(match.id)}
                            disabled={actionLoading === match.id}
                            className="bg-[#FF6A2A] text-white text-[13px] font-medium px-5 py-2 rounded-[8px] hover:opacity-90 transition-opacity disabled:opacity-50"
                          >
                            {actionLoading === match.id ? "…" : "Accept (2 Hiries)"}
                          </button>
                        )}
                        {!isCandidateAccepted && !isRecruiterAccepted && (
                          <>
                            <button
                              onClick={() => handleAcceptMatch(match.id)}
                              disabled={actionLoading === match.id}
                              className="bg-[#FF6A2A] text-white text-[13px] font-medium px-5 py-2 rounded-[8px] hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                              {actionLoading === match.id ? "…" : "Accept (2 Hiries)"}
                            </button>
                            <button
                              onClick={() => handleDeclineMatch(match.id)}
                              disabled={actionLoading === match.id}
                              className="text-[13px] font-medium px-5 py-2 rounded-[8px] transition-colors disabled:opacity-50"
                              style={{ border: "1px solid #E8E3DD", color: "#666" }}
                              onMouseEnter={e => (e.currentTarget.style.background = "#F6F1EB")}
                              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                            >
                              Decline
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Bottom row */}
                  <div className="flex items-center justify-between pt-4" style={{ borderTop: "1px solid #F0EDE8" }}>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : match.id)}
                      className="flex items-center gap-1.5 text-[12px] font-medium text-gray-400 hover:text-[#0F0F0F] transition-colors"
                    >
                      {isExpanded
                        ? <><CaretUp size={14} weight="bold" /> Hide Details</>
                        : <><CaretDown size={14} weight="bold" /> View Details</>}
                    </button>

                    {chatUnlocked && (
                      <button
                        onClick={() => router.push(`/direct-chat/${match.id}`)}
                        className="flex items-center gap-2 bg-[#2E7D32] text-white text-[13px] font-medium px-5 py-2 rounded-[8px] hover:opacity-90 transition-opacity"
                      >
                        <ChatCircleText size={16} weight="fill" />
                        Open Chat
                      </button>
                    )}
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="mt-5 pt-5 grid grid-cols-1 md:grid-cols-3 gap-6" style={{ borderTop: "1px solid #F0EDE8" }}>
                      <div className="md:col-span-2">
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Job Description</div>
                        <p className="text-[14px] text-gray-600 leading-relaxed">{jl?.description}</p>
                      </div>

                      {chatUnlocked && recruiter && (
                        <div>
                          <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Recruiter Contact</div>
                          <div
                            className="rounded-[12px] p-4 space-y-3"
                            style={{ background: "#F9F9F9", border: "1px solid #F0EDE8" }}
                          >
                            {[
                              { icon: <User size={14} weight="duotone" />, label: "Name", value: recruiter.full_name },
                              { icon: <Envelope size={14} weight="duotone" />, label: "Email", value: recruiter.email, href: `mailto:${recruiter.email}` },
                              recruiter.whatsapp_number && { icon: <WhatsappLogo size={14} weight="duotone" />, label: "WhatsApp", value: recruiter.whatsapp_number },
                            ].filter(Boolean).map((item: any, i: number) => (
                              <div key={i} className="flex items-center gap-2.5">
                                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-gray-400 shrink-0" style={{ border: "1px solid #E8E3DD" }}>
                                  {item.icon}
                                </div>
                                <div>
                                  <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">{item.label}</div>
                                  {item.href
                                    ? <a href={item.href} className="text-[12px] font-medium text-[#0F0F0F] hover:text-[#FF6A2A] transition-colors">{item.value}</a>
                                    : <div className="text-[12px] font-medium text-[#0F0F0F]">{item.value}</div>}
                                </div>
                              </div>
                            ))}
                            <div className="flex gap-2 pt-1">
                              {recruiter.linkedin_url && (
                                <a href={recruiter.linkedin_url} target="_blank" rel="noopener noreferrer"
                                  className="flex-1 py-2 rounded-[8px] flex items-center justify-center text-gray-400 hover:text-[#FF6A2A] transition-colors"
                                  style={{ border: "1px solid #E8E3DD", background: "white" }}>
                                  <LinkedinLogo size={16} weight="bold" />
                                </a>
                              )}
                              {recruiter.company_website && (
                                <a href={recruiter.company_website} target="_blank" rel="noopener noreferrer"
                                  className="flex-1 py-2 rounded-[8px] flex items-center justify-center text-gray-400 hover:text-[#FF6A2A] transition-colors"
                                  style={{ border: "1px solid #E8E3DD", background: "white" }}>
                                  <Globe size={16} weight="bold" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
