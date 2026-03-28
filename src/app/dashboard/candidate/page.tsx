/* eslint-disable */
// @ts-nocheck
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Briefcase, Users, CheckCircle, Diamond } from "@/components/ui/ClientIcons";

export default async function CandidateDashboard() {
 const { userId } = auth();
 if (!userId) redirect("/sign-in");

 const { data: profile, error: profileError } = await supabase
 .from("profiles")
 .select("*")
 .eq("clerk_user_id", userId)
 .maybeSingle();

 if (profileError || !profile || profile.role?.toUpperCase() !== "CANDIDATE") {
 redirect("/role-select");
 }

 const { data: candProfile } = await supabase
 .from("candidate_profiles")
 .select("*")
 .eq("profile_id", profile.id)
 .maybeSingle();

 // "Matches Found" = COUNT from matches WHERE candidate_id IN (SELECT id FROM candidate_profiles WHERE profile_id = current user profile id)
 const { data: matches, count: matchesCount } = await supabase
 .from("matches")
 .select("*, job_listings(*, profiles(company_website, full_name, name))", { count: 'exact' })
 .eq("candidate_id", profile.id) // This is equivalent to filtering by candidate_profiles.id if we use the right column, but candidate_id is the profile UUID in matches.
 .order("created_at", { ascending: false });

 return (
 <div className="fade-in">
 <div className="flex justify-between items-end mb-8 fade-slide-up">
 <div>
 <h1 className="text-[32px] font-extrabold italic tracking-tight text-foreground mb-1">Welcome, {profile.full_name || 'Candidate'}</h1>
 <p className="text-muted text-sm font-medium">Manage your gravity matches and opportunities.</p>
 </div>
 <div className="flex items-center gap-3">
 <span className="glass px-4 py-2 rounded-xl text-orange font-bold text-sm border border-orange/20 flex items-center gap-2">
 <Diamond size={18} weight="duotone" /> {profile.hiries_balance || 0} Hiries
 </span>
 <a href="/pricing" className="text-xs text-orange font-bold hover:underline">Need more?</a>
 </div>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
 <div className="glass p-6 rounded-[20px] border-t-4 border-t-orange relative overflow-hidden group hover:bg-white/5 transition-colors fade-slide-up" style={{ animationDelay: '50ms' }}>
 <div className="absolute top-6 right-6 p-2 bg-orange/10 rounded-xl">
 <Briefcase className="text-orange" size={24} weight="duotone" />
 </div>
 <h3 className="text-[12px] font-bold text-muted uppercase tracking-wider mb-2">Target Title</h3>
 <div className="text-[24px] font-extrabold text-foreground truncate">{candProfile?.job_title || 'Not set'}</div>
 </div>
 
 <div className="glass p-6 rounded-[20px] border-t-4 border-t-orange relative overflow-hidden group hover:bg-white/5 transition-colors fade-slide-up" style={{ animationDelay: '100ms' }}>
 <div className="absolute top-6 right-6 p-2 bg-orange/10 rounded-xl">
 <Users className="text-orange" size={24} weight="duotone" />
 </div>
 <h3 className="text-[12px] font-bold text-muted uppercase tracking-wider mb-2">Matches Found</h3>
 <div className="text-[36px] font-extrabold text-gradient mb-2">{matchesCount || 0}</div>
 </div>

 <div className="glass p-6 rounded-[20px] border-t-4 border-t-orange relative overflow-hidden group hover:bg-white/5 transition-colors fade-slide-up" style={{ animationDelay: '150ms' }}>
 <div className="absolute top-6 right-6 p-2 bg-orange/10 rounded-xl">
 <CheckCircle className="text-orange" size={24} weight="duotone" />
 </div>
 <h3 className="text-[12px] font-bold text-muted uppercase tracking-wider mb-2">Visibility</h3>
 <div className="mt-4">
 <span className={`px-3 py-1 rounded-full text-sm font-bold border ${candProfile ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
 {candProfile ? "Active" : "Incomplete"}
 </span>
 </div>
 </div>
 </div>

 <h2 className="text-xl font-bold italic tracking-tight text-foreground mb-6 fade-slide-up" style={{ animationDelay: '200ms' }}>
 Opportunities
 </h2>
 
 <div className="glass border border-white/10 rounded-2xl overflow-hidden fade-slide-up shadow-sm" style={{ animationDelay: '250ms' }}>
 {(!matches || matches.length === 0) ? (
 <div className="p-12 text-center text-muted text-body flex flex-col items-center">
 <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-4 text-border" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
 </svg>
 No matches yet. Claura is scanning the market for you.
 </div>
 ) : (
 <table className="w-full text-left border-collapse">
 <thead className="bg-white/5 text-muted text-xs uppercase tracking-wider font-bold">
 <tr>
 <th className="p-5 border-b border-white/10">Company</th>
 <th className="p-5 border-b border-white/10">Role</th>
 <th className="p-5 border-b border-white/10">Match Score</th>
 <th className="p-5 border-b border-white/10">Status</th>
 </tr>
 </thead>
 <tbody className="text-body text-foreground">
 {matches.map((match) => {
 const job = match.job_listings as unknown as { company_name: string; job_title: string };
 // If score is 0-1, multiply by 100. If it's already 0-100, use as is.
 const score = match.score <= 1 ? Math.round(match.score * 100) : Math.round(match.score);
 return (
 <tr key={match.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
 <td className="p-5 font-bold">{job?.company_name || 'Classified'}</td>
 <td className="p-5 text-muted font-medium">{job?.job_title}</td>
 <td className="p-5">
 <span className="text-orange font-bold px-2 py-1 bg-orange/10 rounded-md border border-orange/20">{score}%</span>
 </td>
 <td className="p-5">
 <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
 match.status === 'ACCEPTED' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
 match.status === 'REJECTED' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
 }`}>
 {match.status}
 </span>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 )}
 </div>
 </div>
 );
}
