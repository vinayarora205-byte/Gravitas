"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function CandidateProfile() {
 const { user } = useUser();
 const [form, setForm] = useState({ job_title: "", bio: "", skills: "", experience_years: "", work_type: "full-time", location: "", salary_min: "", salary_max: "" });
 const [loading, setLoading] = useState(false);
 const [saved, setSaved] = useState(false);
 const [profileId, setProfileId] = useState<string | null>(null);

 useEffect(() => {
 async function load() {
 if (!user) return;
 const { data: profile } = await supabase.from("profiles").select("id").eq("clerk_user_id", user.id).single();
 if (!profile) return;
 setProfileId(profile.id);

 const { data: cProfile } = await supabase.from("candidate_profiles").select("*").eq("profile_id", profile.id).single();
 if (cProfile) {
 setForm({
 job_title: cProfile.job_title || "", bio: cProfile.bio || "", skills: cProfile.skills?.join(", ") || "", experience_years: cProfile.experience_years?.toString() || "", work_type: cProfile.work_type || "full-time", location: cProfile.location || "", salary_min: cProfile.salary_min?.toString() || "", salary_max: cProfile.salary_max?.toString() || ""
 });
 }
 }
 load();
 }, [user]);

 async function handleSave(e: React.FormEvent) {
 e.preventDefault();
 if (!profileId) return;
 setLoading(true); setSaved(false);

 const skillsArray = form.skills.split(",").map(s => s.trim()).filter(Boolean);

 await supabase.from("candidate_profiles").upsert({
 profile_id: profileId,
 job_title: form.job_title,
 bio: form.bio,
 skills: skillsArray,
 experience_years: form.experience_years ? parseInt(form.experience_years) : null,
 work_type: form.work_type,
 location: form.location,
 salary_min: form.salary_min ? parseInt(form.salary_min) : null,
 salary_max: form.salary_max ? parseInt(form.salary_max) : null,
 }, { onConflict: "profile_id" });

 setLoading(false); setSaved(true);
 setTimeout(() => setSaved(false), 3000);
 }

 return (
 <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
 <h1 className="text-2xl font-bold text-ghost">Candidate Profile</h1>
 <form onSubmit={handleSave} className="space-y-4">
 <Input label="Desired Job Title" value={form.job_title} onChange={(e) => setForm(f => ({ ...f, job_title: e.target.value }))} />
 <div className="grid grid-cols-2 gap-4">
 <Input label="Experience (Years)" type="number" value={form.experience_years} onChange={(e) => setForm(f => ({ ...f, experience_years: e.target.value }))} />
 <Input label="Location" value={form.location} onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))} />
 </div>
 <Input label="Skills (comma separated)" value={form.skills} onChange={(e) => setForm(f => ({ ...f, skills: e.target.value }))} />
 <div className="grid grid-cols-2 gap-4">
 <Input label="Min Expected Salary (£)" type="number" value={form.salary_min} onChange={(e) => setForm(f => ({ ...f, salary_min: e.target.value }))} />
 <Input label="Max Expected Salary (£)" type="number" value={form.salary_max} onChange={(e) => setForm(f => ({ ...f, salary_max: e.target.value }))} />
 </div>
 <div className="flex flex-col gap-1">
 <label className="text-xs text-ghost-dim">Bio</label>
 <textarea className="bg-void-lighter border border-void-border p-3 text-sm text-ghost outline-none" rows={4} value={form.bio} onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))} />
 </div>
 <div className="flex items-center gap-4 pt-4 border-t border-void-border">
 <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save Profile"}</Button>
 {saved && <span className="text-cyan text-sm">✓ Saved successfully</span>}
 </div>
 </form>
 </div>
 );
}
