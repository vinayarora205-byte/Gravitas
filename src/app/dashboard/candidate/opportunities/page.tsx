"use client";
/* eslint-disable */
// @ts-nocheck

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@clerk/nextjs";

interface Opportunity {
  match_id: string;
  job_title: string;
  company_name: string;
  salary_min: number;
  salary_max: number;
  work_type: string;
  score: number;
  status: string;
  created_at: string;
}

export default function OpportunitiesPage() {
  const { user } = useUser();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOpportunities() {
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", user.id)
        .maybeSingle();

      if (!profile) { setLoading(false); return; }

      // Fetch matches for this candidate with job details
      const { data, error } = await supabase
        .from("matches")
        .select(`
          id,
          score,
          status,
          created_at,
          job_listings!job_id (
            job_title,
            company_name,
            salary_min,
            salary_max,
            work_type
          )
        `)
        .eq("candidate_id", profile.id)
        .order("score", { ascending: false });

      if (error) {
        console.error("Opportunities fetch error:", error);
      }

      if (data) {
        const transformed: Opportunity[] = data
          .filter((m: any) => m.job_listings)
          .map((m: any) => ({
            match_id: m.id,
            job_title: m.job_listings.job_title || "Untitled Role",
            company_name: m.job_listings.company_name || "Confidential",
            salary_min: m.job_listings.salary_min,
            salary_max: m.job_listings.salary_max,
            work_type: m.job_listings.work_type || "Not specified",
            score: m.score || 0,
            status: m.status || "PENDING",
            created_at: m.created_at
          }));
        setOpportunities(transformed);
      }
      setLoading(false);
    }
    fetchOpportunities();
  }, [user]);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>
        Loading opportunities...
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1F1F1F", marginBottom: "4px" }}>
          Opportunities
        </h1>
        <p style={{ color: "#666", fontSize: "14px" }}>
          AI-curated roles specifically for your profile.
        </p>
      </div>

      {opportunities.length === 0 ? (
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
          }}>💼</div>
          <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>
            No opportunities yet
          </h3>
          <p style={{ color: "#666", maxWidth: "320px", margin: "0 auto" }}>
            Complete your profile with GAIA to see personalized job matches.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {opportunities.map((o) => (
            <div key={o.match_id} style={{
              background: "white",
              border: "1px solid #EAEAEA",
              borderRadius: "16px",
              padding: "20px 24px",
              display: "flex",
              alignItems: "center",
              gap: "20px",
              transition: "box-shadow 200ms",
            }}>
              {/* Icon */}
              <div style={{
                width: "48px", height: "48px", borderRadius: "12px",
                background: "#FFF0EB", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "20px", flexShrink: 0
              }}>🏢</div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#1F1F1F" }}>
                    {o.job_title}
                  </h3>
                  <span style={{
                    padding: "2px 8px", borderRadius: "999px",
                    background: "#FF6B3D", color: "white",
                    fontSize: "11px", fontWeight: "700"
                  }}>{o.score}% Match</span>
                </div>
                <div style={{
                  display: "flex", gap: "16px", fontSize: "13px", color: "#666"
                }}>
                  <span>🏢 {o.company_name}</span>
                  <span>💰 ₹{o.salary_min || '?'}-{o.salary_max || '?'}/mo</span>
                  <span>📍 {o.work_type}</span>
                </div>
              </div>

              {/* Status */}
              <div style={{
                padding: "6px 14px", borderRadius: "8px",
                fontSize: "12px", fontWeight: "600",
                background: o.status === "ACCEPTED" ? "#E8F8F0" : o.status === "REJECTED" ? "#FEE" : "#FFF5F2",
                color: o.status === "ACCEPTED" ? "#2ECC71" : o.status === "REJECTED" ? "#E74C3C" : "#FF6B3D",
                border: `1px solid ${o.status === "ACCEPTED" ? "#A7E8C5" : o.status === "REJECTED" ? "#F5C6C6" : "#FFD4C4"}`
              }}>
                {o.status}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
