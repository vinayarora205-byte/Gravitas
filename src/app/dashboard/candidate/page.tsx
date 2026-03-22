/* eslint-disable */
// @ts-nocheck
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

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
          <h1 className="text-h2 text-foreground font-semibold mb-2">Welcome, {profile.full_name || 'Candidate'}</h1>
          <p className="text-muted text-body">Manage your gravity matches and opportunities.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-4 py-2 rounded-xl bg-accent/10 text-accent font-bold text-sm border border-accent/20">
            💎 {profile.hiries_balance || 0} Hiries
          </span>
          <a href="/pricing" className="text-xs text-muted hover:text-accent underline">Need more?</a>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="fade-slide-up" style={{ animationDelay: '50ms' }}>
           <h3 className="text-subtle text-small font-medium uppercase tracking-wider mb-2">Target Title</h3>
           <div className="text-body-lg font-medium text-foreground truncate ">{candProfile?.job_title || 'Not set'}</div>
        </Card>
        <Card className="fade-slide-up" style={{ animationDelay: '100ms' }}>
           <h3 className="text-subtle text-small font-medium uppercase tracking-wider mb-2">Matches Found</h3>
           <div className="text-h2 font-semibold text-foreground">{matchesCount || 0}</div>
        </Card>
        <Card className="fade-slide-up" style={{ animationDelay: '150ms' }}>
           <h3 className="text-subtle text-small font-medium uppercase tracking-wider mb-2">Visibility</h3>
           <div className="mt-2"><Badge variant={candProfile ? "success" : "warning"}>{candProfile ? "Active" : "Incomplete"}</Badge></div>
        </Card>
      </div>

      <h2 className="text-h3 text-foreground font-medium mb-6 fade-slide-up" style={{ animationDelay: '200ms' }}>
        Opportunities
      </h2>
      
      <div className="bg-card border border-border rounded-2xl overflow-hidden fade-slide-up shadow-sm" style={{ animationDelay: '250ms' }}>
        {(!matches || matches.length === 0) ? (
           <div className="p-12 text-center text-muted text-body flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mb-4 text-border" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
             </svg>
            No matches yet. GAIA is scanning the market for you.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-black/5 dark:bg-white/5 text-subtle text-xs uppercase tracking-wider font-medium">
              <tr>
                <th className="p-4 border-b border-border">Company</th>
                <th className="p-4 border-b border-border">Role</th>
                <th className="p-4 border-b border-border">Match Score</th>
                <th className="p-4 border-b border-border">Status</th>
              </tr>
            </thead>
            <tbody className="text-body text-foreground">
              {matches.map((match) => {
                const job = match.job_listings as unknown as { company_name: string; job_title: string };
                // If score is 0-1, multiply by 100. If it's already 0-100, use as is.
                const score = match.score <= 1 ? Math.round(match.score * 100) : Math.round(match.score);
                return (
                  <tr key={match.id} className="border-b border-border hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4 font-medium">{job?.company_name || 'Classified'}</td>
                    <td className="p-4 text-muted">{job?.job_title}</td>
                    <td className="p-4">
                      <span className="text-accent font-medium">{score}%</span>
                    </td>
                    <td className="p-4">
                      <Badge variant={match.status === 'ACCEPTED' ? 'success' : match.status === 'REJECTED' ? 'error' : 'warning'}>
                        {match.status}
                      </Badge>
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
