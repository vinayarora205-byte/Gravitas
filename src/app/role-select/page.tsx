"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Card from "@/components/ui/Card";
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-4 h-4 bg-accent animate-pulse" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <Logo className="mb-12" />
      <div className="max-w-3xl w-full text-center mb-12 animate-slide-up">
        <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
          Identify yourself.
        </h1>
        <p className="text-muted">
          Select your objective to configure your Clauhire command center.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <button className="text-left group" onClick={() => selectRole("recruiter")}>
          <Card className="h-full flex flex-col items-start justify-center p-8 md:p-12 hover:bg-accent/5 transition-colors">
            <div className="text-4xl text-accent mb-6 group-hover:scale-110 transition-transform">◉</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Recruiter</h2>
            <p className="text-muted">
              I want to post jobs, manage candidate pipelines, and use Claura to source top talent.
            </p>
          </Card>
        </button>

        <button className="text-left group" onClick={() => selectRole("candidate")}>
          <Card className="h-full flex flex-col items-start justify-center p-8 md:p-12 hover:bg-accent/5 transition-colors">
            <div className="text-4xl text-accent mb-6 group-hover:scale-110 transition-transform">✦</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Candidate</h2>
            <p className="text-muted">
              I want to build my profile, apply for jobs, and connect with innovative companies.
            </p>
          </Card>
        </button>
      </div>
    </main>
  );
}
