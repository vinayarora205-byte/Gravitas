/* eslint-disable */
// @ts-nocheck
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { calculateMatchScore } from "@/lib/matching";

/**
 * One-time rematch endpoint: Compares all candidate profiles against all job listings,
 * creates/updates matches, sends notifications, appends chat messages, and logs emails.
 */
export async function GET() {
  console.log("[Rematch] Starting full rematch for all profiles...");

  const { data: candidates, error: cErr } = await supabase
    .from("candidate_profiles")
    .select("*, profiles(full_name, clerk_user_id)");

  const { data: jobs, error: jErr } = await supabase
    .from("job_listings")
    .select("*, profiles(full_name, clerk_user_id)")
    .eq("is_active", true);

  if (cErr || jErr) {
    return NextResponse.json({ error: "Failed to fetch profiles", cErr, jErr }, { status: 500 });
  }

  if (!candidates?.length || !jobs?.length) {
    return NextResponse.json({
      message: "No candidates or jobs found",
      candidates: candidates?.length || 0,
      jobs: jobs?.length || 0
    });
  }

  const results: any[] = [];

  for (const candidate of candidates) {
    for (const job of jobs) {
      const score = calculateMatchScore(job, candidate);
      console.log(`[Rematch] ${candidate.profiles?.full_name || 'Candidate'} vs ${job.job_title} @ ${job.company_name}: ${score}%`);

      if (score >= 70) {
        // Check existing
        const { data: existing } = await supabase
          .from("matches")
          .select("id")
          .eq("job_id", job.id)
          .eq("candidate_id", candidate.profile_id)
          .maybeSingle();

        let match;
        if (existing) {
          const { data: updated } = await supabase
            .from("matches")
            .update({ score, status: "PENDING" })
            .eq("id", existing.id)
            .select();
          match = updated?.[0];
        } else {
          const { data: inserted } = await supabase
            .from("matches")
            .insert({
              candidate_id: candidate.profile_id,
              job_id: job.id,
              score,
              status: "PENDING"
            })
            .select();
          match = inserted?.[0];
        }

        if (match) {
          // Notifications
          await supabase.from("notifications").insert({
            user_id: candidate.profile_id,
            type: "MATCH",
            title: "⚡ New Job Match Found!",
            message: `${job.company_name || 'A company'} is looking for ${job.job_title}. Match: ${score}%`,
            match_id: match.id,
            is_read: false
          });
          await supabase.from("notifications").insert({
            user_id: job.profile_id,
            type: "MATCH",
            title: "⚡ New Candidate Match!",
            message: `${candidate.profiles?.full_name || 'A candidate'} matches your ${job.job_title} role. Score: ${score}%`,
            match_id: match.id,
            is_read: false
          });

          // Chat messages — Candidate
          const { data: candConvo } = await supabase
            .from("conversations")
            .select("id, messages")
            .eq("profile_id", candidate.profile_id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (candConvo) {
            await supabase
              .from("conversations")
              .update({
                messages: [
                  ...(candConvo.messages || []),
                  {
                    role: "assistant",
                    content: `⚡ Great news! Claura found a job match for you!\n\nCompany: ${job.company_name || 'Confidential'}\nRole: ${job.job_title}\nSalary: ₹${job.salary_min || '?'}-${job.salary_max || '?'}/month\nWork Type: ${job.work_type || 'Not specified'}\nMatch Score: ${score}%\n\nThe recruiter has been notified. Are you interested?`,
                    timestamp: new Date().toISOString(),
                    type: "match_notification"
                  }
                ]
              })
              .eq("id", candConvo.id);
          }

          // Chat messages — Recruiter
          const { data: recConvo } = await supabase
            .from("conversations")
            .select("id, messages")
            .eq("profile_id", job.profile_id)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (recConvo) {
            const expYears = candidate.experience_years || 'Not specified';
            await supabase
              .from("conversations")
              .update({
                messages: [
                  ...(recConvo.messages || []),
                  {
                    role: "assistant",
                    content: `⚡ Claura found a matching candidate!\n\nName: ${candidate.profiles?.full_name || 'Anonymous'}\nRole: ${candidate.job_title}\nSkills: ${(candidate.skills || []).join(', ')}\nExpected: ₹${candidate.salary_min || '?'}-${candidate.salary_max || '?'}/month\nExperience: ${expYears} years\nMatch Score: ${score}%\n\nWould you like to connect with this candidate?`,
                    timestamp: new Date().toISOString(),
                    type: "match_notification"
                  }
                ]
              })
              .eq("id", recConvo.id);
          }

          // Email log
          console.log("====== EMAIL ======");
          console.log(`TO: ${candidate.profiles?.full_name} & ${job.profiles?.full_name}`);
          console.log(`MATCH: ${job.job_title} at ${job.company_name} — ${score}%`);
          console.log("===================");

          results.push({
            candidate: candidate.profiles?.full_name || candidate.profile_id,
            job: `${job.job_title} at ${job.company_name}`,
            score,
            match_id: match.id,
            notifications_sent: true,
            chat_messages_sent: { candidate: !!candConvo, recruiter: !!recConvo }
          });
        }
      }
    }
  }

  console.log(`[Rematch] Complete. ${results.length} matches found.`);

  return NextResponse.json({
    success: true,
    total_candidates: candidates.length,
    total_jobs: jobs.length,
    matches_found: results.length,
    matches: results
  });
}
