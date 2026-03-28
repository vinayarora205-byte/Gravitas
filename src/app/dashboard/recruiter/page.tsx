"use client";
/* eslint-disable */
// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Briefcase, Users, CheckCircle, Diamond } from "@phosphor-icons/react";

export default function RecruiterDashboard() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  
  const [profile, setProfile] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [matchesCount, setMatchesCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [hBalance, setHBalance] = useState(0);
  const [hTransactions, setHTransactions] = useState<any[]>([]);
  const [showHiries, setShowHiries] = useState(false);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("clerk_user_id", user.id)
        .maybeSingle();

      if (profileError || !profileData || profileData.role?.toUpperCase() !== "RECRUITER") {
        router.push("/role-select");
        return;
      }

      setProfile(profileData);
      
      setLoading(true);

      // 1. Active Roles = COUNT from job_listings WHERE profile_id = current user profile id
      const { data: jobsData, count: jobsCount } = await supabase
        .from("job_listings")
        .select("*", { count: 'exact' })
        .eq("profile_id", profileData.id)
        .order("created_at", { ascending: false });

      setJobs(jobsData || []);
      
      // 2. Total Matches = COUNT from matches WHERE job_id IN (SELECT id FROM job_listings WHERE profile_id = current user profile id)
      const jobIds = jobsData?.map(j => j.id) || [];
      let matchCount = 0;
      if (jobIds.length > 0) {
        const { count } = await supabase
          .from("matches")
          .select("id", { count: 'exact', head: true })
          .in("job_id", jobIds);
        matchCount = count || 0;
      }
        
      setMatchesCount(matchCount);
      setLoading(false);
    };

    if (isSignedIn) {
      fetchData();
      fetch('/api/hiries/balance').then(r => r.json()).then(d => {
        setHBalance(d.balance || 0);
        setHTransactions((d.transactions || []).slice(0, 5));
      }).catch(() => {});
    }
  }, [user, isSignedIn, router]);

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 rounded-full border-4 border-accent border-t-transparent animate-spin"></div>
      </div>
    );
  }


  return (
    <div className="fade-in">
      <div className="flex justify-between items-end mb-8 fade-slide-up">
        <div>
          <h1 className="text-[32px] font-extrabold italic tracking-tight text-foreground mb-1">Welcome, {profile?.full_name || 'Recruiter'}</h1>
          <p className="text-muted text-sm font-medium">Here is an overview of your recruiting pipeline.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative glass rounded-xl px-1">
            <button onClick={() => setShowHiries(!showHiries)} className="px-4 py-2 font-bold text-sm text-orange flex items-center gap-2 hover:bg-white/5 transition-colors rounded-xl">
              <Diamond size={18} weight="duotone" /> {hBalance} Hiries
            </button>
            {showHiries && (
              <div className="absolute right-0 top-14 w-72 glass bg-card/90 border border-white/10 rounded-2xl shadow-2xl z-50 p-5">
                <h4 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  <Diamond size={16} weight="duotone" className="text-orange"/> {hBalance} Hiries Available
                </h4>
                {hTransactions.length > 0 ? (
                  <div className="space-y-3 mb-4">
                    {hTransactions.map((t: any, i: number) => (
                      <div key={i} className="flex justify-between text-xs text-muted border-b border-white/5 pb-2">
                        <span className="font-medium">{t.type}</span>
                        <span className={t.amount > 0 ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>{t.amount > 0 ? '+' : ''}{t.amount}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted mb-4 font-medium">No transactions yet</p>
                )}
                <a href="/pricing" className="text-xs text-orange font-bold hover:underline">Need more? Buy now →</a>
              </div>
            )}
          </div>
          <button onClick={() => router.push('/chat')} className="bg-orange text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-[0_0_15px_rgba(255,107,61,0.4)] hover:scale-105 transition-transform">
            Post Job via Claura →
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass p-6 rounded-[20px] border-t-4 border-t-orange relative overflow-hidden group hover:bg-white/5 transition-colors fade-slide-up" style={{ animationDelay: '50ms' }}>
          <div className="absolute top-6 right-6 p-2 bg-orange/10 rounded-xl">
            <Briefcase className="text-orange" size={24} weight="duotone" />
          </div>
          <h3 className="text-[12px] font-bold text-muted uppercase tracking-wider mb-2">Active Roles</h3>
          <div className="text-[36px] font-extrabold text-gradient mb-2">{jobs.length}</div>
          <div className="text-xs font-semibold text-green-500">+2% this week</div>
        </div>
        
        <div className="glass p-6 rounded-[20px] border-t-4 border-t-orange relative overflow-hidden group hover:bg-white/5 transition-colors fade-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="absolute top-6 right-6 p-2 bg-orange/10 rounded-xl">
            <Users className="text-orange" size={24} weight="duotone" />
          </div>
          <h3 className="text-[12px] font-bold text-muted uppercase tracking-wider mb-2">Total Matches</h3>
          <div className="text-[36px] font-extrabold text-gradient mb-2">{matchesCount}</div>
          <div className="text-xs font-semibold text-green-500">+12% this week</div>
        </div>

        <div className="glass p-6 rounded-[20px] border-t-4 border-t-orange relative overflow-hidden group hover:bg-white/5 transition-colors fade-slide-up" style={{ animationDelay: '150ms' }}>
          <div className="absolute top-6 right-6 p-2 bg-orange/10 rounded-xl">
            <CheckCircle className="text-orange" size={24} weight="duotone" />
          </div>
          <h3 className="text-[12px] font-bold text-muted uppercase tracking-wider mb-2">Profile Status</h3>
          <div className="mt-4"><span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-sm font-bold border border-green-500/20">Verified</span></div>
        </div>
      </div>

      <h2 className="text-xl font-bold italic tracking-tight text-foreground mb-6 fade-slide-up" style={{ animationDelay: '200ms' }}>
        Active Job Listings
      </h2>
      
      <div className="glass border border-white/10 rounded-2xl overflow-hidden fade-slide-up shadow-sm" style={{ animationDelay: '250ms' }}>
        {jobs.length === 0 ? (
          <div className="p-12 text-center text-muted text-body flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-4 text-border" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            You haven&apos;t posted any jobs yet. Talk to Claura to create one.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/5 text-muted text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="p-5 border-b border-white/10">Role</th>
                <th className="p-5 border-b border-white/10">Type</th>
                <th className="p-5 border-b border-white/10">Budget</th>
                <th className="p-5 border-b border-white/10">Status</th>
              </tr>
            </thead>
            <tbody className="text-body text-foreground">
              {jobs.map((job) => (
                <tr key={job.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-5 font-bold">{job.job_title}</td>
                  <td className="p-5 text-muted font-medium">{job.work_type}</td>
                  <td className="p-5 text-muted font-medium">₹{job.salary_max}/mo</td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${job.is_active ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-white/10 text-muted border-white/20'}`}>
                      {job.is_active ? "Active" : "Closed"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
