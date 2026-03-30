"use client";

import React from "react";
import Button from "./../ui/Button";

export default function MatchCard({ match, onAccept, onReject, isAccepted }: any) {
  if (!match) return null;

  const isRecruiter = !!match.candidate_profile; 
  const score = Math.round(match.score * 100);

  return (
    <div className="w-full bg-white border border-black/10 rounded-2xl overflow-hidden shadow-sm mt-4 mb-2 max-w-[600px] fade-up">
      <div className="bg-[#FF6A2A] px-5 py-3 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
        <span className="text-white font-bold text-[10px] uppercase tracking-widest">MATCH FOUND • {score}% COMPATIBILITY</span>
      </div>

      <div className="p-6">
        {isRecruiter ? (
          <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-6">
            <div>
              <div className="text-[10px] font-bold text-dark/40 uppercase tracking-widest mb-1">Candidate</div>
              <div className="text-sm font-bold text-dark">{match.candidate_profile.full_name || "Anonymous Candidate"}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-dark/40 uppercase tracking-widest mb-1">Target Role</div>
              <div className="text-sm text-dark font-medium">{match.candidate_profile.job_title}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-dark/40 uppercase tracking-widest mb-1">Experience</div>
              <div className="text-sm text-dark font-medium">{match.candidate_profile.years_experience} years</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-dark/40 uppercase tracking-widest mb-1">Expected Salary</div>
              <div className="text-sm text-dark font-medium flex items-center gap-2">
                <span className="bg-green-500/10 text-green-600 px-2 py-0.5 rounded text-[11px] font-bold">₹{match.candidate_profile.salary_min/1000}k - {match.candidate_profile.salary_max/1000}k</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-6">
            <div>
              <div className="text-[10px] font-bold text-dark/40 uppercase tracking-widest mb-1">Company</div>
              <div className="text-sm font-bold text-dark">{match.job_listing.company_name}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-dark/40 uppercase tracking-widest mb-1">Role</div>
              <div className="text-sm text-dark font-medium">{match.job_listing.job_title}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-dark/40 uppercase tracking-widest mb-1">Work Setup</div>
              <div className="text-sm text-dark font-medium">{match.job_listing.work_type} • {match.job_listing.location}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-dark/40 uppercase tracking-widest mb-1">Budget</div>
              <div className="text-sm text-dark font-medium flex items-center gap-2">
                <span className="bg-green-500/10 text-green-600 px-2 py-0.5 rounded text-[11px] font-bold">Up to ₹{match.job_listing.salary_max/1000}k</span>
              </div>
            </div>
          </div>
        )}

        {isAccepted ? (
          <div className="flex flex-col gap-4">
            <div className="bg-green-500/5 text-green-600 px-4 py-3 rounded-xl border border-green-500/10 flex flex-col gap-1 items-center justify-center text-center mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span className="font-bold text-sm">Connection Protocols Active</span>
            </div>
            
            <div className="bg-[#F6F1EB] rounded-2xl p-5 border border-black/5">
              <div className="text-[10px] font-bold text-[#FF6A2A] uppercase tracking-widest mb-4">Transmission Channel Open</div>
              
              {isRecruiter ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-[9px] font-bold text-dark/40 uppercase mb-1">Candidate Name</div>
                    <div className="text-sm font-bold text-dark">{match.candidate_profile?.profiles?.full_name || match.contactDetails?.candidate?.full_name}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-dark/40 uppercase mb-1">Email Address</div>
                    <a href={`mailto:${match.candidate_profile?.profiles?.email || match.contactDetails?.candidate?.email}`} className="text-sm font-bold text-[#FF6A2A] hover:underline uppercase tracking-tight">{match.candidate_profile?.profiles?.email || match.contactDetails?.candidate?.email}</a>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-dark/40 uppercase mb-1">WhatsApp / Phone</div>
                    <div className="text-sm font-bold text-dark">{match.candidate_profile?.profiles?.whatsapp_number || match.contactDetails?.candidate?.whatsapp}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-dark/40 uppercase mb-1">LinkedIn</div>
                    <a href={match.candidate_profile?.profiles?.linkedin_url || match.contactDetails?.candidate?.linkedin} target="_blank" className="text-sm font-bold text-[#FF6A2A] hover:underline uppercase tracking-tight">Access Link</a>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-[9px] font-bold text-dark/40 uppercase mb-1">Hiring Manager</div>
                    <div className="text-sm font-bold text-dark">{match.job_listing?.profiles?.full_name || match.contactDetails?.recruiter?.full_name}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-dark/40 uppercase mb-1">Company</div>
                    <div className="text-sm font-bold text-dark uppercase">{match.job_listing?.company_name || match.contactDetails?.recruiter?.company}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-dark/40 uppercase mb-1">Work Email</div>
                    <a href={`mailto:${match.job_listing?.profiles?.email || match.contactDetails?.recruiter?.email}`} className="text-sm font-bold text-[#FF6A2A] hover:underline uppercase tracking-tight">{match.job_listing?.profiles?.email || match.contactDetails?.recruiter?.email}</a>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-dark/40 uppercase mb-1">WhatsApp</div>
                    <div className="text-sm font-bold text-dark">{match.job_listing?.profiles?.whatsapp_number || match.contactDetails?.recruiter?.whatsapp}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 w-full border-t border-black/5 pt-4 mt-2">
            <Button variant="primary" className="flex-1 font-bold uppercase tracking-widest text-[11px]" onClick={onAccept}>
              I&apos;m Interested
            </Button>
            <Button variant="outline" className="flex-1 font-bold uppercase tracking-widest text-[11px]" onClick={onReject}>
              Not For Me
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
