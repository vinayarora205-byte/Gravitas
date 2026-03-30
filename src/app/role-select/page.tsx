"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

import { Users, Briefcase, Sparkle } from "@phosphor-icons/react";
import Logo from "@/components/ui/Logo";

export default function RoleSelectPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkRole() {
      if (!isLoaded || !user) return;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("clerk_user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Profile check error:", error);
        setLoading(false);
        return;
      }

      if (profile?.role) {
        router.push(`/dashboard/${profile.role}`);
      } else {
        setLoading(false);
      }
    }
    checkRole();
  }, [user, isLoaded, router]);

  async function selectRole(role: "recruiter" | "candidate") {
    if (!user) return;
    setLoading(true);

    const email = user.primaryEmailAddress?.emailAddress || "";
    const name = user.fullName || "";

    const { data: newProfile, error } = await supabase
      .from("profiles")
      .insert({
        clerk_user_id: user.id,
        role,
        email,
        name,
      })
      .select()
      .single();

    if (error || !newProfile) {
      console.error("Failed to save role", error);
      setLoading(false);
      return;
    }

    if (role === "candidate") {
      await supabase.from("candidate_profiles").insert({
        profile_id: newProfile.id,
      });
    }

    router.push(`/dashboard/${role}`);
  }

  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen bg-[#F6F1EB] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-orange border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F6F1EB] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Decorative Blur */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-orange/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="mb-12 relative z-10 fade-up">
        <Logo className="h-10 w-auto" />
      </div>

      <div className="max-w-3xl w-full text-center mb-12 relative z-10">
        <div className="fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 border border-black/5 mb-6 shadow-sm">
            <Sparkle weight="fill" className="text-orange" />
            <span className="text-xs font-bold tracking-widest uppercase text-dark/70">Onboarding</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-dark mb-6 serif italic tracking-tight leading-tight">
            Tell us who <br/> you <span className="text-orange">are.</span>
          </h1>
          <p className="text-lg text-dark/50 font-medium max-w-lg mx-auto">
            Select your path to configure your custom Clauhire intelligence dashboard.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full relative z-10">
        <button 
          className="text-left group" 
          onClick={() => selectRole("recruiter")}
        >
          <div className="h-full bg-white border border-black/5 rounded-[32px] p-8 lg:p-12 hover:border-orange/30 transition-all duration-500 shadow-[0_10px_40px_rgba(0,0,0,0.03)] group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
            <div className="w-16 h-16 bg-orange/10 rounded-2xl flex items-center justify-center text-orange mb-8 group-hover:scale-110 group-hover:bg-orange group-hover:text-white transition-all duration-500">
              <Users size={32} weight="duotone" />
            </div>
            <h2 className="text-3xl font-bold text-dark mb-4 serif italic">Recruiter</h2>
            <p className="text-dark/50 font-medium leading-relaxed">
              Post high-impact roles, manage candidate pipelines, and use Claura intelligence to build your dream team.
            </p>
            <div className="mt-8 flex items-center gap-2 text-orange font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              Get Started <span>→</span>
            </div>
          </div>
        </button>

        <button 
          className="text-left group" 
          onClick={() => selectRole("candidate")}
        >
          <div className="h-full bg-white border border-black/5 rounded-[32px] p-8 lg:p-12 hover:border-orange/30 transition-all duration-500 shadow-[0_10px_40px_rgba(0,0,0,0.03)] group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.08)] relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-orange/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700" />
            <div className="w-16 h-16 bg-orange/10 rounded-2xl flex items-center justify-center text-orange mb-8 group-hover:scale-110 group-hover:bg-orange group-hover:text-white transition-all duration-500">
              <Briefcase size={32} weight="duotone" />
            </div>
            <h2 className="text-3xl font-bold text-dark mb-4 serif italic">Candidate</h2>
            <p className="text-dark/50 font-medium leading-relaxed">
              Optimize your profile, apply for matches curated by Claura, and connect with modern companies.
            </p>
            <div className="mt-8 flex items-center gap-2 text-orange font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              Get Started <span>→</span>
            </div>
          </div>
        </button>
      </div>
    </main>
  );
}

