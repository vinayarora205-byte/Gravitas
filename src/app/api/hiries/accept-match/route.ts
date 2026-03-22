/* eslint-disable */
// @ts-nocheck
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

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, role, hiries_balance")
      .eq("clerk_user_id", userId)
      .maybeSingle();

    if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

    const balance = profile.hiries_balance || 0;
    if (balance < 2) {
      return NextResponse.json({
        error: "Not enough Hiries. Please contact support to add more.",
        balance,
      }, { status: 402 });
    }

    const { data: match } = await supabaseAdmin
      .from("matches")
      .select("*")
      .eq("id", match_id)
      .maybeSingle();

    if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

    const userRole = profile.role?.toUpperCase();

    // Deduct 2 Hiries
    await supabaseAdmin
      .from("profiles")
      .update({ hiries_balance: balance - 2 })
      .eq("id", profile.id);

    // Record transaction
    await supabaseAdmin.from("hiries_transactions").insert({
      user_id: profile.id,
      amount: -2,
      type: "HELD",
      description: "Hiries held for match acceptance",
      match_id,
    });

    // Update match
    if (userRole === "RECRUITER") {
      await supabaseAdmin
        .from("matches")
        .update({ recruiter_accepted: true, recruiter_hiries_held: 2 })
        .eq("id", match_id);
    } else {
      await supabaseAdmin
        .from("matches")
        .update({ candidate_accepted: true, candidate_hiries_held: 2 })
        .eq("id", match_id);
    }

    // Re-fetch match to check both accepted
    const { data: updatedMatch } = await supabaseAdmin
      .from("matches")
      .select("*, job_listings(profile_id, job_title, company_name), candidate_profiles:candidate_id(profile_id)")
      .eq("id", match_id)
      .maybeSingle();

    if (updatedMatch?.recruiter_accepted && updatedMatch?.candidate_accepted) {
      // Both accepted — unlock chat
      await supabaseAdmin
        .from("matches")
        .update({ chat_unlocked: true, status: "ACCEPTED" })
        .eq("id", match_id);

      // Notify recruiter
      const recruiterId = updatedMatch.job_listings?.profile_id;
      if (recruiterId) {
        await supabaseAdmin.from("notifications").insert({
          user_id: recruiterId,
          title: "🎉 Chat Unlocked!",
          message: "Both sides accepted! You can now message directly.",
          type: "HIRIES",
          is_read: false,
        });
      }

      // Notify candidate
      const candidateProfileId = updatedMatch.candidate_id;
      if (candidateProfileId) {
        await supabaseAdmin.from("notifications").insert({
          user_id: candidateProfileId,
          title: "🎉 Chat Unlocked!",
          message: "Both sides accepted! You can now message directly.",
          type: "HIRIES",
          is_read: false,
        });
      }

      return NextResponse.json({ success: true, chat_unlocked: true, balance: balance - 2 });
    } else {
      // Only one side accepted — notify the other party
      let otherUserId = null;
      if (userRole === "RECRUITER") {
        otherUserId = updatedMatch?.candidate_id;
      } else {
        otherUserId = updatedMatch?.job_listings?.profile_id;
      }

      if (otherUserId) {
        await supabaseAdmin.from("notifications").insert({
          user_id: otherUserId,
          title: "💎 Someone wants to connect!",
          message: "Someone wants to connect with you! Spend 2 Hiries to unlock the chat.",
          type: "HIRIES",
          is_read: false,
        });
      }

      return NextResponse.json({ success: true, chat_unlocked: false, balance: balance - 2 });
    }
  } catch (error) {
    console.error("Accept Match Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
