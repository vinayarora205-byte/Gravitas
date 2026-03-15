"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

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
      setLoading(false); return;
    }

    const skillsArray = form.required_skills.split(",").map(s => s.trim()).filter(Boolean);

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
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-ghost mb-1">Post New Job</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input label="Job Title" placeholder="Senior Software Engineer" value={form.job_title} onChange={(e) => updateField("job_title", e.target.value)} required />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Company Name" placeholder="Acme Corp" value={form.company_name} onChange={(e) => updateField("company_name", e.target.value)} />
          <Input label="Location" placeholder="London, UK or Remote" value={form.location} onChange={(e) => updateField("location", e.target.value)} />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono text-ghost-dim uppercase tracking-wider">Work Type</label>
          <select value={form.work_type} onChange={(e) => updateField("work_type", e.target.value)} className="w-full bg-void-lighter border border-void-border px-4 py-3 text-sm font-mono text-ghost focus:outline-none focus:border-cyan">
            <option value="full-time">Full-time</option>
            <option value="part-time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="remote">Remote</option>
          </select>
        </div>

        <Input label="Required Skills (comma separated)" placeholder="React, TypeScript, Node.js" value={form.required_skills} onChange={(e) => updateField("required_skills", e.target.value)} />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono text-ghost-dim uppercase tracking-wider">Description</label>
          <textarea value={form.description} onChange={(e) => updateField("description", e.target.value)} rows={6} className="w-full bg-void-lighter border border-void-border px-4 py-3 text-sm font-mono text-ghost placeholder:text-ghost-dim/50 focus:outline-none focus:border-cyan resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Min Salary (£)" type="number" value={form.salary_min} onChange={(e) => updateField("salary_min", e.target.value)} />
          <Input label="Max Salary (£)" type="number" value={form.salary_max} onChange={(e) => updateField("salary_max", e.target.value)} />
        </div>

        <div className="flex gap-3 pt-4 border-t border-void-border">
          <Button type="submit" variant="primary" disabled={loading || !form.job_title}>{loading ? "Saving..." : "Publish Job →"}</Button>
        </div>
      </form>
    </div>
  );
}
