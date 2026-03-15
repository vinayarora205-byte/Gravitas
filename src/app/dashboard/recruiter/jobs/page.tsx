"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

interface JobListing {
  id: string;
  job_title: string;
  company_name: string;
  location: string;
  work_type: string;
  is_active: boolean;
  created_at: string;
}

export default function RecruiterJobsPage() {
  const { user } = useUser();
  const [jobs, setJobs] = useState<JobListing[]>([]);

  useEffect(() => {
    async function loadJobs() {
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", user.id)
        .single();

      if (profile) {
        const { data } = await supabase
          .from("job_listings")
          .select("*")
          .eq("profile_id", profile.id)
          .order("created_at", { ascending: false });
        setJobs(data || []);
      }
    }
    loadJobs();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ghost">Jobs</h1>
        <Link href="/dashboard/recruiter/jobs/new">
          <Button variant="primary">+ Post New Job</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
        {jobs.map((job) => (
          <Card key={job.id}>
            <div className="flex justify-between mb-3">
              <Badge variant={job.is_active ? "success" : "default"}>{job.is_active ? "Active" : "Closed"}</Badge>
              <span className="text-xs text-ghost-dim">{new Date(job.created_at).toLocaleDateString()}</span>
            </div>
            <h3 className="text-base font-semibold text-ghost mb-1">{job.job_title}</h3>
            <p className="text-xs text-ghost-dim mb-4">{job.company_name} • {job.location}</p>
            <Badge variant="accent">{job.work_type}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
