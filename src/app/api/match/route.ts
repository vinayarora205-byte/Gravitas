/* eslint-disable */
// @ts-nocheck
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
 try {
 const { matchId, action } = await req.json();
 if (!matchId || !action) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

 const { data: match, error: fetchError } = await supabase
 .from("matches")
 .select("*, job_listings(*), candidate_profiles(*)")
 .eq("id", matchId)
 .single();

 if (fetchError || !match) throw new Error("Match not found");

 const { error: updateError } = await supabase
 .from("matches")
 .update({ status: action })
 .eq("id", matchId);

 if (updateError) throw updateError;

 if (action === "ACCEPTED") {
 // Fetch profile details for both
 const { data: recruiterProfile } = await supabase.from("profiles").select("*").eq("id", match.recruiter_id).single();
 const { data: candidateProfile } = await supabase.from("profiles").select("*").eq("id", match.candidate_id).single();

 // ACTION 3 - Send "Connected!" email to both (mock)
 console.log(`[Email] Connected! ${candidateProfile.full_name} and ${recruiterProfile.full_name} are now connected.`);
 console.log(`[Email] Recruiter (${recruiterProfile.email}) notified of ${candidateProfile.full_name}`);
 console.log(`[Email] Candidate (${candidateProfile.email}) notified of ${match.job_listings.company_name}`);

 // ACTION 4 - Update notification: mark as CONNECTED
 await supabase.from("notifications").insert([
 {
 profile_id: match.candidate_id,
 title: "Connected! 🤝",
 message: `You are now connected with ${match.job_listings.company_name}. Contact details revealed.`,
 type: "MATCH",
 match_id: matchId
 },
 {
 profile_id: match.recruiter_id,
 title: "Connected! 🤝",
 message: `You are now connected with ${candidateProfile.full_name}. Contact details revealed.`,
 type: "MATCH",
 match_id: matchId
 }
 ]);

 return NextResponse.json({ 
 success: true, 
 contactDetails: {
 recruiter: {
 full_name: recruiterProfile.full_name,
 company: match.job_listings.company_name,
 email: recruiterProfile.email,
 whatsapp: recruiterProfile.whatsapp_number,
 linkedin: recruiterProfile.linkedin_url,
 website: recruiterProfile.company_website
 },
 candidate: {
 full_name: candidateProfile.full_name,
 email: candidateProfile.email,
 whatsapp: candidateProfile.whatsapp_number,
 linkedin: candidateProfile.linkedin_url,
 portfolio: candidateProfile.portfolio_url
 }
 }
 });
 }

 return NextResponse.json({ success: true });
 } catch (error) {
 console.error("Match update error:", error);
 return NextResponse.json({ error: "Failed to update match" }, { status: 500 });
 }
}
