"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";
import { Sparkle } from "@phosphor-icons/react";

export default function ChatIndexPage() {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    async function initChat() {
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", user.id)
        .maybeSingle();

      if (!profile) return;

      const { data: latestConvo } = await supabase
        .from("conversations")
        .select("id")
        .eq("profile_id", profile.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latestConvo) {
        router.replace(`/chat/${latestConvo.id}`);
      } else {
        const { data: newConvo } = await supabase
          .from("conversations")
          .insert({ profile_id: profile.id, messages: [] })
          .select()
          .maybeSingle();

        if (newConvo) {
          router.replace(`/chat/${newConvo.id}`);
        }
      }
    }
    initChat();
  }, [user, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#FDFCFB]">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="size-16 rounded-2xl bg-orange flex items-center justify-center text-white shadow-lg shadow-orange/20 animate-pulse">
            <Sparkle weight="fill" size={32} />
          </div>
          <div className="absolute inset-0 size-16 rounded-2xl border-4 border-orange/20 border-t-orange animate-spin" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-dark serif italic tracking-tight mb-1">Claura Intelligence</h2>
          <p className="text-[10px] font-black text-dark/20 uppercase tracking-[0.2em]">Synchronizing Neural Pathways...</p>
        </div>
      </div>
    </div>
  );
}

