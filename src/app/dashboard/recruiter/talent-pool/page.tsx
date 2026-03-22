"use client";
/* eslint-disable */
// @ts-nocheck

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function TalentPoolPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBalance = async () => {
    const res = await fetch("/api/hiries/balance");
    if (res.ok) {
      const data = await res.json();
      setBalance(data.balance || 0);
    }
  };

  const fetchTalent = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("clerk_user_id", user.id)
      .maybeSingle();

    if (!profile) { setLoading(false); return; }

    const { data: myJobs } = await supabase
      .from("job_listings")
      .select("id")
      .eq("profile_id", profile.id);

    if (!myJobs || myJobs.length === 0) { setLoading(false); return; }

    const jobIds = myJobs.map(j => j.id);

    const { data, error } = await supabase
      .from("matches")
      .select(`
        id, score, status, created_at,
        candidate_accepted, recruiter_accepted, chat_unlocked, hire_status,
        job_listings!job_id ( job_title ),
        profiles!candidate_id (
          full_name, email, whatsapp_number, linkedin_url, portfolio_url,
          candidate_profiles!profile_id (
            job_title, skills, salary_min, salary_max,
            work_type, experience_years, location
          )
        )
      `)
      .in("job_id", jobIds)
      .order("score", { ascending: false });

    if (error) {
      console.error("Talent pool fetch error:", error);
    } else {
      const transformedMatches = (data || []).map((m: any) => {
        const candidateUser = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
        const candProfile = Array.isArray(candidateUser?.candidate_profiles)
          ? candidateUser.candidate_profiles[0]
          : candidateUser?.candidate_profiles;

        return {
          ...m,
          job_posted: m.job_listings?.job_title || "Unknown Role",
          profiles: {
            full_name: candidateUser?.full_name || "Anonymous Candidate",
            email: candidateUser?.email || "",
            whatsapp_number: candidateUser?.whatsapp_number || "",
            linkedin_url: candidateUser?.linkedin_url || "",
            portfolio_url: candidateUser?.portfolio_url || "",
          },
          candidate_profiles: {
            job_title: candProfile?.job_title || "Not specified",
            skills: candProfile?.skills || [],
            salary_min: candProfile?.salary_min || 0,
            salary_max: candProfile?.salary_max || 0,
            work_type: candProfile?.work_type || "Not specified",
            experience_years: candProfile?.experience_years || "0",
            location: candProfile?.location || "Not specified",
          },
        };
      });
      setCandidates(transformedMatches);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isLoaded) {
      fetchTalent();
      fetchBalance();
    }
  }, [user, isLoaded]);

  const handleAcceptMatch = async (matchId: string) => {
    setActionLoading(matchId);
    try {
      const res = await fetch("/api/hiries/accept-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ match_id: matchId }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to accept match");
      } else {
        setBalance(data.balance);
      }
      fetchTalent();
    } catch (err) {
      console.error("Accept error:", err);
    }
    setActionLoading(null);
  };

  const handleDeclineMatch = async (matchId: string) => {
    setActionLoading(matchId);
    try {
      await fetch("/api/hiries/decline-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ match_id: matchId }),
      });
      fetchTalent();
    } catch (err) {
      console.error("Decline error:", err);
    }
    setActionLoading(null);
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 rounded-full border-4 border-accent border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "error";
  };

  const formatCurrency = (amount: number) => {
    return amount ? `₹${amount.toLocaleString()}` : "N/A";
  };

  return (
    <div className="fade-in max-w-5xl mx-auto py-8 px-4">
      <div className="mb-10 flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-h2 font-semibold text-foreground mb-2">Talent Pool</h1>
          <p className="text-muted text-body-lg">Manage and connect with top-matched candidates for your active roles.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-4 py-2 rounded-xl bg-accent/10 text-accent font-bold text-sm border border-accent/20">
            💎 {balance} Hiries
          </span>
          <button
            onClick={() => router.push("/pricing")}
            className="text-xs text-muted hover:text-accent underline"
          >
            Need more?
          </button>
        </div>
      </div>

      {candidates.length === 0 ? (
        <Card className="p-12 text-center text-muted">
          No candidates found yet. Post a job via GAIA to start receiving matched candidates.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((c) => {
            const isExpanded = expandedId === c.id;
            const candUser = c.profiles;
            const candDetails = c.candidate_profiles;
            const isBothAccepted = c.candidate_accepted && c.recruiter_accepted;
            const isRecruiterAccepted = c.recruiter_accepted;
            const isCandidateAccepted = c.candidate_accepted;
            const chatUnlocked = c.chat_unlocked;
            const isHired = c.hire_status === "hired";
            const isRejected = c.status === "REJECTED";

            return (
              <Card
                key={c.id}
                className="overflow-hidden transition-all duration-300 border-border hover:border-accent/40 flex flex-col h-full"
              >
                <div className="p-6 flex-grow flex flex-col">
                  {/* Top Section */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/10 to-accent/30 flex items-center justify-center text-lg font-bold text-accent shrink-0">
                        {chatUnlocked ? candUser.full_name.charAt(0) : "?"}
                      </div>
                      <div>
                        <h3 className="text-h4 font-semibold text-foreground line-clamp-1" title={chatUnlocked ? candUser.full_name : "Hidden"}>
                          {chatUnlocked ? candUser.full_name : "🔒 Name Hidden"}
                        </h3>
                        <p className="text-xs font-medium text-accent line-clamp-1">For: {c.job_posted}</p>
                      </div>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-5 flex-wrap">
                    <Badge variant={getScoreColor(c.score)}>
                      {c.score}% Match
                    </Badge>
                    {isHired && <Badge variant="success">✅ Hired</Badge>}
                    {chatUnlocked && !isHired && <Badge variant="success">💬 Chat Open</Badge>}
                    {isRecruiterAccepted && !isCandidateAccepted && !isRejected && !chatUnlocked && (
                      <Badge variant="warning">⏳ Waiting</Badge>
                    )}
                    {!isRecruiterAccepted && isCandidateAccepted && !isRejected && !chatUnlocked && (
                      <Badge variant="warning">💎 Accept to Connect</Badge>
                    )}
                    {isRejected && <Badge variant="error">Declined</Badge>}
                    {!isRecruiterAccepted && !isCandidateAccepted && !isRejected && (
                      <Badge variant="default">PENDING</Badge>
                    )}
                  </div>

                  {/* Want Details */}
                  <div className="space-y-3 mb-5">
                    <p className="text-body font-medium text-foreground">{candDetails.job_title}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs text-muted flex items-center gap-1">🗓 {candDetails.experience_years}y exp</span>
                      <span className="text-xs text-muted flex items-center gap-1">💰 {formatCurrency(candDetails.salary_min)}</span>
                      <span className="text-xs text-muted flex items-center gap-1">📍 {candDetails.location}</span>
                      <span className="text-xs text-muted flex items-center gap-1">💼 {candDetails.work_type}</span>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1.5 mb-6 flex-grow">
                    {candDetails.skills.slice(0, 5).map((skill: string, i: number) => (
                      <span key={i} className="px-2 py-1 bg-accent/10 text-accent text-xs font-medium rounded-md border border-accent/20">
                        {skill}
                      </span>
                    ))}
                    {candDetails.skills.length > 5 && (
                      <span className="px-2 py-1 text-muted text-xs flex items-center">
                        +{candDetails.skills.length - 5}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-auto space-y-4 pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : c.id)}
                        className="text-accent hover:underline font-medium text-sm"
                      >
                        {isExpanded ? "Hide ↑" : "Details ↓"}
                      </button>

                      {/* Chat unlocked */}
                      {chatUnlocked && (
                        <Button variant="primary" size="sm" onClick={() => router.push(`/direct-chat/${c.id}`)}>
                          Open Chat 💬
                        </Button>
                      )}

                      {/* Candidate already accepted, recruiter hasn't */}
                      {!isRecruiterAccepted && isCandidateAccepted && !isRejected && !chatUnlocked && (
                        <div className="flex flex-col items-end gap-2">
                           <span className="text-[10px] text-orange-500 font-medium animate-pulse">
                            ⏳ Candidate accepted! Spend 2 Hiries to connect
                          </span>
                          <div className="flex gap-1">
                            {balance >= 2 ? (
                              <Button variant="primary" size="sm" onClick={() => handleAcceptMatch(c.id)} disabled={actionLoading === c.id}>
                                {actionLoading === c.id ? "..." : "Accept (2 Hiries)"}
                              </Button>
                            ) : (
                              <Button variant="primary" size="sm" onClick={() => router.push("/pricing")}>
                                Get 💎
                              </Button>
                            )}
                            <Button variant="secondary" size="sm" onClick={() => handleDeclineMatch(c.id)} disabled={actionLoading === c.id}>
                              ✕
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Both pending or only candidate accepted (above handled) */}
                      {!isRecruiterAccepted && !isCandidateAccepted && !isRejected && !chatUnlocked && (
                        <div className="flex gap-1">
                          {balance >= 2 ? (
                            <Button variant="primary" size="sm" onClick={() => handleAcceptMatch(c.id)} disabled={actionLoading === c.id}>
                              {actionLoading === c.id ? "..." : "Accept (2💎)"}
                            </Button>
                          ) : (
                            <Button variant="primary" size="sm" onClick={() => router.push("/pricing")}>
                              Get 💎
                            </Button>
                          )}
                          <Button variant="secondary" size="sm" onClick={() => handleDeclineMatch(c.id)} disabled={actionLoading === c.id}>
                            ✕
                          </Button>
                        </div>
                      )}

                      {/* Waiting for candidate */}
                      {isRecruiterAccepted && !isCandidateAccepted && !isRejected && !chatUnlocked && (
                        <span className="text-xs text-muted">⏳ Waiting for candidate...</span>
                      )}
                    </div>

                    {/* Expanded Contact Details — only when chat unlocked */}
                    {isExpanded && chatUnlocked && (
                      <div className="fade-slide-up bg-black/5 dark:bg-white/5 rounded-xl p-4 border border-border">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">Contact Details</h4>
                        <div className="space-y-3">
                          <div className="flex items-start gap-2">
                            <span className="text-sm">📧</span>
                            <a href={`mailto:${candUser.email}`} className="text-sm text-foreground hover:text-accent break-all">
                              {candUser.email}
                            </a>
                          </div>
                          {candUser.whatsapp_number && (
                            <div className="flex items-start gap-2">
                              <span className="text-sm">📱</span>
                              <span className="text-sm text-foreground">{candUser.whatsapp_number}</span>
                            </div>
                          )}
                          {candUser.linkedin_url && (
                            <div className="flex items-start gap-2">
                              <span className="text-sm">🔗</span>
                              <a href={candUser.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline line-clamp-1">
                                LinkedIn Profile
                              </a>
                            </div>
                          )}
                          {candUser.portfolio_url && (
                            <div className="flex items-start gap-2">
                              <span className="text-sm">🌐</span>
                              <a href={candUser.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline line-clamp-1">
                                Portfolio
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Locked message when expanded but no chat */}
                    {isExpanded && !chatUnlocked && !isRejected && (
                      <div className="rounded-xl p-4 border border-border bg-foreground/5 text-center">
                        <p className="text-muted text-sm">🔒 Contact details will be visible after both parties accept.</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
