/* eslint-disable */
// @ts-nocheck
import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";

const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

    const { data: matches } = await supabaseAdmin
      .from("matches")
      .select("id, candidate_id, job_listings(profile_id)")
      .eq("chat_unlocked", true)
      .eq("hire_status", "pending")
      .is("hire_check_sent_at", null)
      .lt("created_at", threeDaysAgo);

    if (!matches || matches.length === 0) {
      return NextResponse.json({ message: "No matches to check", count: 0 });
    }

    for (const match of matches) {
      // Notify candidate
      if (match.candidate_id) {
        await supabaseAdmin.from("notifications").insert({
          user_id: match.candidate_id,
          title: "💬 How did it go?",
          message: "It's been a few days since your chat was unlocked. Let us know the status!",
          type: "HIRIES",
          is_read: false,
        });
      }

      // Notify recruiter
      const recruiterId = match.job_listings?.profile_id;
      if (recruiterId) {
        await supabaseAdmin.from("notifications").insert({
          user_id: recruiterId,
          title: "💬 How did it go?",
          message: "It's been a few days since your chat was unlocked. Let us know the status!",
          type: "HIRIES",
          is_read: false,
        });
      }

      await supabaseAdmin
        .from("matches")
        .update({ hire_check_sent_at: new Date().toISOString() })
        .eq("id", match.id);
    }

    return NextResponse.json({ message: "Hire check complete", count: matches.length });
  } catch (error) {
    console.error("Hire Check Cron Error:", error);
    return NextResponse.json({ error: "Cron error" }, { status: 500 });
  }
}
