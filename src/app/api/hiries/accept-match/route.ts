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

// Helper: append a Claura message to user's most recent conversation
async function appendToChat(clerkUserId: string, message: string) {
 try {
 // Get profile ID from clerk_user_id
 const { data: profile } = await supabaseAdmin
 .from("profiles")
 .select("id")
 .eq("clerk_user_id", clerkUserId)
 .maybeSingle();

 if (!profile) {
 console.log("appendToChat: profile not found for", clerkUserId);
 return;
 }

 // Get most recent conversation
 const { data: convo } = await supabaseAdmin
 .from("conversations")
 .select("id, messages")
 .eq("profile_id", profile.id)
 .order("created_at", { ascending: false })
 .limit(1)
 .maybeSingle();

 if (!convo) {
 console.log("appendToChat: no conversation found for profile", profile.id);
 return;
 }

 const existingMessages = convo.messages || [];
 const newMessage = {
 role: "assistant",
 content: message,
 timestamp: new Date().toISOString(),
 };

 await supabaseAdmin
 .from("conversations")
 .update({ messages: [...existingMessages, newMessage] })
 .eq("id", convo.id);

 console.log("appendToChat: message appended to conversation", convo.id);
 } catch (err) {
 console.error("appendToChat error:", err);
 }
}

export async function POST(req: Request) {
 try {
 console.log("=== ACCEPT MATCH CALLED ===");

 const { userId } = auth();
 if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

 const { match_id } = await req.json();
 if (!match_id) return NextResponse.json({ error: "Missing match_id" }, { status: 400 });

 console.log("MATCH ID:", match_id);
 console.log("CLERK USER ID:", userId);

 // Get current user profile
 const { data: profile } = await supabaseAdmin
 .from("profiles")
 .select("id, role, hiries_balance, clerk_user_id")
 .eq("clerk_user_id", userId)
 .maybeSingle();

 if (!profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

 const userRole = profile.role?.toUpperCase();
 console.log("USER ROLE:", userRole);

 const balance = profile.hiries_balance || 0;
 console.log("CURRENT BALANCE:", balance);

 if (balance < 2) {
 return NextResponse.json({
 error: "Not enough Hiries. You need at least 2 to accept a match.",
 balance,
 }, { status: 402 });
 }

 // Fetch match with deep joins for both parties
 const { data: match } = await supabaseAdmin
 .from("matches")
 .select(`
 *,
 job_listings (
 id,
 job_title,
 company_name,
 profile_id,
 profiles ( id, clerk_user_id, full_name )
 )
 `)
 .eq("id", match_id)
 .maybeSingle();

 if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

 console.log("MATCH FOUND:", match.id);
 console.log("BEFORE — recruiter_accepted:", match.recruiter_accepted, "candidate_accepted:", match.candidate_accepted);

 // Get candidate profile info
 const { data: candidateProfile } = await supabaseAdmin
 .from("profiles")
 .select("id, clerk_user_id, full_name")
 .eq("id", match.candidate_id)
 .maybeSingle();

 // Get recruiter profile from match join
 const recruiterProfile = Array.isArray(match.job_listings?.profiles)
 ? match.job_listings.profiles[0]
 : match.job_listings?.profiles;

 const recruiterProfileId = recruiterProfile?.id;
 const candidateProfileId = candidateProfile?.id;

 console.log("RECRUITER PROFILE ID:", recruiterProfileId);
 console.log("CANDIDATE PROFILE ID:", candidateProfileId);

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

 console.log("DEDUCTED 2 HIRIES. New balance:", balance - 2);

 // Update match acceptance for the current role
 if (userRole === "RECRUITER") {
 await supabaseAdmin
 .from("matches")
 .update({ recruiter_accepted: true, recruiter_hiries_held: 2 })
 .eq("id", match_id);
 console.log("RECRUITER ACCEPTED set to true");
 } else {
 await supabaseAdmin
 .from("matches")
 .update({ candidate_accepted: true, candidate_hiries_held: 2 })
 .eq("id", match_id);
 console.log("CANDIDATE ACCEPTED set to true");
 }

 // ===== SEND NOTIFICATION TO THE OTHER PARTY =====
 if (userRole === "RECRUITER" && candidateProfileId) {
 // Recruiter accepted — notify candidate
 await supabaseAdmin.from("notifications").insert({
 user_id: candidateProfileId,
 title: "🎯 A Recruiter Wants to Connect!",
 message: (match.job_listings?.company_name || "A company") +
 " accepted your match for " +
 (match.job_listings?.job_title || "a role") +
 ". Spend 2 Hiries to unlock the chat!",
 type: "MATCH_ACCEPTED",
 is_read: false,
 });
 console.log("NOTIFICATION SENT to candidate:", candidateProfileId);

 // Append to candidate's Claura chat
 if (candidateProfile?.clerk_user_id) {
 await appendToChat(
 candidateProfile.clerk_user_id,
 "🎯 A recruiter wants to connect with you!\n\n" +
 "Company: " + (match.job_listings?.company_name || "Unknown") + "\n" +
 "Role: " + (match.job_listings?.job_title || "Unknown") + "\n\n" +
 "They have spent 2 Hiries to connect.\n" +
 "Go to Opportunities to accept or decline.\n" +
 "Cost: 2 Hiries to accept."
 );
 }
 }

 if (userRole === "CANDIDATE" && recruiterProfileId) {
 // Candidate accepted — notify recruiter
 await supabaseAdmin.from("notifications").insert({
 user_id: recruiterProfileId,
 title: "✅ Candidate Accepted Your Request!",
 message: (candidateProfile?.full_name || "A candidate") +
 " accepted your connection request for " +
 (match.job_listings?.job_title || "a role") + ".",
 type: "MATCH_ACCEPTED",
 is_read: false,
 });
 console.log("NOTIFICATION SENT to recruiter:", recruiterProfileId);

 // Append to recruiter's Claura chat
 if (recruiterProfile?.clerk_user_id) {
 await appendToChat(
 recruiterProfile.clerk_user_id,
 "✅ Candidate accepted your request!\n\n" +
 "Name: " + (candidateProfile?.full_name || "Unknown") + "\n" +
 "Role: " + (match.job_listings?.job_title || "Unknown") + "\n\n" +
 "Waiting for chat to unlock..."
 );
 }
 }

 // ===== CHECK IF BOTH ACCEPTED — UNLOCK CHAT =====
 const { data: updatedMatch } = await supabaseAdmin
 .from("matches")
 .select("recruiter_accepted, candidate_accepted, chat_unlocked")
 .eq("id", match_id)
 .maybeSingle();

 console.log("AFTER UPDATE — recruiter_accepted:", updatedMatch?.recruiter_accepted);
 console.log("AFTER UPDATE — candidate_accepted:", updatedMatch?.candidate_accepted);
 console.log("AFTER UPDATE — chat_unlocked:", updatedMatch?.chat_unlocked);

 if (updatedMatch?.recruiter_accepted && updatedMatch?.candidate_accepted) {
 console.log("=== BOTH ACCEPTED! UNLOCKING CHAT ===");

 // Unlock chat
 await supabaseAdmin
 .from("matches")
 .update({ chat_unlocked: true, status: "ACCEPTED" })
 .eq("id", match_id);

 // Notify BOTH parties
 const notifications = [];
 if (recruiterProfileId) {
 notifications.push({
 user_id: recruiterProfileId,
 title: "🎉 Chat Unlocked!",
 message: "Both parties accepted! You can now chat directly with " +
 (candidateProfile?.full_name || "the candidate") + ".",
 type: "CHAT_UNLOCKED",
 is_read: false,
 });
 }
 if (candidateProfileId) {
 notifications.push({
 user_id: candidateProfileId,
 title: "🎉 Chat Unlocked!",
 message: "Both parties accepted! You can now chat directly with " +
 (match.job_listings?.company_name || "the recruiter") + ".",
 type: "CHAT_UNLOCKED",
 is_read: false,
 });
 }

 if (notifications.length > 0) {
 await supabaseAdmin.from("notifications").insert(notifications);
 console.log("CHAT UNLOCKED notifications sent to both parties");
 }

 // Append to both Claura chats
 if (recruiterProfile?.clerk_user_id) {
 await appendToChat(
 recruiterProfile.clerk_user_id,
 "🎉 Chat unlocked!\n\n" +
 "You can now message " + (candidateProfile?.full_name || "the candidate") + " directly.\n" +
 "Open Inbox: /dashboard/recruiter/messages"
 );
 }

 if (candidateProfile?.clerk_user_id) {
 await appendToChat(
 candidateProfile.clerk_user_id,
 "🎉 Chat unlocked!\n\n" +
 "You can now message " + (match.job_listings?.company_name || "the recruiter") + " directly.\n" +
 "Open Inbox: /dashboard/candidate/messages"
 );
 }

 console.log("=== FLOW COMPLETE: CHAT UNLOCKED ===");
 return NextResponse.json({ success: true, chat_unlocked: true, balance: balance - 2 });
 }

 console.log("=== FLOW COMPLETE: WAITING FOR OTHER PARTY ===");
 return NextResponse.json({ success: true, chat_unlocked: false, balance: balance - 2 });
 } catch (error) {
 console.error("ACCEPT MATCH ERROR:", error);
 return NextResponse.json({ error: "Server error" }, { status: 500 });
 }
}
