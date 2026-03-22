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

    const { match_id, response } = await req.json();
    if (!match_id || !response) return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    if (!["hired", "ongoing", "not_interested"].includes(response)) {
      return NextResponse.json({ error: "Invalid response" }, { status: 400 });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, role")
      .eq("clerk_user_id", userId)
      .maybeSingle();

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const userRole = profile.role?.toUpperCase();

    // Update the hire response for appropriate role
    if (userRole === "RECRUITER") {
      await supabaseAdmin
        .from("matches")
        .update({ recruiter_hire_response: response })
        .eq("id", match_id);
    } else {
      await supabaseAdmin
        .from("matches")
        .update({ candidate_hire_response: response })
        .eq("id", match_id);
    }

    // Re-fetch match
    const { data: match } = await supabaseAdmin
      .from("matches")
      .select("*, job_listings(profile_id, id)")
      .eq("id", match_id)
      .maybeSingle();

    if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

    const recResponse = match.recruiter_hire_response;
    const candResponse = match.candidate_hire_response;

    // Check if both responded
    if (recResponse && candResponse) {
      if (recResponse === "hired" && candResponse === "hired") {
        // HIRE CONFIRMED — refund all Hiries to both
        await supabaseAdmin.from("matches").update({ hire_status: "hired" }).eq("id", match_id);

        // Refund recruiter
        const recruiterId = match.job_listings?.profile_id;
        if (recruiterId && match.recruiter_hiries_held > 0) {
          const { data: rp } = await supabaseAdmin.from("profiles").select("hiries_balance").eq("id", recruiterId).maybeSingle();
          await supabaseAdmin.from("profiles").update({ hiries_balance: (rp?.hiries_balance || 0) + match.recruiter_hiries_held }).eq("id", recruiterId);
          await supabaseAdmin.from("hiries_transactions").insert({ user_id: recruiterId, amount: match.recruiter_hiries_held, type: "HIRE_REFUND", description: "Hire confirmed! Hiries refunded.", match_id });
          await supabaseAdmin.from("notifications").insert({ user_id: recruiterId, title: "🎉 Hire Confirmed!", message: "Congratulations! Hire confirmed. Your Hiries have been fully refunded!", type: "HIRIES", is_read: false });
        }

        // Refund candidate
        const candidateId = match.candidate_id;
        if (candidateId && match.candidate_hiries_held > 0) {
          const { data: cp } = await supabaseAdmin.from("profiles").select("hiries_balance").eq("id", candidateId).maybeSingle();
          await supabaseAdmin.from("profiles").update({ hiries_balance: (cp?.hiries_balance || 0) + match.candidate_hiries_held }).eq("id", candidateId);
          await supabaseAdmin.from("hiries_transactions").insert({ user_id: candidateId, amount: match.candidate_hiries_held, type: "HIRE_REFUND", description: "Hire confirmed! Hiries refunded.", match_id });
          await supabaseAdmin.from("notifications").insert({ user_id: candidateId, title: "🎉 Hire Confirmed!", message: "Congratulations! Hire confirmed. Your Hiries have been fully refunded!", type: "HIRIES", is_read: false });
        }

        // Close job listing
        if (match.job_listings?.id) {
          await supabaseAdmin.from("job_listings").update({ is_active: false }).eq("id", match.job_listings.id);
        }

        return NextResponse.json({ success: true, hire_status: "hired" });
      }

      if (recResponse === "not_interested" || candResponse === "not_interested") {
        await supabaseAdmin.from("matches").update({ hire_status: "closed" }).eq("id", match_id);
        return NextResponse.json({ success: true, hire_status: "closed" });
      }
    }

    return NextResponse.json({ success: true, hire_status: "pending" });
  } catch (error) {
    console.error("Hire Response Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
