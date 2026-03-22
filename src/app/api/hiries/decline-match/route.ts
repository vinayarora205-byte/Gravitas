/* eslint-disable */
// @ts-nocheck
export const dynamic = 'force-dynamic'
import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";

const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { match_id } = await req.json();
    if (!match_id) return NextResponse.json({ error: "Missing match_id" }, { status: 400 });

    const { data: match } = await supabaseAdmin
      .from("matches")
      .select("*, job_listings(profile_id)")
      .eq("id", match_id)
      .maybeSingle();

    if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

    // Update match status
    await supabaseAdmin
      .from("matches")
      .update({ status: "REJECTED" })
      .eq("id", match_id);

    // Refund whoever already accepted
    if (match.recruiter_accepted && match.recruiter_hiries_held > 0) {
      const recruiterId = match.job_listings?.profile_id;
      if (recruiterId) {
        const { data: rProfile } = await supabaseAdmin
          .from("profiles")
          .select("hiries_balance")
          .eq("id", recruiterId)
          .maybeSingle();

        await supabaseAdmin
          .from("profiles")
          .update({ hiries_balance: (rProfile?.hiries_balance || 0) + match.recruiter_hiries_held })
          .eq("id", recruiterId);

        await supabaseAdmin.from("hiries_transactions").insert({
          user_id: recruiterId,
          amount: match.recruiter_hiries_held,
          type: "REFUND",
          description: "Match declined — Hiries refunded",
          match_id,
        });

        await supabaseAdmin.from("notifications").insert({
          user_id: recruiterId,
          title: "💎 Hiries Refunded",
          message: `Match declined. ${match.recruiter_hiries_held} Hiries refunded.`,
          type: "HIRIES",
          is_read: false,
        });
      }
    }

    if (match.candidate_accepted && match.candidate_hiries_held > 0) {
      const candidateId = match.candidate_id;
      if (candidateId) {
        const { data: cProfile } = await supabaseAdmin
          .from("profiles")
          .select("hiries_balance")
          .eq("id", candidateId)
          .maybeSingle();

        await supabaseAdmin
          .from("profiles")
          .update({ hiries_balance: (cProfile?.hiries_balance || 0) + match.candidate_hiries_held })
          .eq("id", candidateId);

        await supabaseAdmin.from("hiries_transactions").insert({
          user_id: candidateId,
          amount: match.candidate_hiries_held,
          type: "REFUND",
          description: "Match declined — Hiries refunded",
          match_id,
        });

        await supabaseAdmin.from("notifications").insert({
          user_id: candidateId,
          title: "💎 Hiries Refunded",
          message: `Match declined. ${match.candidate_hiries_held} Hiries refunded.`,
          type: "HIRIES",
          is_read: false,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Decline Match Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
