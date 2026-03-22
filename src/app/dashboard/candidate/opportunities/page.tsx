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
    if (res.ok) {
      const data = await res.json();
      setBalance(data.balance || 0);
    }
  };

  const fetchOpportunities = async () => {
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("clerk_user_id", user.id)
      .maybeSingle();

    if (!profile) { setLoading(false); return; }

    const { data: candidateProfile } = await supabase
      .from("candidate_profiles")
      .select("id")
      .eq("profile_id", profile.id)
      .maybeSingle();

    if (!candidateProfile) { setLoading(false); return; }

    const { data, error } = await supabase
      .from("matches")
      .select(`
        id, score, status, created_at,
        candidate_accepted, recruiter_accepted, chat_unlocked, hire_status,
        job_listings!job_id (
          id, job_title, company_name, salary_min, salary_max,
          work_type, location, description,
          profiles!profile_id (
            full_name, email, whatsapp_number, linkedin_url, company_website
          )
        )
      `)
      .eq("candidate_id", profile.id)
      .order("score", { ascending: false });

    if (error) {
      console.error("Matches fetch error:", error);
    } else {
      const transformedMatches = (data || []).map((m: any) => ({
        ...m,
        job_listings: {
          ...m.job_listings,
          profiles: Array.isArray(m.job_listings?.profiles)
            ? m.job_listings.profiles[0]
            : m.job_listings?.profiles,
        },
      }));
      setMatches(transformedMatches);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isLoaded) {
      fetchOpportunities();
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
      fetchOpportunities();
    } catch (err) {
      console.error("Accept error:", err);
    }
    setActionLoading(null);
  };

  const handleDeclineMatch = async (matchId: string) => {
    setActionLoading(matchId);
    try {
      const res = await fetch("/api/hiries/decline-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ match_id: matchId }),
      });
      fetchOpportunities();
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
          <h1 className="text-h2 font-semibold text-foreground mb-2">My Opportunities</h1>
          <p className="text-muted text-body-lg">Exclusive matches hand-picked by GAIA for your profile.</p>
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

      {matches.length === 0 ? (
        <Card className="p-12 text-center text-muted">
          No matches found yet. Complete your profile with GAIA to unlock opportunities.
        </Card>
      ) : (
        <div className="space-y-6">
          {matches.map((match) => {
            const isExpanded = expandedId === match.id;
            const jl = match.job_listings;
            const recruiter = jl?.profiles;
            const isBothAccepted = match.candidate_accepted && match.recruiter_accepted;
            const isCandidateAccepted = match.candidate_accepted;
            const isRecruiterAccepted = match.recruiter_accepted;
            const chatUnlocked = match.chat_unlocked;
            const isHired = match.hire_status === "hired";
            const isRejected = match.status === "REJECTED";

            return (
              <Card
                key={match.id}
                className="overflow-hidden transition-all duration-300 border-border hover:border-accent/40"
              >
                <div className="p-6">
                  {/* Top Section */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-h3 font-semibold text-foreground">{jl?.company_name}</h3>
                      <p className="text-body-lg text-accent font-medium">{jl?.job_title}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge variant={getScoreColor(match.score)}>
                        {match.score}% Score
                      </Badge>
                      {isHired && (
                        <Badge variant="success">✅ Hired</Badge>
                      )}
                      {chatUnlocked && !isHired && (
                        <Badge variant="success">💬 Chat Open</Badge>
                      )}
                      {isCandidateAccepted && !isRecruiterAccepted && !isRejected && (
                        <Badge variant="warning">⏳ Waiting</Badge>
                      )}
                      {!isCandidateAccepted && isRecruiterAccepted && !isRejected && (
                        <Badge variant="warning">💎 Accept to Connect</Badge>
                      )}
                      {isRejected && (
                        <Badge variant="error">Declined</Badge>
                      )}
                      {!isCandidateAccepted && !isRecruiterAccepted && !isRejected && (
                        <Badge variant="default">PENDING</Badge>
                      )}
                    </div>
                  </div>

                  {/* Middle Section — always visible */}
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-muted text-body mb-6 pb-6 border-b border-border/50">
                    <span className="flex items-center gap-2">💰 {formatCurrency(jl?.salary_min)} - {formatCurrency(jl?.salary_max)}/mo</span>
                    <span className="flex items-center gap-2">📍 {jl?.location}</span>
                    <span className="flex items-center gap-2">💼 {jl?.work_type}</span>
                  </div>

                  {/* Locked contact info when not both accepted */}
                  {!chatUnlocked && !isRejected && (
                    <div className="mb-4 p-4 rounded-xl bg-foreground/5 border border-border/50">
                      <p className="text-muted text-sm">🔒 Contact details hidden — Accept this match to unlock</p>
                      <p className="text-muted text-sm">🔒 Full recruiter profile hidden</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : match.id)}
                        className="text-accent hover:underline font-medium text-body"
                      >
                        {isExpanded ? "Hide Details ↑" : "View Details ↓"}
                      </button>

                      <div className="flex gap-2">
                        {/* Chat Unlocked — Open Chat */}
                        {chatUnlocked && (
                          <Button variant="primary" size="sm" onClick={() => router.push(`/direct-chat/${match.id}`)}>
                            Open Chat 💬
                          </Button>
                        )}

                        {/* Pending — Accept/Decline */}
                        {!isCandidateAccepted && !isRejected && !chatUnlocked && (
                          <>
                            {balance >= 2 ? (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleAcceptMatch(match.id)}
                                disabled={actionLoading === match.id}
                              >
                                {actionLoading === match.id ? "..." : "Accept Match (2 💎)"}
                              </Button>
                            ) : (
                              <Button variant="primary" size="sm" onClick={() => router.push("/pricing")} >
                                Get Hiries 💎
                              </Button>
                            )}
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleDeclineMatch(match.id)}
                              disabled={actionLoading === match.id}
                            >
                              Decline
                            </Button>
                          </>
                        )}

                        {/* Waiting */}
                        {isCandidateAccepted && !isRecruiterAccepted && !isRejected && !chatUnlocked && (
                          <span className="text-sm text-muted py-2">⏳ Waiting for recruiter to accept...</span>
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="fade-slide-up space-y-6 pt-2">
                        <div>
                          <h4 className="text-small font-bold uppercase tracking-wider text-muted mb-2">Job Description</h4>
                          <p className="text-body text-foreground leading-relaxed whitespace-pre-wrap">
                            {jl?.description}
                          </p>
                        </div>

                        {chatUnlocked && recruiter && (
                          <div className="bg-accent/5 rounded-2xl p-6 border border-accent/20">
                            <h4 className="text-small font-bold uppercase tracking-wider text-accent mb-4">Recruiter Contact Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="flex items-center gap-3">
                                <span className="text-lg">👤</span>
                                <div>
                                  <p className="text-xs text-muted uppercase font-bold">Recruiter</p>
                                  <p className="text-body font-medium">{recruiter.full_name}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-lg">📧</span>
                                <a href={`mailto:${recruiter.email}`} className="hover:text-accent transition-colors">
                                  <p className="text-xs text-muted uppercase font-bold">Email</p>
                                  <p className="text-body font-medium">{recruiter.email}</p>
                                </a>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-lg">📱</span>
                                <div>
                                  <p className="text-xs text-muted uppercase font-bold">WhatsApp</p>
                                  <p className="text-body font-medium">{recruiter.whatsapp_number || "Not provided"}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-lg">🔗</span>
                                <a href={recruiter.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                                  <p className="text-xs text-muted uppercase font-bold">LinkedIn</p>
                                  <p className="text-body font-medium">View Profile</p>
                                </a>
                              </div>
                            </div>
                          </div>
                        )}
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
