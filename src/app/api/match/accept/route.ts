export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const matchId = searchParams.get("match_id");

    if (!matchId) {
      return NextResponse.json({ error: "Missing match_id" }, { status: 400 });
    }

    // 1. Fetch match to get recruiter and job info
    const { data: match, error: fetchError } = await supabase
      .from("matches")
      .select("*, job_listings(*)")
      .eq("id", matchId)
      .single();

    if (fetchError || !match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // 2. Update match status to ACCEPTED
    const { error: updateError } = await supabase
      .from("matches")
      .update({ status: "ACCEPTED" })
      .eq("id", matchId);

    if (updateError) throw updateError;

    // 3. Create notifications (logic similar to existing match API)
    // Fetch profile details for recruiter and candidate
    const { data: recruiterProfile } = await supabase.from("profiles").select("*").eq("id", match.job_listings.profile_id).single();
    const { data: candidateProfile } = await supabase.from("profiles").select("*").eq("id", match.candidate_id).single();

    if (recruiterProfile && candidateProfile) {
      await supabase.from("notifications").insert([
        {
          user_id: match.candidate_id,
          title: "Connected! 🤝",
          message: `You are now connected with ${match.job_listings.company_name}. Contact details revealed.`,
          type: "MATCH",
          match_id: matchId
        },
        {
          user_id: match.job_listings.profile_id,
          title: "Interested Candidate! 🤝",
          message: `${candidateProfile.full_name} is interested in your ${match.job_listings.job_title} role.`,
          type: "MATCH",
          match_id: matchId
        }
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Match accept error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
