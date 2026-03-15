"use client";
/* eslint-disable */
// @ts-nocheck

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";

interface TalentMatch {
  match_id: string;
  candidate_name: string;
  job_title: string;
  skills: string[];
  salary_min: number;
  salary_max: number;
  work_type: string;
  experience_years: string;
  score: number;
  status: string;
}

export default function TalentPoolPage() {
  const { user } = useUser();
  const [candidates, setCandidates] = useState<TalentMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTalent() {
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", user.id)
        .maybeSingle();

      if (!profile) { setLoading(false); return; }

      // First get this recruiter's job listing IDs
      const { data: myJobs } = await supabase
        .from("job_listings")
        .select("id")
        .eq("profile_id", profile.id);

      if (!myJobs || myJobs.length === 0) { setLoading(false); return; }

      const jobIds = myJobs.map(j => j.id);

      // Fetch matches for those jobs
      const { data, error } = await supabase
        .from("matches")
        .select(`
          id,
          score,
          status,
          candidate_profiles!candidate_id (
            job_title,
            skills,
            salary_min,
            salary_max,
            work_type,
            experience_years,
            profiles!profile_id (
              full_name
            )
          )
        `)
        .in("job_id", jobIds)
        .order("score", { ascending: false });

      if (error) {
        console.error("Talent pool fetch error:", error);
      }

      if (data) {
        const transformed: TalentMatch[] = data
          .filter((m: any) => m.candidate_profiles)
          .map((m: any) => ({
            match_id: m.id,
            candidate_name: m.candidate_profiles?.profiles?.full_name || "Anonymous",
            job_title: m.candidate_profiles?.job_title || "Not specified",
            skills: m.candidate_profiles?.skills || [],
            salary_min: m.candidate_profiles?.salary_min,
            salary_max: m.candidate_profiles?.salary_max,
            work_type: m.candidate_profiles?.work_type || "Not specified",
            experience_years: m.candidate_profiles?.experience_years || "Not specified",
            score: m.score || 0,
            status: m.status || "PENDING"
          }));
        setCandidates(transformed);
      }
      setLoading(false);
    }
    fetchTalent();
  }, [user]);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>
        Loading talent pool...
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1F1F1F", marginBottom: "4px" }}>
          Talent Pool
        </h1>
        <p style={{ color: "#666", fontSize: "14px" }}>
          Manage and connect with your top-matched candidates.
        </p>
      </div>

      {candidates.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "60px 24px",
          background: "white",
          border: "1px solid #EAEAEA",
          borderRadius: "16px"
        }}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "50%",
            background: "#FFF0EB", display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 16px", fontSize: "24px"
          }}>⭐</div>
          <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>
            No candidates found
          </h3>
          <p style={{ color: "#666", maxWidth: "320px", margin: "0 auto" }}>
            Post a job via GAIA and matching candidates will appear here.
          </p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
          gap: "16px"
        }}>
          {candidates.map((c) => (
            <div key={c.match_id} style={{
              background: "white",
              border: "1px solid #EAEAEA",
              borderRadius: "16px",
              padding: "24px",
              position: "relative"
            }}>
              {/* Match badge */}
              <div style={{
                position: "absolute", top: "16px", right: "16px",
                padding: "2px 8px", borderRadius: "999px",
                background: "#FF6B3D", color: "white",
                fontSize: "11px", fontWeight: "700"
              }}>{c.score}% Match</div>

              {/* Avatar + Name */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                <div style={{
                  width: "48px", height: "48px", borderRadius: "12px",
                  background: "linear-gradient(135deg, #FFF0EB, #FFD4C4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "18px", fontWeight: "700", color: "#FF6B3D"
                }}>{c.candidate_name.charAt(0)}</div>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#1F1F1F" }}>
                    {c.candidate_name}
                  </h3>
                  <p style={{ fontSize: "13px", color: "#666" }}>{c.job_title}</p>
                </div>
              </div>

              {/* Details */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
                <div style={{ fontSize: "13px", color: "#666" }}>
                  📅 Experience: {c.experience_years} years
                </div>
                <div style={{ fontSize: "13px", color: "#666" }}>
                  💰 ₹{c.salary_min || '?'}-{c.salary_max || '?'}/mo
                </div>
                <div style={{ fontSize: "13px", color: "#666" }}>
                  📍 {c.work_type}
                </div>
              </div>

              {/* Skills */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                {c.skills.slice(0, 4).map((s: string, i: number) => (
                  <span key={i} style={{
                    padding: "4px 10px", borderRadius: "8px",
                    background: "#F5F5F5", border: "1px solid #EAEAEA",
                    fontSize: "12px", color: "#666"
                  }}>{s}</span>
                ))}
                {c.skills.length > 4 && (
                  <span style={{ fontSize: "12px", color: "#999", padding: "4px" }}>
                    +{c.skills.length - 4} more
                  </span>
                )}
              </div>

              {/* Action */}
              <div style={{
                borderTop: "1px solid #EAEAEA",
                paddingTop: "12px",
                display: "flex", justifyContent: "space-between", alignItems: "center"
              }}>
                <span style={{
                  fontSize: "12px", fontWeight: "600",
                  color: c.status === "ACCEPTED" ? "#2ECC71" : c.status === "REJECTED" ? "#E74C3C" : "#FF6B3D"
                }}>{c.status}</span>
                <button style={{
                  padding: "8px 16px", borderRadius: "10px",
                  background: "#FF6B3D", color: "white", border: "none",
                  fontSize: "13px", fontWeight: "600", cursor: "pointer"
                }}>View Profile</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
