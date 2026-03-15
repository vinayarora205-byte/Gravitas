"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import Badge from "@/components/ui/Badge";

const STAGES = [
  { key: "applied", label: "Applied", color: "default" as const },
  { key: "screening", label: "Screening", color: "warning" as const },
  { key: "interview", label: "Interview", color: "accent" as const },
  { key: "offer", label: "Offer", color: "success" as const },
];

export default function CandidatesPipeline() {
  const { user } = useUser();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [matches, setMatches] = useState<any[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);

  useEffect(() => {
    async function loadMatches() {
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("id").eq("clerk_user_id", user.id).single();
      if (!profile) return;

      const { data } = await supabase
        .from("matches")
        .select("id, status, created_at, job_listings!inner(profile_id, job_title), profiles:candidate_id(name)")
        .eq("job_listings.profile_id", profile.id)
        .order("created_at", { ascending: false });

      if (data) setMatches(data);
    }
    loadMatches();
  }, [user]);

  async function moveCandidate(matchId: string, newStage: string) {
    const { error } = await supabase.from("matches").update({ status: newStage }).eq("id", matchId);
    if (!error) {
      setMatches((prev) => prev.map((m) => (m.id === matchId ? { ...m, status: newStage } : m)));
    }
  }

  function handleDrop(stage: string) {
    if (dragging) {
      moveCandidate(dragging, stage);
      setDragging(null);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ghost mb-1">Pipeline</h1>
      <div className="flex gap-2 overflow-x-auto pb-4 h-[calc(100vh-140px)]">
        {STAGES.map((stage) => {
          const stageMatches = matches.filter((c) => (c.status || "applied") === stage.key);
          return (
            <div
              key={stage.key}
              className="min-w-[280px] flex-1 bg-void-light border border-void-border flex flex-col"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(stage.key)}
            >
              <div className="p-3 border-b border-void-border flex justify-between items-center bg-void-lighter">
                <Badge variant={stage.color}>{stage.label}</Badge>
                <span className="text-xs text-ghost-dim font-mono">{stageMatches.length}</span>
              </div>
              <div className="p-2 space-y-2 flex-1 overflow-y-auto">
                {stageMatches.map((m) => (
                  <div
                    key={m.id}
                    draggable
                    onDragStart={() => setDragging(m.id)}
                    className={`p-3 bg-void border border-void-border hover:border-cyan/50 cursor-grab ${
                      dragging === m.id ? "opacity-50" : ""
                    }`}
                  >
                    <div className="text-sm font-bold text-ghost">{m.profiles?.name}</div>
                    <div className="text-xs text-ghost-dim mb-2">{m.job_listings?.job_title}</div>
                    <div className="text-xs text-cyan opacity-80">{new Date(m.created_at).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
