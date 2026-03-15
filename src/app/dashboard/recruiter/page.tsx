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

export default function RecruiterDashboard() {
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  
  const [profile, setProfile] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [matchesCount, setMatchesCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

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

      const { data: jobsData } = await supabase
        .from("job_listings")
        .select("*")
        .eq("profile_id", profileData.id)
        .order("created_at", { ascending: false });

      setJobs(jobsData || []);
      
      const jobIds = jobsData?.map(j => j.id) || [];
      let count = 0;
      if (jobIds.length > 0) {
        const { count: matchCount } = await supabase
          .from("matches")
          .select("id", { count: 'exact', head: true })
          .in("job_id", jobIds);
        count = matchCount || 0;
      }
        
      setMatchesCount(count);
      setLoading(false);
    };

    if (isSignedIn) {
      fetchData();
    }
  }, [user, isSignedIn, router]);

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 rounded-full border-4 border-accent border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const activeJobs = jobs.filter(j => j.is_active).length;

  return (
    <div className="fade-in">
      <div className="flex justify-between items-end mb-8 fade-slide-up">
        <div>
          <h1 className="text-h2 text-foreground font-semibold mb-2">Welcome, {profile?.full_name || 'Recruiter'}</h1>
          <p className="text-muted text-body">Here is an overview of your recruiting pipeline.</p>
        </div>
        <Button variant="primary" onClick={() => router.push('/chat')}>Post Job via GAIA →</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="fade-slide-up" style={{ animationDelay: '50ms' }}>
           <h3 className="text-subtle text-small font-medium uppercase tracking-wider mb-2">Active Roles</h3>
           <div className="text-h2 font-semibold text-foreground">{activeJobs}</div>
        </Card>
        <Card className="fade-slide-up" style={{ animationDelay: '100ms' }}>
           <h3 className="text-subtle text-small font-medium uppercase tracking-wider mb-2">Total Matches</h3>
           <div className="text-h2 font-semibold text-foreground">{matchesCount}</div>
        </Card>
        <Card className="fade-slide-up" style={{ animationDelay: '150ms' }}>
           <h3 className="text-subtle text-small font-medium uppercase tracking-wider mb-2">Profile Status</h3>
           <div className="mt-2 text-foreground"><Badge variant="success">Verified</Badge></div>
        </Card>
      </div>

      <h2 className="text-h3 text-foreground font-medium mb-6 fade-slide-up" style={{ animationDelay: '200ms' }}>
        Active Job Listings
      </h2>
      
      <div className="bg-card border border-border rounded-2xl overflow-hidden fade-slide-up shadow-sm" style={{ animationDelay: '250ms' }}>
        {jobs.length === 0 ? (
          <div className="p-12 text-center text-muted text-body flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-4 text-border" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            You haven&apos;t posted any jobs yet. Talk to GAIA to create one.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-black/5 dark:bg-white/5 text-subtle text-xs uppercase tracking-wider font-medium">
              <tr>
                <th className="p-4 border-b border-border">Role</th>
                <th className="p-4 border-b border-border">Type</th>
                <th className="p-4 border-b border-border">Budget</th>
                <th className="p-4 border-b border-border">Status</th>
              </tr>
            </thead>
            <tbody className="text-body text-foreground">
              {jobs.map((job) => (
                <tr key={job.id} className="border-b border-border hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium">{job.job_title}</td>
                  <td className="p-4 text-muted">{job.work_type}</td>
                  <td className="p-4 text-muted">₹{job.salary_max}/mo</td>
                  <td className="p-4">
                    <Badge variant={job.is_active ? "success" : "default"}>
                      {job.is_active ? "Active" : "Closed"}
                    </Badge>
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
