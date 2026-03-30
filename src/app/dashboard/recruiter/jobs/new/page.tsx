"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { CaretLeft, Sparkle, Globe, CurrencyCircleDollar, ShootingStar } from "@phosphor-icons/react";

export default function NewJobPage() {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    job_title: "",
    company_name: "",
    location: "",
    work_type: "full-time",
    description: "",
    salary_min: "",
    salary_max: "",
    required_skills: "",
  });

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !form.job_title) return;

    setLoading(true);

    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("clerk_user_id", user.id)
      .single();

    if (!profile) {
      setLoading(false);
      return;
    }

    const skillsArray = form.required_skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const { error } = await supabase.from("job_listings").insert({
      profile_id: profile.id,
      job_title: form.job_title,
      company_name: form.company_name || null,
      location: form.location || null,
      work_type: form.work_type,
      description: form.description || null,
      salary_min: form.salary_min ? parseInt(form.salary_min) : null,
      salary_max: form.salary_max ? parseInt(form.salary_max) : null,
      required_skills: skillsArray,
      is_active: true,
    });

    setLoading(false);
    if (!error) {
      router.push("/dashboard/recruiter/jobs");
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[10px] font-black text-dark/30 hover:text-dark uppercase tracking-widest transition-colors mb-12"
      >
        <CaretLeft weight="bold" /> Back to Dashboard
      </button>

      <div className="mb-16">
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-2xl bg-orange flex items-center justify-center text-white shadow-lg shadow-orange/20">
            <Sparkle weight="fill" size={20} />
          </div>
          <h1 className="text-4xl font-bold text-dark serif italic tracking-tight">Deploy New Opportunity</h1>
        </div>
        <p className="text-sm font-medium text-dark/40 uppercase tracking-widest pl-1">Define the parameters of your next strategic hire</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* Basic Intelligence */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
             <div className="h-px flex-1 bg-black/[0.03]" />
             <span className="text-[10px] font-black text-dark/20 uppercase tracking-widest px-4">Core Identification</span>
             <div className="h-px flex-1 bg-black/[0.03]" />
          </div>
          <Input 
            label="Opportunity Title" 
            placeholder="e.g. Principal Systems Architect" 
            value={form.job_title} 
            onChange={(e) => updateField("job_title", e.target.value)} 
            required 
            icon={<ShootingStar size={18} weight="duotone" />}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Organization" 
              placeholder="Your Agency or Client Name" 
              value={form.company_name} 
              onChange={(e) => updateField("company_name", e.target.value)} 
              icon={<Sparkle size={18} weight="duotone" />}
            />
            <Input 
              label="Geographical Focus" 
              placeholder="e.g. Remote, UK, or Hybrid" 
              value={form.location} 
              onChange={(e) => updateField("location", e.target.value)} 
              icon={<Globe size={18} weight="duotone" />}
            />
          </div>
        </section>

        {/* Operational Scope */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
             <div className="h-px flex-1 bg-black/[0.03]" />
             <span className="text-[10px] font-black text-dark/20 uppercase tracking-widest px-4">Operational Parameters</span>
             <div className="h-px flex-1 bg-black/[0.03]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-dark/40 ml-1">Engagement Model</label>
              <select
                value={form.work_type}
                onChange={(e) => updateField("work_type", e.target.value)}
                className="w-full bg-gray-50 border border-black/5 rounded-2xl px-5 py-4 text-sm text-dark font-medium focus:outline-none focus:border-orange/30 focus:bg-white focus:ring-4 focus:ring-orange/5 transition-all appearance-none cursor-pointer"
              >
                <option value="full-time">Full-time Deployment</option>
                <option value="part-time">Part-time Engagement</option>
                <option value="contract">Fixed-term Contract</option>
                <option value="remote">Fully Remote Protocol</option>
              </select>
            </div>
            <Input 
              label="Skillset Architecture" 
              placeholder="React, TypeScript, AWS..." 
              value={form.required_skills} 
              onChange={(e) => updateField("required_skills", e.target.value)} 
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-dark/40 ml-1">Detailed Brief</label>
            <textarea
              placeholder="Describe the mission, technology stack, and cultural alignment..."
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={6}
              className="w-full bg-gray-50 border border-black/5 rounded-[32px] px-6 py-5 text-sm text-dark font-medium focus:outline-none focus:border-orange/30 focus:bg-white focus:ring-4 focus:ring-orange/5 transition-all resize-none placeholder:text-dark/20"
            />
          </div>
        </section>

        {/* Capital Allocation */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
             <div className="h-px flex-1 bg-black/[0.03]" />
             <span className="text-[10px] font-black text-dark/20 uppercase tracking-widest px-4">Capital Allocation</span>
             <div className="h-px flex-1 bg-black/[0.03]" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Minimum Threshold (£)" 
              type="number" 
              value={form.salary_min} 
              onChange={(e) => updateField("salary_min", e.target.value)} 
              icon={<CurrencyCircleDollar size={18} weight="duotone" />}
            />
            <Input 
              label="Maximum Threshold (£)" 
              type="number" 
              value={form.salary_max} 
              onChange={(e) => updateField("salary_max", e.target.value)} 
              icon={<CurrencyCircleDollar size={18} weight="duotone" />}
            />
          </div>
        </section>

        <div className="pt-8 flex flex-col items-center">
          <Button
            type="submit"
            variant="primary"
            disabled={loading || !form.job_title}
            className="w-full md:w-auto md:px-12 py-5 shadow-2xl shadow-orange/30 text-base"
          >
            {loading ? "Synchronizing..." : "Publish Opportunity →"}
          </Button>
          <p className="mt-4 text-[10px] font-black text-dark/20 uppercase tracking-widest text-center">Your mission will be broadcasted to all calibrated candidates</p>
        </div>
      </form>
    </div>
  );
}

