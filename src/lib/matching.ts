/* eslint-disable */
// @ts-nocheck
import { supabase } from "./supabase";
import Anthropic from '@anthropic-ai/sdk';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// JOB TITLE SYNONYMS MAP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
const JOB_TITLE_SYNONYMS: Record<string, string[]> = {
  // Business Development
  'bde': ['business development', 'bd executive', 
    'business dev', 'bdm', 'bd manager',
    'business development executive',
    'business development manager',
    'sales executive', 'sales manager',
    'account executive', 'growth executive'],
  'business development': ['bde', 'bdm', 'bd',
    'sales', 'account executive', 'growth'],
  
  // Sales
  'sales': ['bde', 'business development', 'bdm',
    'account executive', 'sales rep', 
    'sales executive', 'inside sales',
    'outbound sales', 'sales manager'],
  
  // Marketing
  'marketing': ['digital marketing', 'growth',
    'performance marketing', 'brand marketing',
    'content marketing', 'seo', 'social media'],
  'digital marketing': ['marketing', 'seo', 
    'sem', 'ppc', 'social media marketing',
    'performance marketing', 'growth marketing'],
  
  // Development
  'developer': ['engineer', 'programmer', 
    'software engineer', 'dev', 'coder'],
  'react': ['reactjs', 'react.js', 'react developer',
    'frontend', 'front-end', 'ui developer'],
  'node': ['nodejs', 'node.js', 'backend',
    'back-end', 'server side'],
  'fullstack': ['full stack', 'full-stack', 
    'mern', 'mean', 'frontend backend'],
  
  // Design
  'designer': ['ui designer', 'ux designer', 
    'ui/ux', 'graphic designer', 'visual designer'],
  'ui ux': ['user experience', 'user interface',
    'product designer', 'ux designer'],
  
  // Content
  'content': ['writer', 'copywriter', 'content writer',
    'content creator', 'blogger', 'editor'],
  'video editor': ['video editing', 'videographer',
    'video producer', 'motion graphics',
    'video content creator'],
  
  // Operations
  'operations': ['ops', 'operations manager',
    'process manager', 'business operations'],
  
  // HR
  'hr': ['human resources', 'recruiter', 
    'talent acquisition', 'people ops'],
  
  // Finance
  'accountant': ['accounts', 'finance', 
    'bookkeeper', 'ca', 'chartered accountant'],
    
  // GHL / Automation
  'ghl': ['gohighlevel', 'go high level', 
    'highlevel', 'automation', 'crm'],
  'automation': ['ghl', 'gohighlevel', 
    'workflow automation', 'crm automation',
    'zapier', 'make', 'n8n'],
    
  // AI
  'ai': ['artificial intelligence', 'machine learning',
    'ml', 'deep learning', 'llm', 'nlp',
    'ai engineer', 'ai specialist'],
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SKILL SYNONYMS MAP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
const SKILL_SYNONYMS: Record<string, string[]> = {
  'lead generation': ['lead gen', 'leads', 
    'prospecting', 'outbound', 'cold calling',
    'inbound leads', 'demand generation'],
  'cold calling': ['outbound calling', 'cold calls',
    'phone sales', 'telemarketing', 'outbound'],
  'closing': ['deal closing', 'sales closing',
    'closing deals', 'sales', 'negotiation'],
  'crm': ['customer relationship', 'salesforce',
    'hubspot', 'zoho', 'pipedrive', 'ghl',
    'gohighlevel'],
  'communication': ['verbal communication', 
    'written communication', 'presentation',
    'client communication'],
  'management': ['team management', 'project management',
    'people management', 'leadership'],
  'excel': ['spreadsheet', 'google sheets', 
    'ms excel', 'data analysis'],
  'javascript': ['js', 'es6', 'typescript', 'ts'],
  'python': ['django', 'flask', 'fastapi'],
  'react': ['reactjs', 'react.js', 'next.js', 'nextjs'],
  'node': ['nodejs', 'node.js', 'express'],
  'sql': ['mysql', 'postgresql', 'database', 'queries'],
  'seo': ['search engine optimization', 'sem', 
    'google search', 'keywords', 'serp'],
  'social media': ['instagram', 'facebook', 
    'linkedin', 'twitter', 'content creation'],
  'photoshop': ['adobe photoshop', 'adobe', 
    'graphic design', 'image editing'],
  'figma': ['ui design', 'prototyping', 
    'wireframing', 'design tools'],
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WORK TYPE COMPATIBILITY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
function workTypeCompatible(
  jobType: string, 
  candidateType: string
): boolean {
  const j = (jobType || '').toLowerCase().trim()
  const c = (candidateType || '').toLowerCase().trim()
  
  // Exact match
  if (j === c) return true
  
  // Flexible/Any matches everything
  if (c.includes('flexible') || c.includes('any') ||
      c.includes('open') || c === '') return true
  if (j.includes('any') || j.includes('flexible') ||
      j === '') return true
  
  // Hybrid is compatible with remote and onsite
  if (j === 'hybrid') return true
  if (c === 'hybrid') return true
  
  // Remote compatible checks
  if (j.includes('remote') && c.includes('remote')) 
    return true
  if (j.includes('onsite') && c.includes('onsite')) 
    return true
  if (j.includes('on-site') && c.includes('onsite')) 
    return true
    
  return false
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AI TITLE SCORING FALLBACK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function aiTitleMatch(
  jobTitle: string,
  candidateTitle: string
): Promise<number> {
  try {
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    })
    
    // Fallback to claude-3-5-sonnet-20241022 as there is no 20250514 version
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: `Rate the similarity between these 
two job titles from 0 to 100.
Only respond with a number.

Job title 1: "${jobTitle}"
Job title 2: "${candidateTitle}"

Consider:
- BDE = Business Development Executive = Sales Executive
- Developer = Engineer = Programmer
- Same role different words = high score
- Related roles = medium score
- Different fields = low score

Respond with only a number 0-100.`
      }]
    })
    
    // @ts-ignore
    const score = parseInt(response.content[0].text.trim())
    return isNaN(score) ? 0 : Math.min(score, 100)
  } catch (err) {
    console.error("AI title match error:", err)
    return 0
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TITLE MATCHING FUNCTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function titleMatchScore(
  jobTitle: string, 
  candidateTitle: string
): Promise<number> {
  if (!jobTitle || !candidateTitle) return 0
  
  const j = jobTitle.toLowerCase().trim()
  const c = candidateTitle.toLowerCase().trim()
  
  // Exact match
  if (j === c) return 100
  
  // One contains the other
  if (j.includes(c) || c.includes(j)) return 85
  
  // Check synonyms for job title
  for (const [key, synonyms] of Object.entries(
    JOB_TITLE_SYNONYMS
  )) {
    const allVariants = [key, ...synonyms]
    const jMatches = allVariants.some(v => j.includes(v))
    const cMatches = allVariants.some(v => c.includes(v))
    if (jMatches && cMatches) return 80
  }
  
  // Word overlap check
  const jWords = j.split(/\s+/).filter(w => w.length > 2)
  const cWords = c.split(/\s+/).filter(w => w.length > 2)
  const commonWords = jWords.filter(w => 
    cWords.some(cw => cw.includes(w) || w.includes(cw))
  )
  
  if (commonWords.length > 0) {
    const overlapRatio = commonWords.length / 
      Math.max(jWords.length, cWords.length)
    if (overlapRatio >= 0.5) return 70
    if (overlapRatio >= 0.3) return 50
    return 30
  }
  
  // Check if same industry/domain keywords exist
  const industryKeywords = [
    'sales', 'marketing', 'tech', 'finance',
    'hr', 'design', 'content', 'operations',
    'development', 'engineering', 'data'
  ]
  for (const keyword of industryKeywords) {
    if (j.includes(keyword) && c.includes(keyword)) 
      return 40
  }
  
  // Use AI Fallback if deterministic matches didn't work
  return await aiTitleMatch(jobTitle, candidateTitle)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SKILLS MATCHING FUNCTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
function skillsMatchScore(
  requiredSkills: string[],
  candidateSkills: string[]
): number {
  if (!requiredSkills?.length || 
      !candidateSkills?.length) return 50
  
  const required = requiredSkills.map(s => 
    s.toLowerCase().trim())
  const candidate = candidateSkills.map(s => 
    s.toLowerCase().trim())
  
  let matchedCount = 0
  
  for (const reqSkill of required) {
    let matched = false
    
    // Direct match
    if (candidate.some(cs => 
      cs.includes(reqSkill) || reqSkill.includes(cs)
    )) {
      matched = true
    }
    
    // Synonym match
    if (!matched) {
      for (const [key, synonyms] of Object.entries(
        SKILL_SYNONYMS
      )) {
        const allVariants = [key, ...synonyms]
        const reqIsVariant = allVariants.some(v => 
          reqSkill.includes(v) || v.includes(reqSkill))
        
        if (reqIsVariant) {
          const candHasVariant = candidate.some(cs =>
            allVariants.some(v => 
              cs.includes(v) || v.includes(cs))
          )
          if (candHasVariant) {
            matched = true
            break
          }
        }
      }
    }
    
    // Word-level match
    if (!matched) {
      const reqWords = reqSkill.split(/\s+/)
        .filter(w => w.length > 3)
      const candHasWord = candidate.some(cs =>
        reqWords.some(w => cs.includes(w))
      )
      if (candHasWord) matched = true
    }
    
    if (matched) matchedCount++
  }
  
  const matchRatio = matchedCount / required.length
  
  // Score based on ratio
  if (matchRatio >= 0.8) return 100
  if (matchRatio >= 0.6) return 80
  if (matchRatio >= 0.4) return 60
  if (matchRatio >= 0.2) return 40
  if (matchRatio > 0) return 20
  return 0
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPERIENCE MATCHING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
function experienceMatchScore(
  requiredYears: number,
  candidateYears: number
): number {
  if (!requiredYears || !candidateYears) return 70
  
  // Candidate has MORE than required = perfect
  if (candidateYears >= requiredYears) return 100
  
  // Candidate is within 1 year less = good
  if (requiredYears - candidateYears <= 1) return 80
  
  // Within 2 years = acceptable
  if (requiredYears - candidateYears <= 2) return 60
  
  // More than 2 years short = poor
  return 20
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SALARY MATCHING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
function salaryMatchScore(
  jobMin: number, jobMax: number,
  candMin: number, candMax: number
): number {
  if (!jobMin && !jobMax) return 70
  if (!candMin && !candMax) return 70
  
  const jMin = jobMin || 0
  const jMax = jobMax || jobMin * 1.5 || 0
  const cMin = candMin || 0
  const cMax = candMax || candMin * 1.3 || 0
  
  // Perfect overlap
  if (cMin <= jMax && cMax >= jMin) return 100
  
  // Candidate expects less than job offers = great
  if (cMax < jMin && jMin - cMax <= 5000) return 80
  
  // Candidate expects slightly more (within 20%)
  const gap = cMin - jMax
  const tolerance = jMax * 0.2
  if (gap > 0 && gap <= tolerance) return 70
  
  // Within 30% gap
  if (gap > 0 && gap <= jMax * 0.3) return 50
  
  // Large gap
  return 20
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LOCATION MATCHING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
function locationMatchScore(
  jobLocation: string,
  candidateLocation: string,
  jobWorkType: string,
  candidateWorkType: string
): number {
  // If remote/flexible - location doesn't matter
  const jType = (jobWorkType || '').toLowerCase()
  const cType = (candidateWorkType || '').toLowerCase()
  
  if (jType.includes('remote') || 
      cType.includes('remote') ||
      cType.includes('flexible') ||
      cType.includes('any')) return 100
  
  if (!jobLocation || !candidateLocation) return 70
  
  const j = jobLocation.toLowerCase().trim()
  const c = candidateLocation.toLowerCase().trim()
  
  if (j === c) return 100
  if (j.includes(c) || c.includes(j)) return 90
  
  // Same country/region keywords
  const indiaKeywords = ['india', 'ist', 'indian',
    'delhi', 'mumbai', 'bangalore', 'hyderabad',
    'chennai', 'pune', 'kolkata', 'noida', 
    'gurgaon', 'remote india']
  
  const jInIndia = indiaKeywords.some(k => j.includes(k))
  const cInIndia = indiaKeywords.some(k => c.includes(k))
  
  if (jInIndia && cInIndia) return 75
  
  return 30
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN SCORE CALCULATOR
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function calculateMatchScore(
  job: any,
  candidate: any
): Promise<number> {
  console.log("=== CALCULATING MATCH ===")
  console.log("Job:", job.job_title, "| Candidate:", 
              candidate.job_title)
  
  // Title score (30% weight)
  const titleScore = await titleMatchScore(
    job.job_title, 
    candidate.job_title
  )
  
  // Skills score (30% weight)
  const skillsScore = skillsMatchScore(
    job.required_skills || [],
    candidate.skills || []
  )
  
  // Experience score (15% weight)
  const expScore = experienceMatchScore(
    job.min_experience || 0,
    candidate.experience_years || 0
  )
  
  // Salary score (15% weight)
  const salaryScore = salaryMatchScore(
    Number(job.salary_min) || 0,
    Number(job.salary_max) || 0,
    Number(candidate.salary_min) || 0,
    Number(candidate.salary_max) || 0
  )
  
  // Work type score (5% weight)
  const workScore = workTypeCompatible(
    job.work_type || '',
    candidate.work_type || ''
  ) ? 100 : 30
  
  // Location score (5% weight)
  const locationScore = locationMatchScore(
    job.location || '',
    candidate.location || '',
    job.work_type || '',
    candidate.work_type || ''
  )
  
  // Weighted total
  const total = Math.round(
    (titleScore * 0.30) +
    (skillsScore * 0.30) +
    (expScore * 0.15) +
    (salaryScore * 0.15) +
    (workScore * 0.05) +
    (locationScore * 0.05)
  )
  
  console.log(`Title:${titleScore} Skills:${skillsScore} Exp:${expScore} Salary:${salaryScore} Work:${workScore} Location:${locationScore}`)
  console.log(`TOTAL SCORE: ${total}`)
  
  return Math.min(total, 100)
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN MATCHING FUNCTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━
export async function runMatchingForProfile(
  profileId: string,
  role: 'CANDIDATE' | 'RECRUITER'
) {
  const THRESHOLD = 45 // Match if score >= 45
  
  console.log("=== MATCHING START ===")
  console.log("Profile:", profileId, "Role:", role)
  
  if (role === 'CANDIDATE') {
    const { data: candidate } = await supabase
      .from('candidate_profiles')
      .select('*, profiles(id, clerk_user_id, full_name, email, hiries_balance)')
      .eq('profile_id', profileId)
      .single()
    
    if (!candidate) {
      console.log("Candidate not found")
      return []
    }
    
    const { data: jobs } = await supabase
      .from('job_listings')
      .select('*, profiles(id, clerk_user_id, full_name, email)')
      .eq('is_active', true)
    
    console.log("Total active jobs:", jobs?.length || 0)
    
    const matches = []
    
    for (const job of jobs || []) {
      const score = await calculateMatchScore(job, candidate)
      
      if (score >= THRESHOLD) {
        console.log(`MATCH: ${job.job_title} = ${score}%`)
        
        // Check if match already exists
        const { data: existing } = await supabase
          .from('matches')
          .select('id')
          .eq('candidate_id', candidate.profile_id)
          .eq('job_id', job.id)
          .single()
        
        let match = existing;
        if (existing) {
           const { data: updatedMatch, error: updateError } = await supabase
           .from("matches")
           .update({ score: score, status: "PENDING" })
           .eq("id", existing.id)
           .select();
           if (updateError) console.error("[Matching] Update Error:", updateError);
           match = updatedMatch?.[0];
        } else {
          // Save match
          const { data: insertedMatch } = await supabase
            .from('matches')
            .insert({
              candidate_id: candidate.profile_id,
              job_id: job.id,
              score: score,
              status: 'PENDING'
            })
            .select()
            .single()
          match = insertedMatch;
        }
          
        if (match) {
          // Notify candidate
          const candProfile = Array.isArray(candidate.profiles) ? candidate.profiles[0] : candidate.profiles
          const jobProfile = Array.isArray(job.profiles) ? job.profiles[0] : job.profiles
          
          await supabase.from('notifications').insert([
            {
              user_id: candProfile?.id,
              title: '⚡ New Job Match!',
              message: `${job.company_name} is hiring ${job.job_title}. Score: ${score}%`,
              type: 'MATCH',
              match_id: match.id,
              is_read: false
            },
            {
              user_id: jobProfile?.id,
              title: '⚡ New Candidate Match!',
              message: `${candidate.job_title} specialist matched. Score: ${score}%`,
              type: 'MATCH',
              match_id: match.id,
              is_read: false
            }
          ])
          
          await sendMatchEmails(job, candidate, score);
          matches.push({ ...match, score })
        }
      }
    }
    
    console.log("Total matches found:", matches.length)
    return matches
    
  } else {
    // RECRUITER role - find candidates for this job
    const { data: job } = await supabase
      .from('job_listings')
      .select('*, profiles(id, clerk_user_id, full_name, email)')
      .eq('id', profileId)
      .single()
    
    if (!job) {
      console.log("Job not found")
      return []
    }
    
    const { data: candidates } = await supabase
      .from('candidate_profiles')
      .select('*, profiles(id, clerk_user_id, full_name, email)')
    
    console.log("Total candidates:", candidates?.length || 0)
    
    const matches = []
    
    for (const candidate of candidates || []) {
      const score = await calculateMatchScore(job, candidate)
      
      if (score >= THRESHOLD) {
        console.log(`MATCH: ${candidate.job_title} = ${score}%`)
        
        // Check if exists
        const { data: existing } = await supabase
          .from('matches')
          .select('id')
          .eq('candidate_id', candidate.profile_id)
          .eq('job_id', job.id)
          .single()
        
        let match = existing;
        if (existing) {
           const { data: updatedMatch, error: updateError } = await supabase
           .from("matches")
           .update({ score: score, status: "PENDING" })
           .eq("id", existing.id)
           .select();
           if (updateError) console.error("[Matching] Update Error:", updateError);
           match = updatedMatch?.[0];
        } else {
          const { data: insertedMatch } = await supabase
            .from('matches')
            .insert({
              candidate_id: candidate.profile_id,
              job_id: job.id,
              score: score,
              status: 'PENDING'
            })
            .select()
            .single()
          match = insertedMatch;
        }

        if (match) {
          const candProfile = Array.isArray(candidate.profiles) ? candidate.profiles[0] : candidate.profiles
          const jobProfile = Array.isArray(job.profiles) ? job.profiles[0] : job.profiles
          
          await supabase.from('notifications').insert([
            {
              user_id: candProfile?.id,
              title: '⚡ New Job Match!',
              message: `${job.company_name} is hiring ${job.job_title}. Score: ${score}%`,
              type: 'MATCH',
              match_id: match.id,
              is_read: false
            },
            {
              user_id: jobProfile?.id,
              title: '⚡ New Candidate Match!',
              message: `${candidate.job_title} specialist matched. Score: ${score}%`,
              type: 'MATCH',
              match_id: match.id,
              is_read: false
            }
          ])
          
          await sendMatchEmails(job, candidate, score);
          matches.push({ ...match, score })
        }
      }
    }
    
    console.log("Total matches found:", matches.length)
    return matches
  }
}
