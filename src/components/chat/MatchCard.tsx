/* eslint-disable */
// @ts-nocheck
"use client";

import React, { useState } from "react";
import Button from "./../ui/Button";
import { motion } from "framer-motion";

export default function MatchCard({ match, onAccept, onReject, isAccepted }: any) {
 if (!match) return null;

 const isRecruiter = !!match.candidate_profile; 
 const score = Math.round(match.score * 100);

 return (
 <motion.div 
 initial={{ opacity: 0, scale: 0.98, y: 10 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 className="w-full bg-card border border-border rounded-2xl overflow-hidden shadow-[0px_2px_8px_rgba(0,0,0,0.05)] mt-4 mb-2 max-w-[600px]"
 >
 <div className="bg-accent px-5 py-3 flex items-center gap-2">
 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
 <span className="text-white font-medium text-sm tracking-wide">MATCH FOUND • {score}% COMPATIBILITY</span>
 </div>

 <div className="p-6">
 {isRecruiter ? (
 <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-6">
 <div>
 <div className="text-[11px] font-bold text-subtle uppercase tracking-wider mb-1">Candidate</div>
 <div className="text-body font-medium text-foreground">{match.candidate_profile.full_name || "Anonymous Candidate"}</div>
 </div>
 <div>
 <div className="text-[11px] font-bold text-subtle uppercase tracking-wider mb-1">Target Role</div>
 <div className="text-body text-foreground">{match.candidate_profile.job_title}</div>
 </div>
 <div>
 <div className="text-[11px] font-bold text-subtle uppercase tracking-wider mb-1">Experience</div>
 <div className="text-body text-foreground">{match.candidate_profile.years_experience} years</div>
 </div>
 <div>
 <div className="text-[11px] font-bold text-subtle uppercase tracking-wider mb-1">Expected Salary</div>
 <div className="text-body text-foreground flex items-center gap-2">
 <span className="bg-success/10 text-success px-2 py-0.5 rounded text-sm font-medium">₹{match.candidate_profile.salary_min/1000}k - {match.candidate_profile.salary_max/1000}k</span>
 </div>
 </div>
 </div>
 ) : (
 <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-6">
 <div>
 <div className="text-[11px] font-bold text-subtle uppercase tracking-wider mb-1">Company</div>
 <div className="text-body font-medium text-foreground">{match.job_listing.company_name}</div>
 </div>
 <div>
 <div className="text-[11px] font-bold text-subtle uppercase tracking-wider mb-1">Role</div>
 <div className="text-body text-foreground">{match.job_listing.job_title}</div>
 </div>
 <div>
 <div className="text-[11px] font-bold text-subtle uppercase tracking-wider mb-1">Work Setup</div>
 <div className="text-body text-foreground">{match.job_listing.work_type} • {match.job_listing.location}</div>
 </div>
 <div>
 <div className="text-[11px] font-bold text-subtle uppercase tracking-wider mb-1">Budget</div>
 <div className="text-body text-foreground flex items-center gap-2">
 <span className="bg-success/10 text-success px-2 py-0.5 rounded text-sm font-medium">Up to ₹{match.job_listing.salary_max/1000}k</span>
 </div>
 </div>
 </div>
 )}

 {isAccepted ? (
 <div className="flex flex-col gap-4">
 <div className="bg-success/5 text-success px-4 py-3 rounded-xl border border-success/20 flex flex-col gap-1 items-center justify-center text-center mb-2">
 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-1"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
 <span className="font-semibold text-sm">You are connected!</span>
 </div>
 
 <div className="bg-success/10 border border-success/20 rounded-2xl p-5 shadow-sm">
 <div className="text-xs font-bold text-success uppercase tracking-widest mb-4">Full Contact Details</div>
 
 {isRecruiter ? (
 /* Recruiter sees Candidate details */
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <div className="text-[10px] font-bold text-subtle uppercase mb-1">Candidate Name</div>
 <div className="text-sm font-semibold text-foreground">{match.candidate_profile?.profiles?.full_name || match.contactDetails?.candidate?.full_name}</div>
 </div>
 <div>
 <div className="text-[10px] font-bold text-subtle uppercase mb-1">Email Address</div>
 <a href={`mailto:${match.candidate_profile?.profiles?.email || match.contactDetails?.candidate?.email}`} className="text-sm font-medium text-accent hover:underline">{match.candidate_profile?.profiles?.email || match.contactDetails?.candidate?.email}</a>
 </div>
 <div>
 <div className="text-[10px] font-bold text-subtle uppercase mb-1">WhatsApp / Phone</div>
 <div className="text-sm font-medium text-foreground">{match.candidate_profile?.profiles?.whatsapp_number || match.contactDetails?.candidate?.whatsapp}</div>
 </div>
 <div>
 <div className="text-[10px] font-bold text-subtle uppercase mb-1">LinkedIn</div>
 <a href={match.candidate_profile?.profiles?.linkedin_url || match.contactDetails?.candidate?.linkedin} target="_blank" className="text-sm font-medium text-accent hover:underline">View Profile</a>
 </div>
 { (match.candidate_profile?.profiles?.portfolio_url || match.contactDetails?.candidate?.portfolio) && (
 <div className="col-span-2">
 <div className="text-[10px] font-bold text-subtle uppercase mb-1">Portfolio / GitHub</div>
 <a href={match.candidate_profile?.profiles?.portfolio_url || match.contactDetails?.candidate?.portfolio} target="_blank" className="text-sm font-medium text-accent hover:underline">{match.candidate_profile?.profiles?.portfolio_url || match.contactDetails?.candidate?.portfolio}</a>
 </div>
 )}
 </div>
 ) : (
 /* Candidate sees Recruiter details */
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <div className="text-[10px] font-bold text-subtle uppercase mb-1">Hiring Manager</div>
 <div className="text-sm font-semibold text-foreground">{match.job_listing?.profiles?.full_name || match.contactDetails?.recruiter?.full_name}</div>
 </div>
 <div>
 <div className="text-[10px] font-bold text-subtle uppercase mb-1">Company</div>
 <div className="text-sm font-semibold text-foreground">{match.job_listing?.company_name || match.contactDetails?.recruiter?.company}</div>
 </div>
 <div>
 <div className="text-[10px] font-bold text-subtle uppercase mb-1">Work Email</div>
 <a href={`mailto:${match.job_listing?.profiles?.email || match.contactDetails?.recruiter?.email}`} className="text-sm font-medium text-accent hover:underline">{match.job_listing?.profiles?.email || match.contactDetails?.recruiter?.email}</a>
 </div>
 <div>
 <div className="text-[10px] font-bold text-subtle uppercase mb-1">WhatsApp</div>
 <div className="text-sm font-medium text-foreground">{match.job_listing?.profiles?.whatsapp_number || match.contactDetails?.recruiter?.whatsapp}</div>
 </div>
 <div>
 <div className="text-[10px] font-bold text-subtle uppercase mb-1">LinkedIn</div>
 <a href={match.job_listing?.profiles?.linkedin_url || match.contactDetails?.recruiter?.linkedin} target="_blank" className="text-sm font-medium text-accent hover:underline">Recruiter Profile</a>
 </div>
 { (match.job_listing?.profiles?.company_website || match.contactDetails?.recruiter?.website) && (
 <div>
 <div className="text-[10px] font-bold text-subtle uppercase mb-1">Company Website</div>
 <a href={match.job_listing?.profiles?.company_website || match.contactDetails?.recruiter?.website} target="_blank" className="text-sm font-medium text-accent hover:underline">Visit Website</a>
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 ) : (
 <div className="flex items-center gap-3 w-full border-t border-border pt-4 mt-2">
 <Button variant="primary" className="flex-1 font-semibold" onClick={onAccept}>
 I'm Interested
 </Button>
 <Button variant="outline" className="flex-1 font-medium" onClick={onReject}>
 Not For Me
 </Button>
 </div>
 )}
 </div>
 </motion.div>
 );
}
