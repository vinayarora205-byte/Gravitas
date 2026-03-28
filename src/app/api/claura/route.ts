/* eslint-disable */
// @ts-nocheck
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
const supabaseAdmin = createSupabaseAdmin(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
import Anthropic from "@anthropic-ai/sdk";
import { runMatchingForProfile } from "@/lib/matching";
import { createClient } from "@/lib/supabase/server";
import { sendMatchEmail } from "@/lib/email";
import pdf from "pdf-parse";

const client = new Anthropic({
 apiKey: process.env.ANTHROPIC_API_KEY,
});

const CANDIDATE_PROMPT = `You are Claura, an AI talent agent for Clauhire. You are talking to a job seeker. Ask exactly ONE question at a time. Never ask two questions together. Wait for their answer before asking the next question.

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

const RECRUITER_PROMPT = `You are Claura, an AI talent agent for Clauhire. You are talking to a recruiter or hiring manager. Ask exactly ONE question at a time. Never ask two questions together. Wait for their answer before asking the next question.

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

export async function processNewMatch(
 savedId: string, 
 role: 'CANDIDATE' | 'RECRUITER'
) {
 const supabase = createClient()
 let matchesFound = []
 let notificationsCreated = 0
 
 if (role === 'CANDIDATE') {
 const { data: candidate } = await supabase
 .from('candidate_profiles')
 .select('*, profiles(id, clerk_user_id, email, full_name)')
 .eq('profile_id', savedId)
 .single()
 
 if (!candidate) return { matches: [], notifications: 0 };

 const { data: jobs } = await supabaseAdmin
 .from('job_listings')
 .select('*, profiles(id, clerk_user_id, email, full_name)')
 .eq('is_active', true)
 
 for (const job of jobs || []) {
 const score = calculateScore(candidate, job)
 if (score < 60) continue
 
 // Save match
 const { data: match } = await supabaseAdmin.from('matches').insert({
 candidate_id: savedId,
 job_id: job.id,
 score,
 status: 'PENDING'
 }).select().single()
 
 if (match) matchesFound.push(match)
 
 // Notify candidate
 await supabaseAdmin.from('notifications').insert({
 user_id: candidate.profiles.id,
 title: '⚡ New Job Match Found!',
 message: job.company_name + ' is hiring ' + 
 job.job_title + '. Score: ' + score + '%',
 type: 'MATCH',
 is_read: false
 })
 notificationsCreated++
 
 // Notify recruiter
 await supabaseAdmin.from('notifications').insert({
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
 `⚡ Claura found a job match for you!\n\n` +
 `Company: ${job.company_name || 'Confidential'}\n` +
 `Role: ${job.job_title || 'Not specified'}\n` +
 `Salary: ₹${job.salary_min || '0'}-${job.salary_max || '0'}/month\n` +
 `Work Type: ${job.work_type || 'Not specified'}\n` +
 `Match Score: ${score}%\n\n` +
 `Are you interested? Reply YES to get full recruiter contact details.`
 )
 
 // Add to recruiter chat
 await appendToChat(
 job.profiles.clerk_user_id,
 `⚡ Claura found a matching candidate!\n\n` +
 `Name: ${candidate.profiles?.full_name || 'Anonymous'}\n` +
 `Role: ${candidate.job_title || 'Not specified'}\n` +
 `Expected: ₹${candidate.salary_min || '0'}-${candidate.salary_max || '0'}/month\n` +
 `Experience: ${candidate.experience_years || '0'} years\n` +
 `Match Score: ${score}%\n\n` +
 `Reply YES to get candidate contact details.`
 )

 await sendMatchEmail(
 candidate.profiles.email,
 "⚡ Clauhire: New Job Match - " + job.job_title,
 "<h2>New Job Match Found!</h2>" +
 "<p><strong>Company:</strong> " + (job.company_name || "Confidential") + "</p>" +
 "<p><strong>Role:</strong> " + job.job_title + "</p>" +
 "<p><strong>Salary:</strong> ₹" + (job.salary_min || 0) + 
 "-" + (job.salary_max || 0) + "/month</p>" +
 "<p><strong>Match Score:</strong> " + score + "%</p>" +
 "<p>Login to Clauhire to accept this match.</p>" +
 "<a href='https://clauhire-dusky.vercel.app/chat' " +
 "style='background:#FF6B3D;color:white;padding:12px 24px;" +
 "border-radius:8px;text-decoration:none;display:inline-block;" +
 "margin-top:16px'>View Match →</a>"
 )

 await sendMatchEmail(
 job.profiles.email,
 "⚡ Clauhire: New Candidate - " + (candidate.profiles?.full_name || "Anonymous"),
 "<h2>New Candidate Match!</h2>" +
 "<p><strong>Name:</strong> " + (candidate.profiles?.full_name || "Anonymous") + "</p>" +
 "<p><strong>Role:</strong> " + candidate.job_title + "</p>" +
 "<p><strong>Expected:</strong> ₹" + (candidate.salary_min || 0) + 
 "-" + (candidate.salary_max || 0) + "/month</p>" +
 "<p><strong>Match Score:</strong> " + score + "%</p>" +
 "<p>Login to Clauhire to connect with this candidate.</p>" +
 "<a href='https://clauhire-dusky.vercel.app/chat' " +
 "style='background:#FF6B3D;color:white;padding:12px 24px;" +
 "border-radius:8px;text-decoration:none;display:inline-block;" +
 "margin-top:16px'>View Match →</a>"
 )
 }
 }
 
 if (role === 'RECRUITER') {
 const { data: job } = await supabase
 .from('job_listings')
 .select('*, profiles(id, clerk_user_id, email, full_name)')
 .eq('profile_id', savedId)
 .single()
 
 if (!job) return { matches: [], notifications: 0 };

 const { data: candidates } = await supabase
 .from('candidate_profiles')
 .select('*, profiles(id, clerk_user_id, email, full_name)')
 
 for (const candidate of candidates || []) {
 const score = calculateScore(candidate, job)
 console.log(`[TEST MATCH] Candidate: ${candidate.job_title} | Job: ${job.job_title} | Score: ${score}`);
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
 `⚡ Claura found a job match for you!\n\n` +
 `Company: ${job.company_name || 'Confidential'}\n` +
 `Role: ${job.job_title || 'Not specified'}\n` +
 `Salary: ₹${job.salary_min || '0'}-${job.salary_max || '0'}/month\n` +
 `Work Type: ${job.work_type || 'Not specified'}\n` +
 `Match Score: ${score}%\n\n` +
 `Are you interested? Reply YES to get full recruiter contact details.`
 )
 
 await appendToChat(
 job.profiles.clerk_user_id,
 `⚡ Claura found a matching candidate!\n\n` +
 `Name: ${candidate.profiles?.full_name || 'Anonymous'}\n` +
 `Role: ${candidate.job_title || 'Not specified'}\n` +
 `Expected: ₹${candidate.salary_min || '0'}-${candidate.salary_max || '0'}/month\n` +
 `Experience: ${candidate.experience_years || '0'} years\n` +
 `Match Score: ${score}%\n\n` +
 `Reply YES to get candidate contact details.`
 )

 await sendMatchEmail(
 candidate.profiles.email,
 "⚡ Clauhire: New Job Match - " + job.job_title,
 "<h2>New Job Match Found!</h2>" +
 "<p><strong>Company:</strong> " + (job.company_name || "Confidential") + "</p>" +
 "<p><strong>Role:</strong> " + job.job_title + "</p>" +
 "<p><strong>Salary:</strong> ₹" + (job.salary_min || 0) + 
 "-" + (job.salary_max || 0) + "/month</p>" +
 "<p><strong>Match Score:</strong> " + score + "%</p>" +
 "<p>Login to Clauhire to accept this match.</p>" +
 "<a href='https://clauhire-dusky.vercel.app/chat' " +
 "style='background:#FF6B3D;color:white;padding:12px 24px;" +
 "border-radius:8px;text-decoration:none;display:inline-block;" +
 "margin-top:16px'>View Match →</a>"
 )

 await sendMatchEmail(
 job.profiles.email,
 "⚡ Clauhire: New Candidate - " + (candidate.profiles?.full_name || "Anonymous"),
 "<h2>New Candidate Match!</h2>" +
 "<p><strong>Name:</strong> " + (candidate.profiles?.full_name || "Anonymous") + "</p>" +
 "<p><strong>Role:</strong> " + candidate.job_title + "</p>" +
 "<p><strong>Expected:</strong> ₹" + (candidate.salary_min || 0) + 
 "-" + (candidate.salary_max || 0) + "/month</p>" +
 "<p><strong>Match Score:</strong> " + score + "%</p>" +
 "<p>Login to Clauhire to connect with this candidate.</p>" +
 "<a href='https://clauhire-dusky.vercel.app/chat' " +
 "style='background:#FF6B3D;color:white;padding:12px 24px;" +
 "border-radius:8px;text-decoration:none;display:inline-block;" +
 "margin-top:16px'>View Match →</a>"
 )
 }
 }

 return { matches: matchesFound, notifications: notificationsCreated }
}

async function extractTextFromFile(
 fileData: string,
 fileType: string,
 fileName: string
): Promise<string> {
 try {
 const buffer = Buffer.from(fileData, 'base64')
 
 // Handle DOCX files
 if (fileName.endsWith('.docx') || 
 fileType.includes('word') ||
 fileType.includes('docx')) {
 const mammoth = require('mammoth')
 const result = await mammoth.extractRawText({ buffer })
 console.log("DOCX TEXT EXTRACTED:", result.value.slice(0,200))
 return result.value
 }
 
 // Handle PDF files
 if (fileType.includes('pdf') || 
 fileName.endsWith('.pdf')) {
 const pdfParse = require('pdf-parse')
 const result = await pdfParse(buffer)
 console.log("PDF TEXT EXTRACTED:", result.text.slice(0,200))
 return result.text
 }
 
 // Handle images - return base64 for Claude vision
 if (fileType.includes('image')) {
 return 'IMAGE_FILE'
 }
 
 return ''
 } catch (err) {
 console.error("FILE EXTRACTION ERROR:", err)
 return ''
 }
}

export async function POST(req: NextRequest) {
 try {
 console.log("=== Claura API CALLED ===")
 
 const body = await req.json();
 const { message, conversationId, profileId, role, fileData, fileName, fileType } = body;
 
 console.log("Message:", message)
 console.log("Role:", role)
 console.log("Has file:", !!fileData)
 console.log("File type:", fileType)
 console.log("File name:", fileName)
 console.log("ConversationId:", conversationId)
 console.log("ProfileId:", profileId)

 if ((!message && !fileData) || !conversationId || !profileId || !role) {
 console.log("MISSING FIELDS - message:", !!message, "fileData:", !!fileData, "conversationId:", !!conversationId, "profileId:", !!profileId, "role:", !!role)
 return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
 }

 const userRole = role?.toUpperCase();
 const systemPrompt = userRole === "CANDIDATE" ? CANDIDATE_PROMPT : RECRUITER_PROMPT;

 // INTERCEPT: 'YES' / 'Interested' response
 const normalizedMessage = (message || "").trim().toLowerCase().replace(/[^\w\s]/gi, '');
 const isYes = ["yes", "interested", "yes i am", "i am interested", "yes please"].includes(normalizedMessage);

 if (isYes) {
 console.log("Intercepting YES response for match acceptance");
 
 let matchToAccept = null;
 if (userRole === "CANDIDATE") {
 const { data: pendingMatches, error: candMatchErr } = await supabaseAdmin
 .from('matches')
 .select('id, job_id, candidate_id, score, job_listings!inner(job_title, company_name, profiles(id, full_name, email, whatsapp_number, linkedin_url, company_website))')
 .eq('candidate_id', profileId)
 .eq('status', 'PENDING')
 .order('created_at', { ascending: false })
 .limit(1);
 if (candMatchErr) console.error("Cand Match Err:", candMatchErr);
 if (pendingMatches && pendingMatches.length > 0) matchToAccept = pendingMatches[0];
 } else {
 const { data: myJobs } = await supabaseAdmin.from('job_listings').select('id').eq('profile_id', profileId);
 const myJobIds = myJobs?.map(j => j.id) || [];
 if (myJobIds.length > 0) {
 const { data: pendingMatches, error: recMatchErr } = await supabaseAdmin
 .from('matches')
 .select('id, job_id, candidate_id, score, profiles!candidate_id(id, full_name, email, whatsapp_number, linkedin_url, portfolio_url)')
 .in('job_id', myJobIds)
 .eq('status', 'PENDING')
 .order('created_at', { ascending: false })
 .limit(1);
 if (recMatchErr) console.error("Rec Match Err:", recMatchErr);
 if (pendingMatches && pendingMatches.length > 0) matchToAccept = pendingMatches[0];
 }
 }

 console.log("Found Match to Accept:", matchToAccept?.id);

 if (matchToAccept) {
 const { error: updateError } = await supabaseAdmin.from('matches').update({ status: 'ACCEPTED' }).eq('id', matchToAccept.id);
 if (updateError) console.error("Status Update Error:", updateError);
 
 let replyContent = "";
 if (userRole === "CANDIDATE") {
 const recruiterUser = Array.isArray(matchToAccept.job_listings?.profiles) ? matchToAccept.job_listings.profiles[0] : matchToAccept.job_listings?.profiles;
 replyContent = `✅ Match Accepted! Here are the recruiter's contact details:\n\n` +
 `Name: ${recruiterUser?.full_name || 'Not provided'}\n` +
 `Email: ${recruiterUser?.email || 'Not provided'}\n` +
 `WhatsApp: ${recruiterUser?.whatsapp_number || 'Not provided'}\n` +
 `LinkedIn: ${recruiterUser?.linkedin_url || 'Not provided'}\n` +
 `Website: ${recruiterUser?.company_website || 'Not provided'}\n\n` +
 `Good luck with your application!`;
 } else {
 const candUser = Array.isArray(matchToAccept.profiles) ? matchToAccept.profiles[0] : matchToAccept.profiles;
 replyContent = `✅ Match Accepted! Here are the candidate's contact details:\n\n` +
 `Name: ${candUser?.full_name || 'Not provided'}\n` +
 `Email: ${candUser?.email || 'Not provided'}\n` +
 `WhatsApp: ${candUser?.whatsapp_number || 'Not provided'}\n` +
 `LinkedIn: ${candUser?.linkedin_url || 'Not provided'}\n` +
 `Portfolio: ${candUser?.portfolio_url || 'Not provided'}\n\n` +
 `Feel free to reach out to them directly to coordinate an interview.`;
 }

 const { data: convo } = await supabaseAdmin.from('conversations').select('messages').eq('id', conversationId).single();
 const prevMsgs = Array.isArray(convo?.messages) ? convo.messages : [];
 const newMsgs = [
 ...prevMsgs, 
 { role: 'user', content: message, timestamp: new Date().toISOString() },
 { role: 'assistant', content: replyContent, timestamp: new Date().toISOString() }
 ];
 await supabaseAdmin.from('conversations').update({ messages: newMsgs }).eq('id', conversationId);

 const encoder = new TextEncoder();
 const readableStream = new ReadableStream({
 start(controller) {
 controller.enqueue(encoder.encode(replyContent));
 controller.close();
 }
 });
 return new Response(readableStream, { headers: { "Content-Type": "text/plain; charset=utf-8" }});
 }
 }

 // ===== MAIN CHAT FLOW =====
 console.log("Entering main chat flow...")

 const { data: convo, error: convoError } = await supabaseAdmin
 .from("conversations")
 .select("messages")
 .eq("id", conversationId)
 .maybeSingle();

 if (convoError || !convo) {
 console.log("Conversation not found:", conversationId, convoError)
 return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
 }

 const previousMessages = convo?.messages || [];
 
 let dbContentText = message || "";
 if (fileName) {
 dbContentText = `[Attached File: ${fileName}]\n\n${message || ""}`;
 }

 const updatedMessages = [...previousMessages, { role: "user", content: dbContentText, timestamp: new Date().toISOString() }];

 await supabaseAdmin
 .from("conversations")
 .update({ messages: updatedMessages })
 .eq("id", conversationId);

 console.log("Messages saved to DB, building Anthropic payload...")

 // Build messages for Claude
 const anthropicMessages: any[] = [];

 // Add conversation history
 for (const msg of updatedMessages) {
 if (msg.role === 'user' || msg.role === 'assistant') {
 anthropicMessages.push({
 role: msg.role,
 content: msg.content
 });
 }
 }

 // Handle file if present
 if (fileData && fileName) {
 console.log("Processing file attachment...")
 let fileContent = '';
 
 try {
 const rawBase64 = fileData.includes(',') ? fileData.split(',')[1] : fileData;

 if (fileType?.includes('image')) {
 console.log("Image file detected, using Claude vision...")
 let mediaType = fileType.split(";")[0] || "image/jpeg";
 if (!["image/jpeg", "image/png", "image/gif", "image/webp"].includes(mediaType)) {
 mediaType = "image/jpeg";
 }
 // Replace the last user message with vision content
 anthropicMessages[anthropicMessages.length - 1] = {
 role: 'user',
 content: [
 {
 type: 'image',
 source: {
 type: 'base64',
 media_type: mediaType,
 data: rawBase64
 }
 },
 {
 type: 'text',
 text: `This is a ${userRole === 'CANDIDATE' ? 'resume' : 'job description'} image. Extract all information and tell me what you found. Then ask for the first missing piece of information.\n\n${message || ''}`
 }
 ]
 };
 } else {
 // Document file - extract text
 const buffer = Buffer.from(rawBase64, 'base64');
 
 if (fileName.endsWith('.docx') || fileType?.includes('word') || fileType?.includes('docx')) {
 console.log("DOCX file detected, extracting with mammoth...")
 const mammoth = require('mammoth');
 const result = await mammoth.extractRawText({ buffer });
 fileContent = result.value;
 console.log("DOCX TEXT EXTRACTED:", fileContent.slice(0, 200));
 } else if (fileName.endsWith('.pdf') || fileType?.includes('pdf')) {
 console.log("PDF file detected, extracting with pdf-parse...")
 const pdfParse = require('pdf-parse');
 const result = await pdfParse(buffer);
 fileContent = result.text;
 console.log("PDF TEXT EXTRACTED:", fileContent.slice(0, 200));
 }
 
 if (fileContent) {
 // Replace the last user message with file content
 anthropicMessages[anthropicMessages.length - 1] = {
 role: 'user',
 content: `I have uploaded a file: ${fileName}\n\nContent:\n${fileContent}\n\nBased on this ${userRole === 'CANDIDATE' ? 'resume' : 'job description'}, extract all relevant information. Then in your response:\n1. Tell the user what information you found\n2. Ask for the first piece of MISSING information (only ONE question)\n\n${message || ''}`
 };
 }
 }
 } catch (fileErr) {
 console.error("File processing error:", fileErr);
 // Fall through to normal message - already in anthropicMessages
 }
 }

 console.log("Sending to Claude... messages count:", anthropicMessages.length)

 const stream = client.messages
 .stream({
 model: "claude-sonnet-4-20250514",
 max_tokens: 1024,
 system: systemPrompt,
 messages: anthropicMessages as Anthropic.MessageParam[],
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

 console.log("AI RESPONSE COLLECTED:", aiText.slice(0, 100));

 // Check for JSON extraction
 const profileMatch = aiText.match(/<PROFILE_DATA>([\s\S]*?)<\/PROFILE_DATA>/);
 const jobMatch = aiText.match(/<JOB_DATA>([\s\S]*?)<\/JOB_DATA>/);

 if (profileMatch && userRole === "CANDIDATE") {
 try {
 const parsed = JSON.parse(profileMatch[1].trim());
 console.log("SAVING CANDIDATE PROFILE:", parsed);
 await supabaseAdmin.from("profiles").update({
 full_name: parsed.full_name,
 email: parsed.email,
 whatsapp_number: parsed.whatsapp_number,
 linkedin_url: parsed.linkedin_url,
 portfolio_url: parsed.portfolio_url
 }).eq("id", profileId);

 const { data: existingCand } = await supabaseAdmin.from("candidate_profiles").select("id").eq("profile_id", profileId).maybeSingle();
 if (existingCand) {
 await supabaseAdmin.from("candidate_profiles").update({
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
 await supabaseAdmin.from("candidate_profiles").insert({
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

 console.log("PROFILE SAVED - running matching...");
 const { matches, notifications } = await processNewMatch(profileId, "CANDIDATE");
 console.log("MATCHES FOUND:", matches.length);
 console.log("NOTIFICATIONS CREATED:", notifications);

 } catch (e) {
 console.error("Failed to parse PROFILE_DATA JSON", e);
 }
 } else if (jobMatch && userRole === "RECRUITER") {
 try {
 const parsed = JSON.parse(jobMatch[1].trim());
 console.log("SAVING JOB LISTING:", parsed);
 await supabaseAdmin.from("profiles").update({
 full_name: parsed.full_name,
 email: parsed.email,
 whatsapp_number: parsed.whatsapp_number,
 linkedin_url: parsed.linkedin_url,
 company_website: parsed.company_website
 }).eq("id", profileId);

 await supabaseAdmin.from("job_listings").insert({
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

 console.log("JOB SAVED - running matching...");
 const { matches, notifications } = await processNewMatch(profileId, "RECRUITER");
 console.log("MATCHES FOUND:", matches.length);
 console.log("NOTIFICATIONS CREATED:", notifications);
 } catch (e) {
 console.error("Failed to parse JOB_DATA JSON", e);
 }
 }

 const finalMessages = [...updatedMessages, { role: "assistant", content: aiText, timestamp: new Date().toISOString() }];
 await supabaseAdmin
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
 console.error("Claura API Error:", error);
 return NextResponse.json({ error: "Failed to process message" }, { status: 500 });
 }
}
