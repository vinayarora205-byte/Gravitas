"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { Plus, Briefcase, MapPin, Calendar, CaretRight } from "@phosphor-icons/react";

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-dark serif italic tracking-tight mb-2">Job Board</h1>
          <p className="text-sm font-medium text-dark/40 uppercase tracking-widest">Manage your active recruitment campaigns</p>
        </div>
        <Link href="/dashboard/recruiter/jobs/new">
          <Button variant="primary" className="shadow-lg shadow-orange/20">
            <Plus weight="bold" /> Post New Job
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <div
            key={job.id}
            className="fade-up"
          >
            <Card className="p-8 group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 border-black/[0.03]">
              <div className="flex justify-between items-start mb-6">
                <Badge variant={job.is_active ? "success" : "default"}>
                  {job.is_active ? "Active Deployment" : "Closed"}
                </Badge>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-dark/20 uppercase tracking-widest">
                  <Calendar size={14} />
                  {new Date(job.created_at).toLocaleDateString()}
                </div>
              </div>
              
              <div className="space-y-4 mb-8">
                <h3 className="text-xl font-bold text-dark leading-tight group-hover:text-orange transition-colors">
                  {job.job_title}
                </h3>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-dark/40">
                    <Briefcase size={16} weight="duotone" className="text-orange" />
                    {job.company_name}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-dark/40">
                    <MapPin size={16} weight="duotone" className="text-orange" />
                    {job.location}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-black/5">
                <Badge variant="primary" className="bg-orange/5 text-orange border-none px-3 py-1">
                  {job.work_type}
                </Badge>
                <Link href={`/dashboard/recruiter/jobs/${job.id}`} className="text-dark/20 group-hover:text-orange transition-colors">
                  <CaretRight size={20} weight="bold" />
                </Link>
              </div>
            </Card>
          </div>
        ))}

        {jobs.length === 0 && (
          <div className="col-span-full py-20 text-center bg-gray-50 rounded-[40px] border border-dashed border-black/10">
            <div className="size-16 rounded-3xl bg-white border border-black/5 flex items-center justify-center mx-auto mb-6 text-dark/20 shadow-sm">
              <Briefcase size={32} weight="duotone" />
            </div>
            <h3 className="text-xl font-bold text-dark serif italic mb-2">No active jobs found</h3>
            <p className="text-dark/40 text-sm font-medium mb-8">Initiate your first recruitment campaign to get started.</p>
            <Link href="/dashboard/recruiter/jobs/new">
              <Button variant="outline">Post First Job</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
