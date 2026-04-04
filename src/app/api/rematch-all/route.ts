import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { runMatchingForProfile } from "@/lib/matching";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: candidates } = await supabase
      .from('candidate_profiles')
      .select('profile_id');
    
    const { data: jobs } = await supabase
      .from('job_listings')
      .select('id');
    
    let totalMatches = 0;
    
    for (const c of candidates || []) {
      if (c.profile_id) {
        const matches = await runMatchingForProfile(c.profile_id, 'CANDIDATE');
        totalMatches += matches.length;
      }
    }
    
    return NextResponse.json({
      message: 'Rematch complete',
      candidates: candidates?.length || 0,
      jobs: jobs?.length || 0,
      newMatches: totalMatches
    });
  } catch (err: any) {
    console.error("Rematch error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
