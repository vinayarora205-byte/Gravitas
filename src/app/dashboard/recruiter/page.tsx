"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Briefcase, Users, CheckCircle, ArrowRight, ChatCircle } from "@phosphor-icons/react";

const statusStyle = (isActive: boolean) =>
  isActive
    ? { background: "#E8F5E9", color: "#2E7D32" }
    : { background: "#FFEBEE", color: "#C62828" };

export default function RecruiterDashboard() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  const [profile, setProfile] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [matchesCount, setMatchesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hBalance, setHBalance] = useState(0);
  const [hTransactions, setHTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.push("/sign-in");
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const { data: profileData, error } = await supabase
        .from("profiles").select("*").eq("clerk_user_id", user.id).maybeSingle();

      if (error || !profileData || profileData.role?.toUpperCase() !== "RECRUITER") {
        router.push("/role-select"); return;
      }
      setProfile(profileData);

      const { data: jobsData } = await supabase
        .from("job_listings").select("*")
        .eq("profile_id", profileData.id).order("created_at", { ascending: false });
      setJobs(jobsData || []);

      const jobIds = jobsData?.map((j: any) => j.id) || [];
      if (jobIds.length > 0) {
        const { count } = await supabase
          .from("matches").select("id", { count: "exact", head: true }).in("job_id", jobIds);
        setMatchesCount(count || 0);
      }
      setLoading(false);
    };

    if (isSignedIn) {
      fetchData();
      fetch("/api/hiries/balance")
        .then(r => r.json())
        .then(d => { setHBalance(d.balance || 0); setHTransactions((d.transactions || []).slice(0, 5)); })
        .catch(() => {});
    }
  }, [user, isSignedIn, router]);

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 rounded-full border-2 border-[#E8E3DD] border-t-[#FF6A2A] animate-spin" />
      </div>
    );
  }

  const stats = [
    { label: "Active Roles", value: jobs.length, Icon: Briefcase, sub: "Job listings posted" },
    { label: "Total Matches", value: matchesCount, Icon: Users, sub: "Across all roles" },
    { label: "Profile Status", value: "Verified", Icon: CheckCircle, isStatus: true, statusOk: true },
    { label: "Hiries Balance", value: hBalance, Icon: Briefcase, sub: "Available credits", isHiries: true },
  ];

  return (
    <div className="space-y-8 font-sans max-w-[1100px]">

      {/* Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mb-3"
            style={{ background: "#FFF3EE", color: "#FF6A2A" }}
          >
            <ChatCircle size={12} weight="fill" /> Recruiter Portal
          </div>
          <h1 className="font-serif text-[32px] font-bold italic text-[#0F0F0F]">
            Welcome back, {profile?.full_name?.split(" ")[0] || "Recruiter"}
          </h1>
          <p className="text-[14px] text-gray-400 mt-1">Your hiring command center.</p>
        </div>
        <button
          onClick={() => router.push("/chat")}
          className="flex items-center gap-2 text-white text-[14px] font-medium px-5 py-3 rounded-[10px] shrink-0 hover:opacity-90 transition-opacity"
          style={{ background: "#FF6A2A" }}
        >
          Post Job via Claura <ArrowRight size={16} weight="bold" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-white rounded-[16px] p-6"
            style={{ border: "1px solid #E8E3DD" }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
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
                style={s.statusOk ? { background: "#E8F5E9", color: "#2E7D32" } : { background: "#FFEBEE", color: "#C62828" }}
              >
                {s.value as string}
              </div>
            ) : (
              <div className="font-serif text-[36px] font-bold text-[#FF6A2A] leading-none mb-1">{s.value}</div>
            )}
            {s.sub && <div className="text-[12px] text-gray-400 mt-2">{s.sub}</div>}
          </div>
        ))}
      </div>

      {/* Jobs Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-[22px] font-bold italic text-[#0F0F0F]">Active Job Listings</h2>
          <button
            onClick={() => router.push("/dashboard/recruiter/jobs")}
            className="text-[13px] font-medium text-[#FF6A2A] hover:underline"
          >
            View All →
          </button>
        </div>

        <div
          className="bg-white rounded-[16px] overflow-hidden"
          style={{ border: "1px solid #E8E3DD" }}
        >
          {jobs.length === 0 ? (
            <div className="py-16 text-center flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "#F6F1EB" }}>
                <Briefcase size={28} weight="duotone" color="#ccc" />
              </div>
              <div>
                <p className="font-bold text-[#0F0F0F] text-[15px] mb-1">No active jobs yet</p>
                <p className="text-[13px] text-gray-400">Tell Claura about a role to post it in seconds.</p>
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
                    {["Job Title", "Work Type", "Salary", "Status"].map(h => (
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
                  {jobs.map((job) => (
                    <tr
                      key={job.id}
                      className="cursor-pointer"
                      style={{ borderBottom: "1px solid #F0EDE8" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#FAFAFA")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-[14px] text-[#0F0F0F]">{job.job_title}</div>
                        <div className="text-[12px] text-gray-400 mt-0.5">{job.company_name || "—"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="text-[12px] font-medium px-2.5 py-1 rounded-[6px]"
                          style={{ background: "#F6F1EB", color: "#555" }}
                        >
                          {job.work_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[14px] font-medium text-[#0F0F0F]">
                        ₹{job.salary_max?.toLocaleString()}/mo
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="text-[12px] font-bold px-2.5 py-1 rounded-[6px]"
                          style={statusStyle(job.is_active)}
                        >
                          {job.is_active ? "Active" : "Closed"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Hiries Transactions (if any) */}
      {hTransactions.length > 0 && (
        <div>
          <h2 className="font-serif text-[22px] font-bold italic text-[#0F0F0F] mb-4">Recent Hiries Activity</h2>
          <div
            className="bg-white rounded-[16px] overflow-hidden"
            style={{ border: "1px solid #E8E3DD" }}
          >
            {hTransactions.map((t: any, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between px-6 py-4"
                style={{ borderBottom: i < hTransactions.length - 1 ? "1px solid #F0EDE8" : "none" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#FAFAFA")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div>
                  <div className="text-[14px] font-medium text-[#0F0F0F]">{t.description || t.type}</div>
                  <div className="text-[12px] text-gray-400 mt-0.5">
                    {new Date(t.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
                <div
                  className="font-bold text-[15px]"
                  style={{ color: t.amount > 0 ? "#2E7D32" : "#FF6A2A" }}
                >
                  {t.amount > 0 ? "+" : ""}{t.amount} 💎
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
