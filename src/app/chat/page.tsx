"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase";

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
 <div className="flex h-screen w-full items-center justify-center bg-background">
 <div className="flex flex-col items-center gap-4">
 <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
 <p className="text-muted text-sm font-medium">Initializing Claura...</p>
 </div>
 </div>
 );
}
