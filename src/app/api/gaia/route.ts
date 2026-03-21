/* eslint-disable */
// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import Anthropic from "@anthropic-ai/sdk";
import { runMatchingForProfile } from "@/lib/matching";
import { createClient } from "@/lib/supabase/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const CANDIDATE_PROMPT = `You are GAIA, an AI talent agent for GRAVITAS. You are talking to a job seeker. Ask exactly ONE question at a time. Never ask two questions together. Wait for their answer before asking the next question.

Collect in this order, one by one:
1. What kind of job they are looking for
2. Their top skills
3. Years of experience
4. Expected monthly salary (min and max)
5. Work preference (Remote / Hybrid / Onsite)
6. Location or timezone
7. Availability (Immediate / 2 weeks / 1 month)
8. Full name
9. Email address
10. WhatsApp number with country code
11. LinkedIn profile URL
12. Portfolio or GitHub URL (tell them it is optional)

Rules:
- ONE question per message, never more
- Be warm and friendly, not like a form
- If salary seems low for their skills, suggest better range
- Support Hindi and English naturally
- After collecting everything, summarize their profile
- End with: 'Your gravity profile is now live. We will pull matching opportunities to you automatically.'
- Then wrap ALL extracted data in <PROFILE_DATA> tags as JSON:
{
  "job_title": "...", "skills": ["..."], "experience_years": 0, "salary_min": 0, "salary_max": 0,
  "work_type": "...", "location": "...", "availability": "...", "full_name": "...", "email": "...",
  "whatsapp_number": "...", "linkedin_url": "...", "portfolio_url": "..."
}`;

const RECRUITER_PROMPT = `You are GAIA, an AI talent agent for GRAVITAS. You are talking to a recruiter or hiring manager. Ask exactly ONE question at a time. Never ask two questions together. Wait for their answer before asking the next question.

Collect in this order, one by one:
1. Job title they are hiring for
2. Company name
3. Top 5 required skills
4. Minimum years of experience needed
5. Salary budget (min and max per month)
6. Work type (Remote / Hybrid / Onsite)
7. Location
8. Brief role description
9. Full name of the recruiter
10. Company website URL
11. Work email address
12. WhatsApp number with country code
13. LinkedIn profile URL

Rules:
- ONE question per message, never more
- Be professional and crisp
- If budget seems below market rate, mention it politely
- After collecting everything, confirm the job listing
- End with: 'Your job is now live in the gravity field. We will surface the best matching candidates automatically.'
- Then wrap ALL extracted data in <JOB_DATA> tags as JSON:
{
  "job_title": "...", "company_name": "...", "required_skills": ["..."], "min_experience": 0,
  "salary_min": 0, "salary_max": 0, "work_type": "...", "location": "...", "description": "...",
  "full_name": "...", "company_website": "...", "email": "...", "whatsapp_number": "...", 
  "linkedin_url": "..."
}`;

async function appendToChat(clerkUserId: string, message: string) {
  const supabase = createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .single()
  if (!profile) return
  
  const { data: conv } = await supabase
    .from('conversations')
    .select('id, messages')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!conv) return
  
  const msgs = Array.isArray(conv.messages) ? conv.messages : []
  await supabase
    .from('conversations')
    .update({
      messages: [...msgs, {
        role: 'assistant',
        content: message,
        timestamp: new Date().toISOString()
      }]
    })
    .eq('id', conv.id)
}

function calculateScore(candidate: any, job: any) {
  let score = 0
  
  // Title match 30 points
  const ct = (candidate.job_title || '').toLowerCase()
  const jt = (job.job_title || '').toLowerCase()
  if (ct === jt) score += 30
  else if (ct.includes(jt) || jt.includes(ct)) score += 20
  else {
    const cWords = ct.split(' ')
    const jWords = jt.split(' ')
    const common = cWords.filter(w => 
      w.length > 2 && jWords.some(jw => jw.includes(w) || w.includes(jw))
    )
    if (common.length > 0) score += 10
  }
  
  // Salary match 25 points
  const cMin = candidate.salary_min || 0
  const cMax = candidate.salary_max || cMin
  const jMin = job.salary_min || 0
  const jMax = job.salary_max || jMin
  if (cMin <= jMax && cMax >= jMin) score += 25
  else if (Math.abs(cMin - jMax) <= jMax * 0.25) score += 12

  // Work type 15 points
  const cw = (candidate.work_type || '').toLowerCase()
  const jw = (job.work_type || '').toLowerCase()
  if (cw === jw || jw === 'any' || cw === 'any') score += 15
  
  // Skills base 30 points
  const cs = (candidate.skills || []).map((s:string) => s.toLowerCase())
  const js = (job.required_skills || []).map((s:string) => s.toLowerCase())
  if (cs.length > 0 && js.length > 0) {
    let matches = 0
    for (const skill of js) {
      if (cs.some(cs => cs.includes(skill) || skill.includes(cs))) {
        matches++
      }
    }
    score += Math.round((matches / js.length) * 30)
  } else {
    score += 15
  }
  
  return Math.min(score, 100)
}

async function processNewMatch(
  savedId: string, 
  role: 'CANDIDATE' | 'RECRUITER'
) {
  const supabase = createClient()
  let matchesFound = []
  let notificationsCreated = 0
  
  if (role === 'CANDIDATE') {
    const { data: candidate } = await supabase
      .from('candidate_profiles')
      .select('*, profiles(id, clerk_user_id, email)')
      .eq('profile_id', savedId)
      .single()
    
    if (!candidate) return { matches: [], notifications: 0 };

    const { data: jobs } = await supabase
      .from('job_listings')
      .select('*, profiles(id, clerk_user_id, email)')
      .eq('is_active', true)
    
    for (const job of jobs || []) {
      const score = calculateScore(candidate, job)
      if (score < 60) continue
      
      // Save match
      const { data: match } = await supabase.from('matches').insert({
        candidate_id: savedId,
        job_id: job.id,
        score,
        status: 'PENDING'
      }).select().single()
      
      if (match) matchesFound.push(match)
      
      // Notify candidate
      await supabase.from('notifications').insert({
        user_id: candidate.profiles.id,
        title: '⚡ New Job Match Found!',
        message: job.company_name + ' is hiring ' + 
          job.job_title + '. Score: ' + score + '%',
        type: 'MATCH',
        is_read: false
      })
      notificationsCreated++
      
      // Notify recruiter
      await supabase.from('notifications').insert({
        user_id: job.profiles.id,
        title: '⚡ New Candidate Match!',
        message: candidate.job_title + 
          ' specialist matched your role. Score: ' + 
          score + '%',
        type: 'MATCH',
        is_read: false
      })
      notificationsCreated++
      
      // Add to candidate chat
      await appendToChat(
        candidate.profiles.clerk_user_id,
        '⚡ GAIA found a job match!\n\n' +
        'Company: ' + job.company_name + '\n' +
        'Role: ' + job.job_title + '\n' +
        'Salary: ₹' + job.salary_min + 
        '-' + job.salary_max + '/month\n' +
        'Score: ' + score + '%\n\n' +
        'Are you interested? Reply YES.'
      )
      
      // Add to recruiter chat
      await appendToChat(
        job.profiles.clerk_user_id,
        '⚡ GAIA found a candidate match!\n\n' +
        'Role: ' + candidate.job_title + '\n' +
        'Expected: ₹' + candidate.salary_min + 
        '-' + candidate.salary_max + '/month\n' +
        'Score: ' + score + '%\n\n' +
        'Reply YES to get contact details.'
      )
    }
  }
  
  if (role === 'RECRUITER') {
    const { data: job } = await supabase
      .from('job_listings')
      .select('*, profiles(id, clerk_user_id, email)')
      .eq('profile_id', savedId)
      .single()
    
    if (!job) return { matches: [], notifications: 0 };

    const { data: candidates } = await supabase
      .from('candidate_profiles')
      .select('*, profiles(id, clerk_user_id, email)')
    
    for (const candidate of candidates || []) {
      const score = calculateScore(candidate, job)
      if (score < 60) continue
      
      const { data: match } = await supabase.from('matches').insert({
        candidate_id: candidate.profile_id,
        job_id: job.id,
        score,
        status: 'PENDING'
      }).select().single()

      if (match) matchesFound.push(match)
      
      await supabase.from('notifications').insert({
        user_id: candidate.profiles.id,
        title: '⚡ New Job Match Found!',
        message: job.company_name + ' is hiring ' + 
          job.job_title + '. Score: ' + score + '%',
        type: 'MATCH',
        is_read: false
      })
      notificationsCreated++
      
      await supabase.from('notifications').insert({
        user_id: job.profiles.id,
        title: '⚡ New Candidate Match!',
        message: candidate.job_title + 
          ' matched your role. Score: ' + score + '%',
        type: 'MATCH',
        is_read: false
      })
      notificationsCreated++
      
      await appendToChat(
        candidate.profiles.clerk_user_id,
        '⚡ GAIA found a job match!\n\n' +
        'Company: ' + job.company_name + '\n' +
        'Role: ' + job.job_title + '\n' +
        'Score: ' + score + '%\n\n' +
        'Are you interested? Reply YES.'
      )
      
      await appendToChat(
        job.profiles.clerk_user_id,
        '⚡ New candidate matched!\n\n' +
        'Role: ' + candidate.job_title + '\n' +
        'Score: ' + score + '%\n\n' +
        'Reply YES for contact details.'
      )
    }
  }

  return { matches: matchesFound, notifications: notificationsCreated }
}

export async function POST(req: NextRequest) {
  try {
    const { message, conversationId, profileId, role } = await req.json();
    console.log("1. MESSAGE RECEIVED:", message);
    console.log("2. ROLE:", role);

    if (!message || !conversationId || !profileId || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const systemPrompt = role?.toUpperCase() === "CANDIDATE" ? CANDIDATE_PROMPT : RECRUITER_PROMPT;

    const { data: convo, error: convoError } = await supabase
      .from("conversations")
      .select("messages")
      .eq("id", conversationId)
      .maybeSingle();

    if (convoError || !convo) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const previousMessages = convo?.messages || [];
    const updatedMessages = [...previousMessages, { role: "user", content: message }];

    await supabase
      .from("conversations")
      .update({ messages: updatedMessages })
      .eq("id", conversationId);

    const stream = client.messages
      .stream({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: systemPrompt,
        messages: updatedMessages.map((msg: { role: string; content: string }) => ({
          role: msg.role === "assistant" ? "assistant" : "user",
          content: msg.content,
        })) as Anthropic.MessageParam[],
      });

    const encoder = new TextEncoder();
    let aiText = "";

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
              const chunkText = chunk.delta.text;
              aiText += chunkText;
              controller.enqueue(encoder.encode(chunkText));
            }
          }

          let finalExtractedText = aiText;
          console.log("3. AI RESPONSE COLLECTED:", aiText.slice(0, 100));
          console.log("4. PROFILE_DATA TAG FOUND:", aiText.includes('<PROFILE_DATA>'));
          console.log("5. JOB_DATA TAG FOUND:", aiText.includes('<JOB_DATA>'));

          // Check for JSON extraction
          const profileMatch = aiText.match(/<PROFILE_DATA>([\s\S]*?)<\/PROFILE_DATA>/);
          const jobMatch = aiText.match(/<JOB_DATA>([\s\S]*?)<\/JOB_DATA>/);

          console.log("PROFILE MATCH FOUND:", !!profileMatch);
          console.log("JOB MATCH FOUND:", !!jobMatch);

          if (profileMatch && role === "CANDIDATE") {
            try {
              const parsed = JSON.parse(profileMatch[1].trim());
              console.log("SAVING CANDIDATE PROFILE:", parsed);
              await supabase.from("profiles").update({
                full_name: parsed.full_name,
                email: parsed.email,
                whatsapp_number: parsed.whatsapp_number,
                linkedin_url: parsed.linkedin_url,
                portfolio_url: parsed.portfolio_url
              }).eq("id", profileId);

              const { data: existingCand } = await supabase.from("candidate_profiles").select("id").eq("profile_id", profileId).maybeSingle();
              if (existingCand) {
                await supabase.from("candidate_profiles").update({
                  job_title: parsed.job_title,
                  skills: parsed.skills,
                  experience_years: parsed.experience_years,
                  salary_min: parsed.salary_min,
                  salary_max: parsed.salary_max,
                  work_type: parsed.work_type,
                  location: parsed.location,
                  availability: parsed.availability
                }).eq("profile_id", profileId);
              } else {
                await supabase.from("candidate_profiles").insert({
                  profile_id: profileId,
                  job_title: parsed.job_title,
                  skills: parsed.skills,
                  experience_years: parsed.experience_years,
                  salary_min: parsed.salary_min,
                  salary_max: parsed.salary_max,
                  work_type: parsed.work_type,
                  location: parsed.location,
                  availability: parsed.availability
                });
              }

              // TRIGGER MATCHING
              console.log("PROFILE SAVED - running matching...");
              const { matches, notifications } = await processNewMatch(profileId, "CANDIDATE");
              console.log("MATCHES FOUND:", matches.length);
              console.log("NOTIFICATIONS CREATED:", notifications);

            } catch (e) {
              console.error("Failed to parse PROFILE_DATA JSON", e);
            }
          } else if (jobMatch && role === "RECRUITER") {
            try {
              const parsed = JSON.parse(jobMatch[1].trim());
              console.log("SAVING JOB LISTING:", parsed);
              await supabase.from("profiles").update({
                full_name: parsed.full_name,
                email: parsed.email,
                whatsapp_number: parsed.whatsapp_number,
                linkedin_url: parsed.linkedin_url,
                company_website: parsed.company_website
              }).eq("id", profileId);

              await supabase.from("job_listings").insert({
                profile_id: profileId,
                job_title: parsed.job_title,
                company_name: parsed.company_name,
                required_skills: parsed.required_skills,
                min_experience: parsed.min_experience,
                salary_min: parsed.salary_min,
                salary_max: parsed.salary_max,
                work_type: parsed.work_type,
                location: parsed.location,
                description: parsed.description,
                is_active: true
              });

              // TRIGGER MATCHING
              console.log("JOB SAVED - running matching...");
              const { matches, notifications } = await processNewMatch(profileId, "RECRUITER");
              console.log("MATCHES FOUND:", matches.length);
              console.log("NOTIFICATIONS CREATED:", notifications);
            } catch (e) {
              console.error("Failed to parse JOB_DATA JSON", e);
            }
          }

          const finalMessages = [...updatedMessages, { role: "assistant", content: finalExtractedText }];
          await supabase
            .from("conversations")
            .update({ messages: finalMessages })
            .eq("id", conversationId);

          controller.close();
        } catch (error) {
          console.error("Stream error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });

  } catch (error) {
    console.error("GAIA API Error:", error);
    return NextResponse.json({ error: "Failed to process message" }, { status: 500 });
  }
}

