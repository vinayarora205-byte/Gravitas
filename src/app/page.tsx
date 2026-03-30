"use client";

import { useState } from 'react';
import Link from 'next/link';
import {
  ChatCircleText, FileText, Brain, Lightning, Bell, MicrophoneStage,
  CheckCircle, ArrowRight, CaretDown, CaretUp, X
} from '@phosphor-icons/react';

const faqData = [
  { q: "What are Hiries?", a: "Hiries are our platform credits. Recruiters use them to unlock direct chats with candidates who have accepted their profile. If you hire the candidate, all Hiries spent on them are refunded." },
  { q: "Do I need a resume to sign up?", a: "No! Candidates can simply chat with Claura to build their profile. However, if you have a resume, you can upload it and Claura will instantly extract your details." },
  { q: "Is Clauhire free for candidates?", a: "Yes, 100% free. Candidates never pay to find a job or accept a match on Clauhire." },
  { q: "How does the AI matching work?", a: "Claura analyzes over 50 data points including skills, salary expectations, work type preference, and location to calculate a percentage match between a candidate and a role." },
  { q: "Can I use voice to talk to Claura?", a: "Absolutely. Claura supports voice input in both English and Hindi, making profile building incredibly accessible." },
];

const comparisonRows = [
  ['AI Conversation',   true,  false, false, false],
  ['Auto Profile Build', true, false, false, false],
  ['Real-time Matching', true, 'partial', 'partial', false],
  ['Credit Safety',     true,  false, false, false],
  ['Direct Chat',       true,  'partial', false, true],
  ['Voice Input',       true,  false, false, false],
  ['Resume Analysis',   true,  'partial', 'partial', true],
  ['Time to Match',     '2 min', 'Days', 'Days', 'Weeks'],
  ['Cost',              'Low', 'High', 'Med', 'V.High'],
  ['Hire Refund',       true,  false, false, false],
];

type CellValue = boolean | 'partial' | string;

function Cell({ val, highlight }: { val: CellValue; highlight?: boolean }) {
  if (val === true)      return <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mx-auto"><CheckCircle size={12} weight="bold" color="white" /></div>;
  if (val === 'partial') return <div className="w-5 h-5 rounded-full bg-orange-400 flex items-center justify-center mx-auto text-white text-xs font-bold">~</div>;
  if (val === false)     return <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center mx-auto"><X size={10} weight="bold" color="white" /></div>;
  return <span className={`font-semibold text-sm ${highlight ? 'text-[#FF6A2A]' : 'text-gray-500'}`}>{val}</span>;
}

export default function LandingPage() {
  const [activeHowTab, setActiveHowTab] = useState<'recruiters' | 'candidates'>('recruiters');
  const [activeFeatTab, setActiveFeatTab] = useState<'recruiters' | 'candidates'>('recruiters');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <main style={{ background: '#F6F1EB' }} className="min-h-screen font-sans text-[#0F0F0F] overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 w-full h-[68px] bg-[#F6F1EB]/90 backdrop-blur-[20px] border-b border-black/5 z-50 flex items-center justify-between px-5 lg:px-12">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#FF6A2A] flex items-center justify-center text-white font-bold font-serif text-lg">C</div>
          <span className="font-serif text-[19px] font-bold italic">Clauhire</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-7 text-[13px] font-medium text-[#0F0F0F]/70">
          <button onClick={() => scrollTo('features')}   className="hover:text-[#FF6A2A] transition-colors">Features</button>
          <button onClick={() => scrollTo('how-it-works')} className="hover:text-[#FF6A2A] transition-colors">How It Works</button>
          <button onClick={() => { setActiveHowTab('recruiters'); scrollTo('how-it-works'); }} className="hover:text-[#FF6A2A] transition-colors">For Recruiters</button>
          <button onClick={() => { setActiveHowTab('candidates'); scrollTo('how-it-works'); }} className="hover:text-[#FF6A2A] transition-colors">For Candidates</button>
          <button onClick={() => scrollTo('faq')} className="hover:text-[#FF6A2A] transition-colors">FAQ</button>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="hidden sm:block border border-[#0F0F0F] rounded-xl px-4 py-2 text-sm font-medium hover:bg-[#0F0F0F] hover:text-white transition-colors">Sign In</Link>
          <Link href="/sign-up" className="bg-[#0F0F0F] text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:scale-105 transition-transform shadow-lg">Get Started Free →</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="min-h-screen pt-[110px] pb-20 px-5 lg:px-12 flex items-center justify-center">
        <div className="max-w-[1280px] w-full mx-auto flex flex-col lg:flex-row items-center gap-14">

          {/* Left */}
          <div className="w-full lg:w-[55%]">
            <div className="inline-block bg-[#0F0F0F] text-white rounded-full px-4 py-2 text-[12px] font-medium mb-6 fade-up-1">
              ✦ AI-Powered Recruitment Platform
            </div>
            <h1 className="font-serif text-5xl md:text-[68px] font-bold leading-[1.1] text-[#0F0F0F] mb-6 fade-up-2">
              Find the Perfect<br/>Talent, <span style={{ color: '#FF6A2A' }}>Faster</span>
            </h1>
            <p className="text-[17px] text-[#555] mb-10 max-w-[500px] leading-relaxed fade-up-3">
              Claura, our AI agent, handles everything — profile building, intelligent matching, and connecting serious candidates with top companies. Zero forms. Pure conversation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-10 fade-up-4">
              <Link href="/sign-up?role=recruiter" className="bg-[#0F0F0F] text-white rounded-xl px-8 py-4 text-[15px] font-medium text-center hover:-translate-y-0.5 hover:shadow-xl transition-all">
                Start Hiring Free →
              </Link>
              <Link href="/sign-up?role=candidate" className="border-2 border-[#0F0F0F] rounded-xl px-8 py-4 text-[15px] font-medium text-center hover:bg-[#0F0F0F] hover:text-white transition-all">
                I&apos;m Looking for Jobs
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 fade-in" style={{ animationDelay: '0.5s', opacity: 0 }}>
              <div className="flex -space-x-2.5">
                {['PS','RM','SC','AK','VR'].map((init, i) => (
                  <div key={i} className="w-9 h-9 rounded-full border-2 border-[#F6F1EB] flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: i % 2 === 0 ? '#FF6A2A' : '#0F0F0F', zIndex: 5 - i }}>
                    {init}
                  </div>
                ))}
              </div>
              <p className="text-[13px] font-medium text-[#0F0F0F]/60">2,000+ professionals hired this month</p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 mt-8 fade-in" style={{ animationDelay: '0.6s', opacity: 0 }}>
              <div>
                <div className="font-serif text-[36px] leading-tight" style={{ color: '#FF6A2A' }}>2 <span className="text-xl">min</span></div>
                <div className="text-[12px] text-[#666]">Avg. match time</div>
              </div>
              <div className="w-px h-10 bg-black/10" />
              <div>
                <div className="font-serif text-[36px] leading-tight" style={{ color: '#FF6A2A' }}>94%</div>
                <div className="text-[12px] text-[#666]">Match accuracy</div>
              </div>
              <div className="w-px h-10 bg-black/10 hidden sm:block" />
              <div className="hidden sm:block">
                <div className="font-serif text-[36px] leading-tight" style={{ color: '#FF6A2A' }}>10x</div>
                <div className="text-[12px] text-[#666]">Faster than traditional</div>
              </div>
            </div>
          </div>

          {/* Right — Chat Mockup */}
          <div className="w-full lg:w-[45%] flex justify-center">
            <div className="w-[340px] sm:w-[380px] bg-white rounded-[24px] shadow-[0_24px_80px_rgba(0,0,0,0.12)] p-6 border border-black/5 fade-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-black/5">
                <div className="w-8 h-8 rounded-full bg-[#FF6A2A] flex items-center justify-center text-white font-serif font-bold text-sm">C</div>
                <div>
                  <div className="font-serif text-[15px] font-bold leading-tight">Claura</div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500" /><span className="text-[11px] text-green-600 font-medium">Online</span></div>
                </div>
              </div>
              <div className="flex flex-col gap-3.5 text-[13px]">
                <div className="self-end bg-[#0F0F0F] text-white rounded-[16px] rounded-bl-[4px] px-4 py-2.5 max-w-[85%]">Hi! I need a React developer, 3+ years exp</div>
                <div className="self-start bg-[#F6F1EB] text-[#0F0F0F] rounded-[16px] rounded-br-[4px] px-4 py-2.5 max-w-[85%]">Got it! What&apos;s your monthly budget?</div>
                <div className="self-end bg-[#0F0F0F] text-white rounded-[16px] rounded-bl-[4px] px-4 py-2.5 max-w-[85%]">₹60,000 – ₹80,000</div>
                <div className="self-start bg-[#F6F1EB] text-[#0F0F0F] rounded-[16px] rounded-br-[4px] px-4 py-2.5 max-w-[95%]">Found 3 perfect matches! Top: 94% compatibility ✨</div>
                <div className="border border-black/10 rounded-xl p-3 bg-white">
                  <div className="font-medium text-[#0F0F0F] text-[13px]">Rahul K. — React Developer</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">94% match · ₹70,000/mo · Remote</div>
                  <button className="text-[#FF6A2A] text-[12px] font-medium mt-2 hover:underline">View Match →</button>
                </div>
              </div>
              <div className="flex gap-1 mt-4">
                <span className="dot-bounce" /><span className="dot-bounce" /><span className="dot-bounce" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── MARQUEE ── */}
      <section className="bg-white py-9 border-y border-[#E8E3DD] overflow-hidden">
        <div className="text-center text-[12px] text-gray-400 mb-5 font-medium">Trusted by innovative teams worldwide</div>
        <div className="relative overflow-hidden">
          <style>{`
            @keyframes marqueeScroll {
              0%   { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .marquee-inner { animation: marqueeScroll 30s linear infinite; display: flex; width: max-content; }
          `}</style>
          <div className="marquee-inner">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex">
                {['TechVision','StartupHub','InnovateCo','GrowthLabs','FutureTech','ScaleUp','BuildFast','LaunchPad','NextGen','PivotAI','CloudBase','DataFlow','AIForge','TalentOps'].map((b, j) => (
                  <div key={j} className="bg-[#0F0F0F] text-white text-[12px] font-medium px-5 py-2 rounded-full mx-2.5">{b}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ── */}
      <section id="features" className="py-[100px] px-5 lg:px-12">
        <div className="max-w-[1280px] w-full mx-auto text-center">
          <div className="border border-[#FF6A2A] text-[#FF6A2A] text-[11px] font-medium px-4 py-1.5 rounded-full mb-5 uppercase tracking-wider inline-block">Platform Preview</div>
          <h2 className="font-serif text-[40px] md:text-[52px] font-bold text-[#0F0F0F] leading-tight mb-4">
            Everything You Need,<br/>In One <span style={{ color: '#FF6A2A' }}>Dashboard</span>
          </h2>
          <p className="text-[15px] text-[#555] max-w-[580px] mx-auto mb-14">
            A powerful command center for recruiters and candidates alike. Manage matches, track applications, and hire faster.
          </p>

          {/* Browser mockup */}
          <div className="relative max-w-[1000px] mx-auto">
            <div className="bg-[#0F0F0F] rounded-[16px] p-2 md:p-3 shadow-[0_40px_120px_rgba(0,0,0,0.2)]">
              <div className="bg-[#1A1A1A] rounded-t-[8px] flex items-center px-4 py-2.5 mb-2">
                <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500"/><div className="w-3 h-3 rounded-full bg-yellow-500"/><div className="w-3 h-3 rounded-full bg-green-500"/></div>
                <div className="mx-auto bg-black/40 text-white/50 text-[11px] px-6 py-1 rounded max-w-[300px] text-center">clauhire.com/dashboard</div>
              </div>
              <div className="bg-[#F6F1EB] rounded-b-[8px] overflow-hidden h-[400px] flex items-center justify-center">
                <div className="flex w-full h-full">
                  <div className="w-[200px] bg-white border-r border-[#E8E3DD] p-5 flex flex-col gap-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-7 h-7 rounded-full bg-[#FF6A2A] flex items-center justify-center text-white text-sm font-bold">C</div>
                      <span className="font-serif font-bold text-sm italic">Clauhire</span>
                    </div>
                    {['Overview','Claura Chat','Opportunities','Messages'].map((item, i) => (
                      <div key={i} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-medium ${i === 0 ? 'bg-[#FFF3EE] text-[#FF6A2A] font-semibold' : 'text-gray-400'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-[#FF6A2A]' : 'bg-gray-300'}`} />{item}
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 p-6 flex flex-col gap-5">
                    <div className="grid grid-cols-3 gap-4">
                      {[{l:'Active Roles',v:'12'},{l:'Total Matches',v:'48'},{l:'Success Rate',v:'94%'}].map((s,i)=>(
                        <div key={i} className="bg-white rounded-xl p-4 border border-[#E8E3DD]">
                          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-1">{s.l}</div>
                          <div className="font-serif text-xl font-bold text-[#FF6A2A]">{s.v}</div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-white rounded-xl border border-[#E8E3DD] p-4 flex-1">
                      <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-3">Recent Matches</div>
                      {[{j:'React Developer',c:'TechCorp',s:'94%'},{j:'Product Manager',c:'StartupHub',s:'88%'},{j:'UI Designer',c:'InnovateCo',s:'82%'}].map((r,i)=>(
                        <div key={i} className="flex items-center justify-between py-2 border-b border-[#F0EDE8] last:border-0 text-[11px]">
                          <span className="font-medium text-[#0F0F0F]">{r.j}</span>
                          <span className="text-gray-400">{r.c}</span>
                          <span className="font-bold text-[#FF6A2A]">{r.s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="bg-[#0F0F0F] py-[110px] px-5 lg:px-12 text-white">
        <div className="max-w-[1280px] w-full mx-auto">
          <div className="text-center mb-14">
            <div className="border border-[#FF6A2A] text-[#FF6A2A] text-[11px] font-medium px-4 py-1.5 rounded-full mb-5 uppercase tracking-wider inline-block">Simple Process</div>
            <h2 className="font-serif text-[40px] md:text-[52px] font-bold leading-tight">From Conversation<br/>to Hire in Minutes</h2>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-12">
            <div className="flex bg-white/10 rounded-[10px] p-1">
              {(['recruiters','candidates'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveHowTab(tab)}
                  className={`px-8 py-3 rounded-[8px] text-[14px] font-medium transition-colors ${activeHowTab === tab ? 'bg-[#FF6A2A] text-white' : 'text-white/60 hover:text-white'}`}>
                  For {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {(activeHowTab === 'recruiters' ? [
              { n: '01', icon: <ChatCircleText size={32} weight="fill" />, title: 'Tell Claura What You Need', desc: 'Describe the role in plain language. Claura asks smart questions and builds a complete job profile automatically. No forms, no dropdowns.', tag: 'Takes 3 minutes' },
              { n: '02', icon: <Lightning size={32} weight="fill" />, title: 'AI Finds Perfect Matches', desc: 'Our engine scans all candidates and surfaces the best matches with detailed compatibility scores in real-time.', tag: 'Instant results', featured: true },
              { n: '03', icon: <CheckCircle size={32} weight="fill" />, title: 'Connect and Hire', desc: 'Use Hiries to unlock direct chat with your top candidates. Only serious parties connect. Full refund if hired.', tag: 'Risk-free connection' },
            ] : [
              { n: '01', icon: <ChatCircleText size={32} weight="fill" />, title: 'Share Your Skills with Claura', desc: 'Just have a conversation. No resume needed. Claura extracts your full profile from your answers automatically.', tag: 'Takes 4 minutes' },
              { n: '02', icon: <Lightning size={32} weight="fill" />, title: 'Get Matched Automatically', desc: 'Sit back while our AI finds roles matching your skills, salary expectations, and work preferences perfectly.', tag: 'Instant results', featured: true },
              { n: '03', icon: <CheckCircle size={32} weight="fill" />, title: 'Land Your Dream Job', desc: 'Accept matches with Hiries. If you get hired, all your Hiries are refunded. Zero risk for successful hires.', tag: 'Total safety' },
            ]).map((step, i) => (
              <div key={i} className={`rounded-[20px] p-8 relative overflow-hidden card-hover ${step.featured ? 'bg-[#FF6A2A] shadow-xl shadow-[#FF6A2A]/20' : 'bg-white text-[#0F0F0F]'}`}>
                <div className="absolute -top-4 -right-4 font-serif text-[80px] font-bold leading-none select-none opacity-10">{step.n}</div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 ${step.featured ? 'bg-white/20 text-white' : 'bg-[#FFF3EE] text-[#FF6A2A]'}`}>{step.icon}</div>
                <h3 className={`font-serif text-[20px] font-bold mb-3 ${step.featured ? 'text-white' : 'text-[#0F0F0F]'}`}>{step.title}</h3>
                <p className={`text-[14px] mb-6 leading-relaxed ${step.featured ? 'text-white/90' : 'text-[#555]'}`}>{step.desc}</p>
                <div className={`inline-block text-[11px] font-medium px-3 py-1 rounded-full ${step.featured ? 'bg-white/20 text-white' : 'bg-[#FFF3EE] text-[#FF6A2A]'}`}>{step.tag}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features-tabs" className="py-[110px] px-5 lg:px-12 bg-[#F6F1EB]">
        <div className="max-w-[1280px] w-full mx-auto">
          <div className="text-center mb-14">
            <div className="border border-[#FF6A2A] text-[#FF6A2A] text-[11px] font-medium px-4 py-1.5 rounded-full mb-5 uppercase tracking-wider inline-block">Features</div>
            <h2 className="font-serif text-[40px] md:text-[52px] font-bold leading-tight text-[#0F0F0F]">
              Built for Recruiters<br/>and <span style={{ color: '#FF6A2A' }}>Candidates</span>
            </h2>
          </div>

          {/* Tab Bar */}
          <div className="flex justify-center gap-8 border-b border-black/10 mb-12">
            {(['recruiters','candidates'] as const).map(tab => (
              <button key={tab} onClick={() => setActiveFeatTab(tab)}
                className={`pb-4 px-2 font-serif text-[22px] font-medium transition-colors relative ${activeFeatTab === tab ? 'text-[#FF6A2A]' : 'text-[#0F0F0F]/40 hover:text-[#0F0F0F]/70'}`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeFeatTab === tab && <div className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-[#FF6A2A] rounded-t" />}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(activeFeatTab === 'recruiters' ? [
              { bg: '#0F0F0F', color: 'white', icon: <ChatCircleText size={28} color="#FF6A2A" />, title: 'AI-Powered Job Posting', desc: 'Tell Claura about your role in natural language. No job description templates.' },
              { bg: 'white',   color: '#0F0F0F', icon: <Brain size={28} color="#FF6A2A" />, title: 'Smart Candidate Matching', desc: 'Our engine scores every candidate on skills, salary fit, and culture alignment.' },
              { bg: '#FF6A2A', color: 'white', icon: <CheckCircle size={28} color="white" />, title: 'Hiries Safety System', desc: 'Only committed candidates reach you. Credits filter out time-wasters.' },
              { bg: '#CFE8E5', color: '#0F0F0F', icon: <Bell size={28} color="#0F0F0F" />, title: 'Real-time Notifications', desc: 'Instant alerts when candidates match, accept, or message you — on platform and email.' },
              { bg: '#0F0F0F', color: 'white', icon: <ChatCircleText size={28} color="#FF6A2A" />, title: 'Direct Candidate Chat', desc: 'When both parties commit, unlock a direct private chat. No third-party apps.' },
              { bg: 'white',   color: '#0F0F0F', icon: <FileText size={28} color="#FF6A2A" />, title: 'Hire Analytics', desc: 'Track your active roles, match rates, and time-to-hire with data-driven insights.' },
            ] : [
              { bg: '#FF6A2A', color: 'white', icon: <ChatCircleText size={28} color="white" />, title: 'Zero-Form Profile Building', desc: 'Just chat with Claura. She extracts your skills and preferences automatically.' },
              { bg: '#0F0F0F', color: 'white', icon: <FileText size={28} color="#FF6A2A" />, title: 'Upload Resume or JD', desc: 'Drop your resume or job description. Claura reads it instantly.' },
              { bg: 'white',   color: '#0F0F0F', icon: <MicrophoneStage size={28} color="#FF6A2A" />, title: 'Voice Input Support', desc: 'Talk to Claura in English or Hindi. No typing needed.' },
              { bg: '#CFE8E5', color: '#0F0F0F', icon: <Lightning size={28} color="#0F0F0F" />, title: 'Smart Job Matching', desc: 'Matched with roles fitting your salary, skills, work type, and location.' },
              { bg: 'white',   color: '#0F0F0F', icon: <Brain size={28} color="#FF6A2A" />, title: 'Salary Negotiation AI', desc: 'Claura helps bridge salary gaps between you and recruiters.' },
              { bg: '#0F0F0F', color: 'white', icon: <CheckCircle size={28} color="#FF6A2A" />, title: 'Hiries Refund on Hire', desc: 'Get hired, get all your Hiries back. Only pay for unsuccessful connections.' },
            ]).map((f, i) => (
              <div key={i} className="rounded-[22px] p-7 flex flex-col card-hover" style={{ background: f.bg, color: f.color }}>
                <div className="mb-5">{f.icon}</div>
                <h3 className="font-serif text-[18px] font-bold mb-2">{f.title}</h3>
                <p className="text-[13px] leading-relaxed opacity-80 flex-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MEET CLAURA ── */}
      <section className="bg-white py-[110px] px-5 lg:px-12">
        <div className="max-w-[1280px] w-full mx-auto flex flex-col lg:flex-row items-center gap-16">
          {/* Chat Preview */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-6 border border-black/5">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-black/5">
                <div className="w-9 h-9 rounded-full bg-[#FF6A2A] flex items-center justify-center text-white font-serif font-bold">C</div>
                <div><div className="font-serif text-[16px] font-bold">Claura</div><div className="text-[12px] text-gray-400">AI Hiring Agent</div></div>
              </div>
              <div className="flex flex-col gap-3 text-[13px]">
                <div className="self-end bg-[#0F0F0F] text-white rounded-[16px] rounded-bl-[4px] px-4 py-2.5 max-w-[85%]">I am a video editor, 4 years exp</div>
                <div className="self-start bg-[#F6F1EB] text-[#0F0F0F] rounded-[16px] rounded-br-[4px] px-4 py-2.5 max-w-[85%]">Great! What&apos;s your expected salary?</div>
                <div className="self-end bg-[#0F0F0F] text-white rounded-[16px] rounded-bl-[4px] px-4 py-2.5 max-w-[85%]">Around ₹50,000/month</div>
                <div className="self-start bg-[#F6F1EB] text-[#0F0F0F] rounded-[16px] rounded-br-[4px] px-4 py-2.5 max-w-[95%]">Perfect! I found a match for you!</div>
                <div className="border border-black/10 rounded-xl p-4 bg-white mt-1">
                  <div className="font-medium text-[14px]">BizEmporia — Video Editor</div>
                  <div className="text-[12px] text-gray-400 mt-0.5">₹45,000–55,000/mo · Remote · <span className="text-green-600 font-medium">89% match</span></div>
                  <div className="flex gap-2 mt-3">
                    <button className="flex-1 bg-[#FF6A2A] text-white text-[12px] font-medium py-2 rounded-lg hover:opacity-90 transition-opacity">Accept 2 Hiries</button>
                    <button className="flex-1 border border-black/10 text-[#0F0F0F] text-[12px] font-medium py-2 rounded-lg hover:bg-gray-50 transition-colors">Decline</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Text */}
          <div className="w-full lg:w-1/2">
            <h2 className="font-serif text-[36px] md:text-[44px] font-bold text-[#0F0F0F] leading-tight mb-4">
              Meet Claura,<br/>Your AI <span style={{ color: '#FF6A2A' }}>Hiring Agent</span>
            </h2>
            <p className="text-[16px] text-gray-500 max-w-[500px] mb-10">Claura doesn&apos;t just match — she understands, negotiates, and connects.</p>
            <div className="flex flex-col gap-5">
              {[
                { icon: <ChatCircleText size={22} weight="fill" />, title: 'Natural Language', desc: 'Talk normally. No forms or dropdowns ever.' },
                { icon: <FileText size={22} weight="fill" />, title: 'Resume Analysis', desc: 'Upload a PDF or image. Claura reads it all.' },
                { icon: <Brain size={22} weight="fill" />, title: 'Smart Negotiation', desc: 'Bridges salary gaps between both parties.' },
                { icon: <Lightning size={22} weight="fill" />, title: 'Real-time Matching', desc: 'Matches fire the moment profiles align.' },
                { icon: <Bell size={22} weight="fill" />, title: 'Instant Alerts', desc: 'Notifications via platform and email.' },
                { icon: <MicrophoneStage size={22} weight="fill" />, title: 'Voice Input', desc: 'Speak in English or Hindi naturally.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-[#FF6A2A]" style={{ background: '#FFF3EE' }}>{item.icon}</div>
                  <div><h4 className="font-sans text-[15px] font-bold text-[#0F0F0F] mb-0.5">{item.title}</h4><p className="text-[13px] text-gray-500">{item.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ── */}
      <section className="bg-[#0F0F0F] py-[110px] px-5 lg:px-12 text-white">
        <div className="max-w-[1280px] w-full mx-auto">
          <div className="text-center mb-14">
            <div className="border border-[#FF6A2A] text-[#FF6A2A] text-[11px] font-medium px-4 py-1.5 rounded-full mb-5 uppercase tracking-wider inline-block">Why Clauhire</div>
            <h2 className="font-serif text-[40px] md:text-[52px] font-bold leading-tight">We&apos;re Different.<br/>Here&apos;s Proof.</h2>
          </div>
          <div className="max-w-[860px] mx-auto bg-white rounded-[20px] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left border-collapse">
                <thead>
                  <tr className="bg-[#0A0A0A] text-white">
                    <th className="p-4 text-[13px] font-medium border-r border-[#222] w-[32%]">Feature</th>
                    <th className="p-4 text-[13px] font-bold text-center border-r border-[#222] text-[#FF6A2A] relative">
                      CLAUHIRE<div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#FF6A2A]" />
                    </th>
                    <th className="p-4 text-[13px] font-medium text-center border-r border-[#222]">LinkedIn</th>
                    <th className="p-4 text-[13px] font-medium text-center border-r border-[#222]">Indeed</th>
                    <th className="p-4 text-[13px] font-medium text-center">Agency</th>
                  </tr>
                </thead>
                <tbody className="text-[13px] text-[#0F0F0F]">
                  {comparisonRows.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-[#FAFAFA]' : 'bg-white'}>
                      <td className="p-4 border-b border-[#F0F0F0] font-medium text-[#444] border-r border-[#F0F0F0]">{row[0] as string}</td>
                      <td className="p-4 border-b border-[#F0F0F0] text-center bg-[#FF6A2A]/5 border-r border-[#F0F0F0]"><Cell val={row[1] as CellValue} highlight /></td>
                      <td className="p-4 border-b border-[#F0F0F0] text-center border-r border-[#F0F0F0]"><Cell val={row[2] as CellValue} /></td>
                      <td className="p-4 border-b border-[#F0F0F0] text-center border-r border-[#F0F0F0]"><Cell val={row[3] as CellValue} /></td>
                      <td className="p-4 border-b border-[#F0F0F0] text-center"><Cell val={row[4] as CellValue} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-[110px] px-5 lg:px-12 bg-[#F6F1EB]">
        <div className="max-w-[1280px] w-full mx-auto">
          <div className="text-center mb-14">
            <div className="border border-[#FF6A2A] text-[#FF6A2A] text-[11px] font-medium px-4 py-1.5 rounded-full mb-5 uppercase tracking-wider inline-block">Success Stories</div>
            <h2 className="font-serif text-[40px] md:text-[52px] font-bold leading-tight text-[#0F0F0F]">Real People,<br/>Real <span style={{ color: '#FF6A2A' }}>Results</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {[
              { quote: '"Clauhire found us 3 perfect developers in just 2 days. Claura is like having a brilliant recruiter available 24/7."', name: 'Priya Sharma', role: 'HR Manager, TechVision', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=48&h=48&fit=crop', dark: false },
              { quote: '"I just told Claura my skills and salary. Within hours I had 3 interview requests. This platform is genuinely incredible."', name: 'Rahul Mehta', role: 'Full Stack Developer', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop', dark: true },
              { quote: '"The Hiries system is pure genius. Only serious candidates reach us now. Our hire quality went up 10x overnight."', name: 'Sarah Chen', role: 'Founder, StartupXYZ', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=48&h=48&fit=crop', dark: false },
            ].map((t, i) => (
              <div key={i} className={`rounded-[20px] p-8 card-hover ${t.dark ? 'bg-[#0F0F0F] text-white' : 'bg-white border border-[#E8E3DD]'}`}>
                <div className="flex gap-1.5 mb-7">{[...Array(5)].map((_,j)=><div key={j} className="w-2 h-2 rounded-full bg-[#FF6A2A]"/>)}</div>
                <p className={`font-serif italic text-[17px] leading-[1.6] mb-7 ${t.dark ? 'text-white' : 'text-[#333]'}`}>{t.quote}</p>
                <div className={`w-8 h-px mb-5 ${t.dark ? 'bg-white/20' : 'bg-black/10'}`} />
                <div className="flex items-center gap-3">
                  <img src={t.img} className="w-11 h-11 rounded-full object-cover" alt={t.name} />
                  <div>
                    <div className={`font-bold text-[14px] ${t.dark ? 'text-white' : 'text-[#0F0F0F]'}`}>{t.name}</div>
                    <div className={`text-[12px] ${t.dark ? 'text-[#FF6A2A]' : 'text-gray-400'}`}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-[110px] px-5 lg:px-12 bg-white border-t border-[#E8E3DD]">
        <div className="max-w-[760px] w-full mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-serif text-[40px] md:text-[52px] font-bold leading-tight text-[#0F0F0F] mb-3">Got Questions?</h2>
            <p className="text-[15px] text-gray-400">Everything you need to know about Clauhire.</p>
          </div>
          <div className="flex flex-col gap-3">
            {faqData.map((faq, i) => (
              <div key={i} className="bg-[#F9F9F9] rounded-[14px] border border-[#E8E3DD] overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex justify-between items-center px-6 py-5 text-left hover:bg-[#F0EDE8] transition-colors"
                >
                  <h3 className="font-sans font-bold text-[15px] text-[#0F0F0F] pr-4">{faq.q}</h3>
                  {openFaq === i ? <CaretUp size={18} color="#FF6A2A" weight="bold" /> : <CaretDown size={18} className="text-gray-400" weight="bold" />}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5">
                    <p className="text-[14px] text-[#555] leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-[110px] px-5 lg:px-12 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #FF6A2A, #FF8450)' }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-white/10 blur-[80px]" />
          <div className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-black/10 blur-[100px]" />
        </div>
        <div className="max-w-[760px] w-full mx-auto text-center relative z-10">
          <h2 className="font-serif text-[44px] md:text-[60px] font-bold leading-tight mb-5">Ready to Change How You Hire?</h2>
          <p className="text-[17px] text-white/90 mb-12 max-w-[560px] mx-auto">Join thousands who have already switched to AI-driven, zero-BS hiring.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up" className="w-full sm:w-auto bg-[#0F0F0F] text-white font-bold text-[15px] px-10 py-4 rounded-[12px] hover:-translate-y-0.5 hover:shadow-2xl transition-all text-center">
              Start Hiring Now
            </Link>
            <Link href="/sign-up" className="w-full sm:w-auto bg-white text-[#FF6A2A] font-bold text-[15px] px-10 py-4 rounded-[12px] hover:-translate-y-0.5 hover:shadow-2xl transition-all text-center">
              Find Your Dream Job
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#0F0F0F] pt-16 pb-10 px-5 lg:px-12 text-white">
        <div className="max-w-[1280px] w-full mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 bg-[#FF6A2A] rounded-lg flex items-center justify-center text-white font-bold font-serif">C</div>
                <span className="font-serif font-bold text-[22px] italic">Clauhire</span>
              </div>
              <p className="text-[14px] text-white/50 max-w-[280px] mb-7">The AI-powered recruitment platform that values your time. No forms, no spam, just matches.</p>
              <div className="flex gap-3">
                <a href="#" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors font-bold text-sm">𝕏</a>
                <a href="#" className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors font-bold text-sm">in</a>
              </div>
            </div>
            <div>
              <h4 className="font-sans font-bold text-[14px] mb-5">Product</h4>
              <ul className="flex flex-col gap-3.5 text-[14px] text-white/50">
                <li><button onClick={() => scrollTo('how-it-works')} className="hover:text-[#FF6A2A] transition-colors">How it Works</button></li>
                <li><button onClick={() => scrollTo('features')} className="hover:text-[#FF6A2A] transition-colors">Features</button></li>
                <li><Link href="/pricing" className="hover:text-[#FF6A2A] transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-sans font-bold text-[14px] mb-5">Legal</h4>
              <ul className="flex flex-col gap-3.5 text-[14px] text-white/50">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-7 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-[13px] text-white/30">© {new Date().getFullYear()} Clauhire. All rights reserved.</p>
            <div className="flex items-center gap-1.5 text-[13px] text-white/30">Made with <span className="text-red-400">♥</span> in India</div>
          </div>
        </div>
      </footer>
    </main>
  );
}
