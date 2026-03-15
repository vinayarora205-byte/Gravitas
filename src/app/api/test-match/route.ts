/* eslint-disable */
// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { runMatchingForProfile } from "@/lib/matching";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    console.log("--- TEST MATCH TRIGGERED ---");
    // 1. Fetch specific test candidate
    const { data: candidate, error: candError } = await supabase
      .from("candidate_profiles")
      .select("*")
      .eq("profile_id", "00000000-0000-0000-0000-000000000001")
      .maybeSingle();

    // 2. Fetch specific test job
    const { data: job, error: jobError } = await supabase
      .from("job_listings")
      .select("*")
      .eq("profile_id", "00000000-0000-0000-0000-000000000002")
      .maybeSingle();



    if (candError || jobError) {
      return NextResponse.json({ error: "DB Error", candError, jobError });
    }

    if (!candidate || !job) {
      return NextResponse.json({ 
        error: "Missing data", 
        hasCandidate: !!candidate, 
        hasJob: !!job,
        candidateMsg: candidate ? "Found" : "Not Found",
        jobMsg: job ? "Found" : "Not Found"
      });
    }


    // 3. Trigger matching for the candidate
    const matches = await runMatchingForProfile(candidate.profile_id, "CANDIDATE");

    return NextResponse.json({
      testResult: "Success",
      latestCandidate: {
        id: candidate.id,
        title: candidate.job_title,
        skills: candidate.skills,
        salary: `${candidate.salary_min}-${candidate.salary_max}`,
        workType: candidate.work_type
      },
      latestJob: {
        id: job.id,
        title: job.job_title,
        company: job.company_name,
        skills: job.required_skills,
        salary: `${job.salary_min}-${job.salary_max}`,
        workType: job.work_type
      },
      matchCount: matches.length,
      allMatches: matches
    });

  } catch (error) {
    console.error("Test match error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
