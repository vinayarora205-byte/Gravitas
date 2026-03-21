"use client";
/* eslint-disable */
// @ts-nocheck

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

interface Match {
  id: string;
  score: number;
  status: string;
  created_at: string;
  job_listings: {
    id: string;
    job_title: string;
    company_name: string;
    salary_min: number;
    salary_max: number;
    work_type: string;
    location: string;
    description: string;
    profiles: {
      full_name: string;
      email: string;
      whatsapp_number: string;
      linkedin_url: string;
      company_website: string;
    };
  };
}

export default function OpportunitiesPage() {
  const { user, isLoaded } = useUser();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchOpportunities = async () => {
    if (!user) return;

    // 1 & 2. Get profile from profiles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("clerk_user_id", user.id)
      .maybeSingle();

    if (!profile) {
      setLoading(false);
      return;
    }

    // 3. Get candidate_profile
    const { data: candidateProfile } = await supabase
      .from("candidate_profiles")
      .select("id")
      .eq("profile_id", profile.id)
      .maybeSingle();

    if (!candidateProfile) {
      setLoading(false);
      return;
    }

    // 4. Fetch matches using the JOIN structure
    const { data, error } = await supabase
      .from("matches")
      .select(`
        id,
        score,
        status,
        created_at,
        job_listings!job_id (
          id,
          job_title,
          company_name,
          salary_min,
          salary_max,
          work_type,
          location,
          description,
          profiles!profile_id (
            full_name,
            email,
            whatsapp_number,
            linkedin_url,
            company_website
          )
        )
      `)
      .eq("candidate_id", profile.id)
      .order("score", { ascending: false });

    if (error) {
      console.error("Matches fetch error:", error);
    } else {
      const transformedMatches = (data || []).map((m: any) => ({
        id: m.id,
        score: m.score,
        status: m.status,
        created_at: m.created_at,
        job_listings: {
          id: m.job_listings?.id,
          job_title: m.job_listings?.job_title,
          company_name: m.job_listings?.company_name,
          salary_min: m.job_listings?.salary_min,
          salary_max: m.job_listings?.salary_max,
          work_type: m.job_listings?.work_type,
          location: m.job_listings?.location,
          description: m.job_listings?.description,
          profiles: Array.isArray(m.job_listings?.profiles) 
            ? m.job_listings.profiles[0] 
            : m.job_listings?.profiles
        }
      }));
      setMatches(transformedMatches);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isLoaded) {
      fetchOpportunities();
    }
  }, [user, isLoaded]);

  const handleAccept = async (matchId: string) => {
    try {
      const res = await fetch(`/api/match/accept?match_id=${matchId}`);
      if (res.ok) {
        // Refresh data
        fetchOpportunities();
      }
    } catch (err) {
      console.error("Accept error:", err);
    }
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
      <div className="mb-10">
        <h1 className="text-h2 font-semibold text-foreground mb-2">My Opportunities</h1>
        <p className="text-muted text-body-lg">Exclusive matches hand-picked by GAIA for your profile.</p>
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
            const recruiter = jl.profiles;

            return (
              <Card 
                key={match.id} 
                className="overflow-hidden transition-all duration-300 border-border hover:border-accent/40"
              >
                <div className="p-6">
                  {/* Top Section */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-h3 font-semibold text-foreground">{jl.company_name}</h3>
                      <p className="text-body-lg text-accent font-medium">{jl.job_title}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={getScoreColor(match.score)}>
                        {match.score}% Score
                      </Badge>
                      <Badge variant={match.status === 'ACCEPTED' ? 'success' : match.status === 'REJECTED' ? 'error' : 'default'}>
                        {match.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Middle Section */}
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-muted text-body mb-6 pb-6 border-b border-border/50">
                    <span className="flex items-center gap-2">💰 {formatCurrency(jl.salary_min)} - {formatCurrency(jl.salary_max)}/mo</span>
                    <span className="flex items-center gap-2">📍 {jl.location}</span>
                    <span className="flex items-center gap-2">💼 {jl.work_type}</span>
                  </div>

                  {/* Actions & Expanded Content */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <button 
                        onClick={() => setExpandedId(isExpanded ? null : match.id)}
                        className="text-accent hover:underline font-medium text-body"
                      >
                        {isExpanded ? "Hide Details ↑" : "View Details ↓"}
                      </button>

                      {match.status === 'PENDING' && (
                        <Button 
                          variant="primary" 
                          size="sm"
                          onClick={() => handleAccept(match.id)}
                        >
                          I&apos;m Interested →
                        </Button>
                      )}
                    </div>

                    {isExpanded && (
                      <div className="fade-slide-up space-y-6 pt-2">
                        <div>
                          <h4 className="text-small font-bold uppercase tracking-wider text-muted mb-2">Job Description</h4>
                          <p className="text-body text-foreground leading-relaxed whitespace-pre-wrap">
                            {jl.description}
                          </p>
                        </div>

                        {match.status === 'ACCEPTED' && recruiter && (
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
                                  <p className="text-body font-medium">{recruiter.whatsapp_number || 'Not provided'}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-lg">🔗</span>
                                <a href={recruiter.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                                  <p className="text-xs text-muted uppercase font-bold">LinkedIn</p>
                                  <p className="text-body font-medium">View Profile</p>
                                </a>
                              </div>
                              {recruiter.company_website && (
                                <div className="flex items-center gap-3 col-span-full">
                                  <span className="text-lg">🌐</span>
                                  <a href={recruiter.company_website} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                                    <p className="text-xs text-muted uppercase font-bold">Company Website</p>
                                    <p className="text-body font-medium">{recruiter.company_website}</p>
                                  </a>
                                </div>
                              )}
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
