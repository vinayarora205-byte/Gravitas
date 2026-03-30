"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { UserCircle, Briefcase, MapPin, Sparkle, CurrencyCircleDollar, IdentificationCard, Clock, CheckCircle } from "@phosphor-icons/react";

export default function CandidateProfile() {
  const { user } = useUser();
  const [form, setForm] = useState({ 
    job_title: "", 
    bio: "", 
    skills: "", 
    experience_years: "", 
    work_type: "full-time", 
    location: "", 
    salary_min: "", 
    salary_max: "" 
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("id").eq("clerk_user_id", user.id).single();
      if (!profile) return;
      setProfileId(profile.id);

      const { data: cProfile } = await supabase.from("candidate_profiles").select("*").eq("profile_id", profile.id).maybeSingle();
      if (cProfile) {
        setForm({
          job_title: cProfile.job_title || "", 
          bio: cProfile.bio || "", 
          skills: cProfile.skills?.join(", ") || "", 
          experience_years: cProfile.experience_years?.toString() || "", 
          work_type: cProfile.work_type || "full-time", 
          location: cProfile.location || "", 
          salary_min: cProfile.salary_min?.toString() || "", 
          salary_max: cProfile.salary_max?.toString() || ""
        });
      }
    }
    load();
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profileId) return;
    setLoading(true);
    setSaved(false);

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

    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-16 text-center">
        <h1 className="text-4xl font-bold text-dark serif italic tracking-tight mb-2">Identity Configuration</h1>
        <p className="text-sm font-medium text-dark/40 uppercase tracking-widest">Update your professional vector for better alignment</p>
      </div>

      <form onSubmit={handleSave} className="space-y-12">
        {/* Core Identity Section */}
        <section className="space-y-8">
           <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-black/[0.03]" />
              <div className="flex items-center gap-2 px-4">
                 <UserCircle size={18} weight="duotone" className="text-orange" />
                 <span className="text-[10px] font-black text-dark/30 uppercase tracking-[0.2em]">Core Identity</span>
              </div>
              <div className="h-px flex-1 bg-black/[0.03]" />
           </div>

           <Card className="p-8 md:p-10 border-black/[0.03] shadow-sm">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input 
                  label="Target Position" 
                  placeholder="e.g. Lead Frontend Engineer"
                  value={form.job_title} 
                  onChange={(e) => setForm(f => ({ ...f, job_title: e.target.value }))} 
                  icon={<Briefcase size={18} weight="duotone" />}
                />
                <Input 
                  label="Experience (Years)" 
                  type="number" 
                  placeholder="e.g. 8"
                  value={form.experience_years} 
                  onChange={(e) => setForm(f => ({ ...f, experience_years: e.target.value }))} 
                  icon={<Clock size={18} weight="duotone" />}
                />
                <Input 
                  label="Base of Operations" 
                  placeholder="e.g. London, UK (or Remote)"
                  value={form.location} 
                  onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))} 
                  icon={<MapPin size={18} weight="duotone" />}
                />
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-dark/40 ml-1">Availability Protocol</label>
                  <select
                    value={form.work_type}
                    onChange={(e) => setForm(f => ({ ...f, work_type: e.target.value }))}
                    className="w-full bg-gray-50 border border-black/5 rounded-2xl px-5 py-4 text-sm text-dark font-medium focus:outline-none focus:border-orange/30 focus:bg-white focus:ring-4 focus:ring-orange/5 transition-all appearance-none cursor-pointer"
                  >
                    <option value="full-time">Full-time Deployment</option>
                    <option value="part-time">Part-time Engagement</option>
                    <option value="contract">Fixed-term Contract</option>
                    <option value="remote">Remote Operation</option>
                  </select>
                </div>
             </div>
           </Card>
        </section>

        {/* Skillset & Bio */}
        <section className="space-y-8">
           <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-black/[0.03]" />
              <div className="flex items-center gap-2 px-4">
                 <IdentificationCard size={18} weight="duotone" className="text-orange" />
                 <span className="text-[10px] font-black text-dark/30 uppercase tracking-[0.2em]">Intel & Background</span>
              </div>
              <div className="h-px flex-1 bg-black/[0.03]" />
           </div>

           <Card className="p-8 md:p-10 border-black/[0.03] shadow-sm space-y-8">
              <Input 
                label="Technical Skillset (Comma Separated)" 
                placeholder="React, Node.js, TypeScript, AWS..."
                value={form.skills} 
                onChange={(e) => setForm(f => ({ ...f, skills: e.target.value }))} 
                icon={<Sparkle size={18} weight="duotone" />}
              />
              
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-dark/40 ml-1">Professional Narrative</label>
                <textarea 
                  className="w-full bg-gray-50 border border-black/5 rounded-[32px] px-6 py-5 text-sm text-dark font-medium focus:outline-none focus:border-orange/30 focus:bg-white focus:ring-4 focus:ring-orange/5 transition-all resize-none placeholder:text-dark/20" 
                  rows={5} 
                  placeholder="Tell us about your technical journey and career goals..."
                  value={form.bio} 
                  onChange={(e) => setForm(f => ({ ...f, bio: e.target.value }))} 
                />
              </div>
           </Card>
        </section>

        {/* Compensation Protocols */}
        <section className="space-y-8">
           <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-black/[0.03]" />
              <div className="flex items-center gap-2 px-4">
                 <CurrencyCircleDollar size={18} weight="duotone" className="text-orange" />
                 <span className="text-[10px] font-black text-dark/30 uppercase tracking-[0.2em]">Compensation Protocols</span>
              </div>
              <div className="h-px flex-1 bg-black/[0.03]" />
           </div>

           <Card className="p-8 md:p-10 border-black/[0.03] shadow-sm">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Input 
                  label="Minimum Threshold (£)" 
                  type="number" 
                  placeholder="e.g. 50000"
                  value={form.salary_min} 
                  onChange={(e) => setForm(f => ({ ...f, salary_min: e.target.value }))} 
                  icon={<CurrencyCircleDollar size={18} weight="duotone" />}
                />
                <Input 
                  label="Ideal Target (£)" 
                  type="number" 
                  placeholder="e.g. 85000"
                  value={form.salary_max} 
                  onChange={(e) => setForm(f => ({ ...f, salary_max: e.target.value }))} 
                  icon={<CurrencyCircleDollar size={18} weight="duotone" />}
                />
             </div>
           </Card>
        </section>

        <div className="flex flex-col items-center gap-6 pt-8 border-t border-black/5">
          <Button 
            type="submit" 
            variant="primary" 
            disabled={loading}
            className="w-full md:w-auto md:px-16 py-5 text-lg shadow-2xl shadow-orange/20"
          >
            {loading ? "Synchronizing..." : "Synchronize Profile →"}
          </Button>
          
          {saved && (
            <div 
              className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 rounded-full text-xs font-bold uppercase tracking-widest border border-green-500/20 fade-up"
            >
              <CheckCircle weight="bold" size={16} /> Update Successfully Broadcasted
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
