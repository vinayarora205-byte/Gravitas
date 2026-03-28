/* eslint-disable */
// @ts-nocheck
import { supabase } from "./supabase";

/**
 * Real Matching System for Clauhire.
 * Implements the specific scoring rules for title, skills, salary, and work type.
 */

function skillsOverlap(jobSkills: string[], candidateSkills: string[]) {
  if (!jobSkills || jobSkills.length === 0) return 0;
  const jobList = jobSkills.map(s => s.toLowerCase().trim());
  const candidateList = (candidateSkills || []).map(s => s.toLowerCase().trim());
  
  let matches = 0;
  for (const jobSkill of jobList) {
    for (const candidateSkill of candidateList) {
      if (jobSkill.includes(candidateSkill) || 
          candidateSkill.includes(jobSkill) ||
          jobSkill.split(/\s+/).some(word => word.length > 3 && candidateSkill.includes(word))) {
        matches++;
        break;
      }
    }
  }
  return matches / jobList.length;
}

function titleMatch(jobTitle: string, candidateTitle: string) {
  const jt = (jobTitle || "").toLowerCase().trim();
  const ct = (candidateTitle || "").toLowerCase().trim();
  if (jt === ct) return 1.0;
  if (jt.includes(ct) || ct.includes(jt)) return 0.8;
  
  const keywords = ['ghl', 'developer', 'expert', 'manager', 'designer', 'editor', 'automation', 'frontend', 'backend', 'fullstack'];
  for (const kw of keywords) {
    if (jt.includes(kw) && ct.includes(kw)) return 0.7;
  }
  return 0;
}

function salaryMatch(jobMin: number, jobMax: number, candMin: number, candMax: number) {
  const jMin = jobMin || 0;
  const jMax = jobMax || jobMin || 0;
  const cMin = candMin || 0;
  const cMax = candMax || candMin || 0;
  
  if (cMin <= jMax && cMax >= jMin) return 1.0;
  
  const gap = Math.min(
    Math.abs(cMin - jMax),
    Math.abs(jMin - cMax)
  );
  if (gap <= (jMax || 1) * 0.25) return 0.5;
  return 0;
}

function calculateMatchScore(job: any, candidate: any) {
  let score = 0;

  const tMatch = titleMatch(job.job_title, candidate.job_title);
  score += tMatch * 30;

  const sOverlap = skillsOverlap(job.required_skills || [], candidate.skills || []);
  score += sOverlap * 30;

  const salMatch = salaryMatch(
    Number(job.salary_min), Number(job.salary_max),
    Number(candidate.salary_min), Number(candidate.salary_max)
  );
  score += salMatch * 25;

  const jobType = (job.work_type || "").toUpperCase();
  const candType = (candidate.work_type || "").toUpperCase();
  let wtScore = 0;
  if (jobType === candType) {
    wtScore = 15;
  } else if (jobType === 'REMOTE' || candType === 'REMOTE' || jobType === 'HYBRID' || candType === 'HYBRID') {
    wtScore = 8;
  }
  score += wtScore;

  console.log(`[Score] Title:${tMatch*30} Skills:${sOverlap*30} Salary:${salMatch*25} WorkType:${wtScore} Total:${Math.round(score)}`);
  return Math.round(score);
}

async function createNotification({ user_id, title, message, match_id }: any) {
  try {
    const { error } = await supabase.from("notifications").insert({
      user_id,
      type: "MATCH",
      title,
      message,
      match_id,
      is_read: false
    });
    if (error) console.error("[Notification] Insert error:", error);
    else console.log(`[Notification] Created for ${user_id}: ${title}`);
  } catch (e) {
    console.error("Failed to create notification", e);
  }
}

async function appendMatchMessageToChat(profileId: string, messageText: string) {
  try {
    const { data: convo } = await supabase
      .from("conversations")
      .select("id, messages")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (convo) {
      const newMessage = {
        role: "assistant",
        content: messageText,
        timestamp: new Date().toISOString(),
        type: "match_notification"
      };
      const updatedMessages = [...(convo.messages || []), newMessage];
      const { error } = await supabase
        .from("conversations")
        .update({ messages: updatedMessages })
        .eq("id", convo.id);
      if (error) console.error("[Chat] Update error:", error);
      else console.log(`[Chat] Appended match message to conversation ${convo.id} for profile ${profileId}`);
    } else {
      console.warn(`[Chat] No conversation found for profile ${profileId}`);
    }
  } catch (e) {
    console.error("Failed to append match to chat", e);
  }
}

async function sendMatchEmails(job: any, candidate: any, score: number) {
  console.log("====== EMAIL NOTIFICATION ======");
  console.log(`Match: ${candidate.profiles?.full_name || 'Candidate'} <-> ${job.company_name || 'Company'} (${job.job_title})`);
  console.log(`Score: ${score}%`);
  console.log("================================");
  
  // Try to send real emails if RESEND_API_KEY is configured
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'placeholder') {
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      // Email to candidate (if we have their email via Clerk)
      console.log("[Email] Resend API key found - attempting email send");
      
      await resend.emails.send({
        from: 'Clauhire <onboarding@resend.dev>',
        to: 'delivered@resend.dev', // Resend test address
        subject: `⚡ Clauhire: New Match — ${job.job_title} at ${job.company_name}`,
        html: `
          <div style="font-family:Inter,sans-serif;background:#F7F6F3;padding:40px">
            <h2 style="color:#FF6B3D">⚡ Clauhire Match</h2>
            <div style="background:white;padding:24px;border-radius:12px;border:1px solid #EAEAEA">
              <p><strong>Role:</strong> ${job.job_title}</p>
              <p><strong>Company:</strong> ${job.company_name}</p>
              <p><strong>Match Score:</strong> ${score}%</p>
            </div>
          </div>
        `
      });
      console.log("[Email] Sent successfully via Resend");
    } catch (err) {
      console.error("[Email] Resend error:", err);
    }
  } else {
    console.log("[Email] No RESEND_API_KEY configured - skipping real email send");
  }
}

export { calculateMatchScore };

export async function runMatchingForProfile(profileId: string, role: "CANDIDATE" | "RECRUITER") {
  console.log(`[Matching] Running matching engine for ${role}: ${profileId}`);

  let currentProfile: any;
  let targets: any[];

  if (role === "CANDIDATE") {
    const { data: candidate } = await supabase
      .from("candidate_profiles")
      .select("*, profiles(full_name, clerk_user_id)")
      .eq("profile_id", profileId)
      .maybeSingle();
    if (!candidate) return [];
    currentProfile = candidate;

    const { data: jobs } = await supabase
      .from("job_listings")
      .select("*, profiles(full_name, clerk_user_id)")
      .eq("is_active", true);
    targets = jobs || [];
  } else {
    const { data: job } = await supabase
      .from("job_listings")
      .select("*, profiles(full_name, clerk_user_id)")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!job) return [];
    currentProfile = job;

    const { data: candidates } = await supabase
      .from("candidate_profiles")
      .select("*, profiles(full_name, clerk_user_id)");
    targets = candidates || [];
  }

  const results = [];

  for (const target of targets) {
    const job = role === "CANDIDATE" ? target : currentProfile;
    const candidate = role === "CANDIDATE" ? currentProfile : target;

    const score = calculateMatchScore(job, candidate);
    console.log(`[Matching] Score for Job(${job.job_title}) vs Candidate(${candidate.job_title}): ${score}`);

    if (score >= 60) {
      // Check for existing match
      const { data: existingMatch } = await supabase
        .from("matches")
        .select("id")
        .eq("job_id", job.id)
        .eq("candidate_id", candidate.profile_id)
        .maybeSingle();

      let match;
      if (existingMatch) {
         const { data: updatedMatch, error: updateError } = await supabase
           .from("matches")
           .update({ score: score, status: "PENDING" })
           .eq("id", existingMatch.id)
           .select();
         if (updateError) console.error("[Matching] Update Error:", updateError);
         match = updatedMatch?.[0];
      } else {
         const { data: insertedMatch, error: insertError } = await supabase
           .from("matches")
           .insert({
             candidate_id: candidate.profile_id,
             job_id: job.id,
             score: score,
             status: "PENDING"
           })
           .select();
         if (insertError) console.error("[Matching] Insert Error:", insertError);
         match = insertedMatch?.[0];
      }

      if (match) {
        console.log(`[Matching] Match processed: ${match.id} (score: ${score}%)`);
        
        // 1. Notifications for BOTH parties (user_id = profiles.id = FK)
        await createNotification({
          user_id: candidate.profile_id,
          title: "⚡ New Job Match Found!",
          message: `${job.company_name || 'A company'} is looking for ${job.job_title}. Match: ${score}%`,
          match_id: match.id
        });
        await createNotification({
          user_id: job.profile_id,
          title: "⚡ New Candidate Match!",
          message: `${candidate.profiles?.full_name || 'A candidate'} matches your ${job.job_title} role. Score: ${score}%`,
          match_id: match.id
        });

        // 2. Chat message for CANDIDATE
        const expYears = candidate.experience_years || 'Not specified';
        await appendMatchMessageToChat(
          candidate.profile_id,
          `⚡ Great news! Claura found a job match for you!\n\n` +
          `Company: ${job.company_name || 'Confidential'}\n` +
          `Role: ${job.job_title}\n` +
          `Salary: ₹${job.salary_min || '?'}-${job.salary_max || '?'}/month\n` +
          `Work Type: ${job.work_type || 'Not specified'}\n` +
          `Match Score: ${score}%\n\n` +
          `The recruiter has been notified. Are you interested in this opportunity?`
        );

        // 3. Chat message for RECRUITER
        await appendMatchMessageToChat(
          job.profile_id,
          `⚡ Claura found a matching candidate!\n\n` +
          `Name: ${candidate.profiles?.full_name || 'Anonymous'}\n` +
          `Role: ${candidate.job_title || 'Not specified'}\n` +
          `Skills: ${(candidate.skills || []).join(', ') || 'Not specified'}\n` +
          `Expected: ₹${candidate.salary_min || '?'}-${candidate.salary_max || '?'}/month\n` +
          `Experience: ${expYears} years\n` +
          `Match Score: ${score}%\n\n` +
          `Would you like to connect with this candidate?`
        );

        // 4. Email notifications
        await sendMatchEmails(job, candidate, score);
        
        results.push({ ...match, score });
      }
    }
  }
  return results;
}
