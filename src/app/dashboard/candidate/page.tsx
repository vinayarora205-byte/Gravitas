"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Briefcase, Users, CheckCircle, Target, ArrowRight, ChatCircle } from "@phosphor-icons/react";

const scoreStyle = (score: number) => {
  if (score >= 80) return { background: "#E8F5E9", color: "#2E7D32" };
  if (score >= 60) return { background: "#FFF3EE", color: "#FF6A2A" };
  return { background: "#FFEBEE", color: "#C62828" };
};

const statusStyle = (status: string) => {
  if (status === "ACCEPTED") return { background: "#E8F5E9", color: "#2E7D32" };
  if (status === "REJECTED") return { background: "#FFEBEE", color: "#C62828" };
  return { background: "#FFF3EE", color: "#FF6A2A" };
};

export default function CandidateDashboard() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [candProfile, setCandProfile] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [matchesCount, setMatchesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push("/sign-in");
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const { data: profileData, error } = await supabase
        .from("profiles").select("id, full_name, hiries_balance, role").eq("clerk_user_id", user.id).maybeSingle();

      if (error || !profileData || profileData.role?.toUpperCase() !== "CANDIDATE") {
        router.push("/role-select"); return;
      }
      setProfile(profileData);

      const { data: cpData } = await supabase
        .from("candidate_profiles").select("id, job_title, work_type").eq("profile_id", profileData.id).maybeSingle();
      setCandProfile(cpData);
      
      let mCount = 0;
      let mData: any[] = [];
      if (cpData) {
        const { count } = await supabase
          .from("matches").select("*", { count: "exact", head: true })
          .eq("candidate_id", profileData.id);
        mCount = count || 0;
        
        const { data: matchesData } = await supabase
          .from("matches").select("id, score, status, chat_unlocked, job_listings(job_title, company_name, salary_min, salary_max, work_type)")
          .eq("candidate_id", profileData.id)
          .order("score", { ascending: false })
          .limit(5);
        mData = matchesData || [];
      }
      setMatchesCount(mCount);
      setMatches(mData);
      setLoading(false);
    };
    if (isSignedIn) fetchData();
  }, [user, isSignedIn, router]);

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 rounded-full border-2 border-[#E8E3DD] border-t-[#FF6A2A] animate-spin" />
      </div>
    );
  }

  const stats = [
    {
      label: "Target Role",
      value: candProfile?.job_title || "Not set yet",
      Icon: Target,
      sub: "Your goal position",
    },
    {
      label: "Total Matches",
      value: matchesCount || 0,
      Icon: Users,
      sub: "Across all opportunities",
    },
    {
      label: "Hiries Balance",
      value: profile?.hiries_balance || 0,
      Icon: Briefcase,
      sub: "Available credits",
    },
    {
      label: "Visibility",
      value: candProfile ? "Active" : "Incomplete",
      Icon: CheckCircle,
      isStatus: true,
      statusOk: !!candProfile,
    },
  ];

  return (
    <div className="space-y-8 font-sans max-w-[1100px]">

      {/* Welcome header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mb-3"
            style={{ background: "#FFF3EE", color: "#FF6A2A" }}
          >
            <ChatCircle size={12} weight="fill" /> Candidate Portal
          </div>
          <h1 className="font-serif text-[32px] font-bold italic text-[#0F0F0F]">
            Welcome back, {profile?.full_name?.split(" ")[0] || "Candidate"}
          </h1>
          <p className="text-[14px] text-gray-400 mt-1">Manage your matches and opportunities</p>
        </div>
        <button
          onClick={() => router.push("/chat")}
          className="flex items-center gap-2 text-white text-[14px] font-medium px-5 py-3 rounded-[10px] shrink-0 hover:opacity-90 transition-opacity"
          style={{ background: "#FF6A2A" }}
        >
          Chat with Claura <ArrowRight size={16} weight="bold" />
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-white rounded-[16px] p-6"
            style={{ border: "1px solid #E8E3DD" }}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="text-[11px] font-bold uppercase tracking-widest text-gray-400"
                style={{ letterSpacing: "0.08em" }}
              >
                {s.label}
              </div>
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "#FFF3EE" }}
              >
                <s.Icon size={18} weight="fill" color="#FF6A2A" />
              </div>
            </div>
            {s.isStatus ? (
              <div
                className="text-[13px] font-bold px-3 py-1.5 rounded-full w-fit"
                style={s.statusOk ? { background: "#E8F5E9", color: "#2E7D32" } : { background: "#FFF3EE", color: "#FF6A2A" }}
              >
                {s.value as string}
              </div>
            ) : (
              <div className="font-serif text-[36px] font-bold text-[#FF6A2A] leading-none mb-1">{s.value}</div>
            )}
            <div className="text-[12px] text-gray-400 mt-2">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Matches Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-[22px] font-bold italic text-[#0F0F0F]">Match Opportunities</h2>
          <button
            onClick={() => router.push("/dashboard/candidate/opportunities")}
            className="text-[13px] font-medium text-[#FF6A2A] hover:underline"
          >
            View All →
          </button>
        </div>

        <div
          className="bg-white rounded-[16px] overflow-hidden"
          style={{ border: "1px solid #E8E3DD" }}
        >
          {matches.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "#F6F1EB" }}>
                <Briefcase size={28} weight="duotone" color="#ccc" />
              </div>
              <div>
                <p className="font-bold text-[#0F0F0F] text-[15px] mb-1">No matches yet</p>
                <p className="text-[13px] text-gray-400">Talk to Claura to start getting matched with roles.</p>
              </div>
              <button
                onClick={() => router.push("/chat")}
                className="text-[13px] font-medium px-5 py-2 rounded-[8px] transition-colors"
                style={{ border: "1px solid #E8E3DD", color: "#0F0F0F" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#F6F1EB")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                Open Claura Chat
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: "#F6F1EB" }}>
                    {["Role", "Company", "Score", "Status"].map(h => (
                      <th
                        key={h}
                        className="px-6 py-3 text-left text-[11px] font-bold uppercase tracking-widest text-gray-400"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matches.slice(0, 6).map((match) => {
                    const job = match.job_listings;
                    const score = match.score <= 1 ? Math.round(match.score * 100) : Math.round(match.score);
                    return (
                      <tr
                        key={match.id}
                        className="cursor-pointer"
                        style={{ borderBottom: "1px solid #F0EDE8" }}
                        onClick={() => router.push("/dashboard/candidate/opportunities")}
                        onMouseEnter={e => (e.currentTarget.style.background = "#FAFAFA")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <td className="px-6 py-4">
                          <div className="font-bold text-[14px] text-[#0F0F0F]">{job?.job_title}</div>
                          <div className="text-[12px] text-gray-400 mt-0.5">{job?.work_type}</div>
                        </td>
                        <td className="px-6 py-4 text-[14px] font-medium text-[#0F0F0F]">
                          {job?.company_name || "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="text-[12px] font-bold px-2.5 py-1 rounded-[6px]"
                            style={scoreStyle(score)}
                          >
                            {score}%
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className="text-[12px] font-bold px-2.5 py-1 rounded-[6px]"
                            style={statusStyle(match.status)}
                          >
                            {match.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
