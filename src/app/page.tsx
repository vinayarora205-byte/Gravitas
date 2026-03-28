"use client"
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  ChatCircleText, FileText, Brain, Lightning, Bell, MicrophoneStage,
  Plus, X, CheckCircle, ArrowRight, CaretDown
} from '@phosphor-icons/react';
import Link from 'next/link';

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, y: 0, 
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.1 } 
  }
};
const childVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function LandingPage() {
  const router = useRouter();
  const [activeHowTab, setActiveHowTab] = useState<'recruiters'|'candidates'>('recruiters');
  const [activeFeaturesTab, setActiveFeaturesTab] = useState<'recruiters'|'candidates'>('recruiters');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main style={{ background: '#F6F1EB' }} className="min-h-screen font-sans text-dark overflow-x-hidden">
      {/* SECTION 0: NAVBAR */}
      <nav className="fixed top-0 w-full h-[72px] bg-[#F6F1EB]/90 backdrop-blur-[20px] border-b border-black/5 z-50 flex items-center justify-between px-6 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold font-serif text-lg">C</div>
          <span className="font-serif text-[20px] font-bold">Clauhire</span>
        </div>
        <div className="hidden md:flex items-center gap-8 font-sans text-[14px] font-medium text-dark/80">
          <a href="#features" className="hover:text-primary transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-primary transition-colors">How It Works</a>
          <a href="#" className="hover:text-primary transition-colors" onClick={() => setActiveHowTab('recruiters')}>For Recruiters</a>
          <a href="#" className="hover:text-primary transition-colors" onClick={() => setActiveHowTab('candidates')}>For Candidates</a>
          <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/sign-in')} className="bg-transparent border border-dark rounded-xl px-4 py-2 text-sm font-medium hover:bg-dark hover:text-white transition-colors">Sign In</button>
          <button onClick={() => router.push('/role-select')} className="bg-dark text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:scale-105 transition-transform shadow-lg">Get Started Free &rarr;</button>
        </div>
      </nav>

      {/* SECTION 1: HERO */}
      <section className="bg-light min-h-screen pt-[120px] pb-[80px] px-6 lg:px-12 flex items-center justify-center overflow-hidden">
        <div className="max-w-[1280px] w-full mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
          
          <motion.div initial="hidden" animate="visible" variants={fadeInUp} className="w-full lg:w-[55%] pt-10">
            <motion.div variants={childVariant} className="inline-block bg-dark text-white rounded-full px-4 py-2 font-sans text-[12px] font-medium mb-6">
              ✦ AI-Powered Recruitment Platform
            </motion.div>
            <motion.h1 variants={childVariant} className="font-serif text-5xl md:text-[72px] font-bold leading-[1.1] text-dark">
              Find the Perfect<br/>Talent, <span className="text-primary">Faster</span>
            </motion.h1>
            <motion.p variants={childVariant} className="font-sans text-[18px] text-[#555] mt-6 max-w-[500px]">
              Claura, our AI agent, handles everything — profile building, intelligent matching, and connecting serious candidates with top companies. Zero forms. Pure conversation.
            </motion.p>
            <motion.div variants={childVariant} className="flex flex-col sm:flex-row gap-4 mt-10">
              <button onClick={() => router.push('/role-select?role=recruiter')} className="bg-dark text-white rounded-xl px-8 py-4 font-sans text-[15px] font-medium hover:scale-[1.02] shadow-xl transition-all">Start Hiring Free &rarr;</button>
              <button onClick={() => router.push('/role-select?role=candidate')} className="bg-transparent border-[1.5px] border-dark rounded-xl px-8 py-4 font-sans text-[15px] font-medium hover:bg-dark hover:text-white transition-all">I&apos;m Looking for Jobs</button>
            </motion.div>
            
            <motion.div variants={childVariant} className="mt-10 flex flex-col gap-3">
              <div className="flex -space-x-3">
                <img src="https://ui-avatars.com/api/?name=P+S&background=FF6A2A&color=fff&size=40" className="w-10 h-10 rounded-full border-2 border-light z-50" />
                <img src="https://ui-avatars.com/api/?name=R+M&background=0F0F0F&color=fff&size=40" className="w-10 h-10 rounded-full border-2 border-light z-40" />
                <img src="https://ui-avatars.com/api/?name=S+C&background=CFE8E5&color=0F0F0F&size=40" className="w-10 h-10 rounded-full border-2 border-light z-30" />
                <img src="https://ui-avatars.com/api/?name=A+K&background=FF6A2A&color=fff&size=40" className="w-10 h-10 rounded-full border-2 border-light z-20" />
                <img src="https://ui-avatars.com/api/?name=V+R&background=0F0F0F&color=fff&size=40" className="w-10 h-10 rounded-full border-2 border-light z-10" />
              </div>
              <p className="font-sans text-[14px] font-medium text-dark/70">2,000+ professionals hired this month</p>
            </motion.div>

            <motion.div variants={childVariant} className="mt-8 flex items-center gap-6 md:gap-8">
              <div>
                <div className="font-serif text-[40px] text-primary leading-tight">2 <span className="text-xl">min</span></div>
                <div className="font-sans text-[13px] text-muted">Average match time</div>
              </div>
              <div className="w-[1px] h-12 bg-dark/10"></div>
              <div>
                <div className="font-serif text-[40px] text-primary leading-tight">94%</div>
                <div className="font-sans text-[13px] text-muted">Match accuracy rate</div>
              </div>
              <div className="w-[1px] h-12 bg-dark/10 hidden sm:block"></div>
              <div className="hidden sm:block">
                <div className="font-serif text-[40px] text-primary leading-tight">10x</div>
                <div className="font-sans text-[13px] text-muted">Faster than traditional hiring</div>
              </div>
            </motion.div>
          </motion.div>

          <div className="w-full lg:w-[45%] relative h-[500px] lg:h-[580px] mt-10 lg:mt-0">
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[380px] bg-white rounded-[24px] shadow-[0_24px_80px_rgba(0,0,0,0.12)] p-6 z-20 border border-black/5"
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-black/5">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-serif font-bold text-sm">C</div>
                <div>
                  <div className="font-serif text-[16px] font-bold text-dark leading-tight">Claura</div>
                  <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500"></div><span className="font-sans text-[12px] text-green-600 font-medium">Online</span></div>
                </div>
              </div>
              
              <div className="flex flex-col gap-4 font-sans text-[14px]">
                <div className="self-end bg-dark text-white rounded-[16px] rounded-bl-[0px] px-4 py-2.5 max-w-[85%]">Hi! I need a React developer, 3+ years exp</div>
                <div className="self-start bg-light text-dark rounded-[16px] rounded-br-[0px] px-4 py-2.5 max-w-[85%] shadow-sm">Got it! What&apos;s your monthly budget?</div>
                <div className="self-end bg-dark text-white rounded-[16px] rounded-bl-[0px] px-4 py-2.5 max-w-[85%]">₹60,000 - ₹80,000</div>
                <div className="self-start bg-light text-dark rounded-[16px] rounded-br-[0px] px-4 py-2.5 max-w-[95%] shadow-sm mb-2">
                  Found 3 perfect matches! Top match: 94% compatibility
                </div>
                
                <div className="border border-black/10 rounded-xl p-3 bg-white shadow-sm flex flex-col gap-2">
                  <div className="font-medium text-dark">Rahul K. — React Developer</div>
                  <div className="text-[12px] text-muted">94% match &middot; ₹70,000/mo &middot; Remote</div>
                  <button className="text-primary text-[13px] font-medium text-left mt-1 hover:text-orange-dark">View Match &rarr;</button>
                </div>
              </div>
              <div className="mt-4 flex gap-1">
                <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 bg-primary rounded-full"></motion.div>
                <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary rounded-full"></motion.div>
                <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary rounded-full"></motion.div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ x: 60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
              className="absolute right-0 top-[10%] bg-white shadow-xl rounded-xl p-4 border border-black/5 z-30 w-[220px]"
            >
              <div className="text-primary font-medium text-[13px] flexItems-center gap-1.5 mb-1">⚡ Match Found!</div>
              <div className="text-dark text-[12px] font-medium truncate">Rahul K. &middot; React Developer</div>
              <div className="text-green-600 text-[11px] mt-1 flex items-center gap-1"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>94% Compatibility</div>
            </motion.div>

            <motion.div 
              initial={{ x: -60, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 1, duration: 0.6, ease: "easeOut" }}
              className="absolute left-[-5%] bottom-[15%] bg-white shadow-xl rounded-xl p-4 border border-black/5 z-30 w-[200px]"
            >
              <div className="text-green-600 font-medium text-[13px] mb-1">🔓 Chat Unlocked</div>
              <div className="text-muted text-[12px]">TechCorp &amp; Priya connected</div>
            </motion.div>

            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="absolute left-[5%] top-[5%] bg-white shadow-xl rounded-xl p-4 border border-black/5 z-10 w-[160px]"
            >
              <div className="text-muted text-[12px]">Active Matches</div>
              <div className="font-serif text-[28px] text-primary leading-none mt-1">2,847</div>
              <div className="text-green-600 text-[11px] mt-1">+12% this week</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 2: MARQUEE */}
      <section className="bg-white py-10 border-y border-[#E8E3DD] overflow-hidden">
        <div className="text-center font-sans text-[13px] text-muted mb-6">Trusted by innovative teams worldwide</div>
        <div className="relative flex overflow-x-hidden group">
          <motion.div 
            animate={{ x: ["0%", "-50%"] }}
            transition={{ ease: "linear", duration: 30, repeat: Infinity }}
            className="flex whitespace-nowrap min-w-max"
          >
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex">
                {['TechVision', 'StartupHub', 'InnovateCo', 'GrowthLabs', 'FutureTech', 'ScaleUp', 'BuildFast', 'LaunchPad', 'NextGen', 'PivotAI', 'CloudBase', 'DataFlow', 'AIForge', 'TalentOps'].map((brand, j) => (
                  <div key={`${i}-${j}`} className="bg-dark text-white font-sans text-[13px] font-medium px-5 py-2.5 rounded-full mx-3">
                    {brand}
                  </div>
                ))}
              </div>
            ))}
          </motion.div>
        </div>
      </section>
      {/* SECTION 3: DASHBOARD PREVIEW */}
      <section id="features" className="bg-[#F6F1EB] py-[100px] px-6 lg:px-12 flex flex-col items-center relative overflow-hidden">
        <div className="max-w-[1280px] w-full mx-auto text-center flex flex-col items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="flex flex-col items-center">
            <div className="border border-orange text-orange font-medium text-[12px] px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider">Platform Preview</div>
            <h2 className="font-serif text-[40px] md:text-[52px] font-bold text-dark leading-tight mb-4">
              Everything You Need,<br/>In One <span className="text-primary">Dashboard</span>
            </h2>
            <p className="font-sans text-[16px] text-[#555] max-w-[600px]">
              A powerful command center for recruiters and candidates alike. 
              Manage your matches, track applications, and hire faster.
            </p>
          </motion.div>

          {/* Browser Mockup */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="mt-16 relative w-full max-w-[1000px] mx-auto z-20">
            <div className="bg-[#0F0F0F] rounded-[16px] p-2 md:p-3 shadow-[0_40px_120px_rgba(0,0,0,0.25)] relative">
              <div className="bg-[#1A1A1A] rounded-[8px] flex items-center px-4 py-3 mb-2 md:mb-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="mx-auto bg-black/40 text-white/60 font-sans text-[12px] px-6 py-1.5 rounded-md flex-1 max-w-[400px] text-center ml-4">clauhire.com/dashboard</div>
              </div>
              <div className="bg-light rounded-b-[8px] overflow-hidden relative">
                <img src="/dashboard_stats_verification_v2_3002_1774089029561.webp" alt="Dashboard Preview" className="w-full object-cover border-b border-light" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden') }} />
                {/* Fallback Mockup if Image Fails to Load */}
                <div className="hidden w-full h-[500px] bg-[#F9F9F9] flex border border-black/5">
                  <div className="w-[200px] border-r border-black/10 p-6 flex flex-col gap-4">
                    <div className="h-6 w-24 bg-black/10 rounded"></div>
                    <div className="h-8 w-full bg-primary/10 rounded mt-4"></div>
                    <div className="h-8 w-full bg-black/5 rounded"></div>
                    <div className="h-8 w-full bg-black/5 rounded"></div>
                  </div>
                  <div className="flex-1 p-8 flex flex-col gap-6">
                    <div className="h-24 w-full bg-white rounded-xl shadow-sm border border-black/5"></div>
                    <div className="h-48 w-full bg-white rounded-xl shadow-sm border border-black/5"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating feature pills */}
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute -left-4 md:-left-12 -top-6 bg-white shadow-xl rounded-xl p-3 border border-black/5 z-30 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <span className="font-sans text-[13px] font-medium text-dark">Real-time Notifications</span>
            </motion.div>
            
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute -right-4 md:-right-12 top-10 bg-white shadow-xl rounded-xl p-3 border border-black/5 z-30">
              <span className="font-sans text-[13px] font-medium text-dark">Hiries Credit System</span>
            </motion.div>

            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute -left-6 md:-left-16 bottom-16 bg-white shadow-xl rounded-xl p-3 border border-black/5 z-30">
              <span className="font-sans text-[13px] font-medium text-dark">AI Match Analytics</span>
            </motion.div>

            <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }} className="absolute -right-6 md:-right-10 -bottom-6 bg-white shadow-xl rounded-xl p-3 border border-black/5 z-30">
              <span className="font-sans text-[13px] font-medium text-dark">Direct Messaging</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 4: HOW IT WORKS */}
      <section id="how-it-works" className="bg-[linear-gradient(135deg,#0F0F0F,#1A1A1A)] py-[120px] px-6 lg:px-12 overflow-hidden text-white relative">
        <div className="max-w-[1280px] w-full mx-auto relative z-10 flex flex-col items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="flex flex-col items-center text-center">
            <div className="border border-primary text-primary font-medium text-[12px] px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider">Simple Process</div>
            <h2 className="font-serif text-[40px] md:text-[52px] font-bold leading-tight mb-8">
              From Conversation<br/>to Hire in Minutes
            </h2>
          </motion.div>

          <div className="flex bg-white/10 rounded-[10px] p-1 mb-16 relative">
            <button 
              onClick={() => setActiveHowTab('recruiters')}
              className={`relative z-10 px-8 py-3 rounded-[8px] font-sans text-[15px] font-medium transition-colors ${activeHowTab === 'recruiters' ? 'text-white' : 'text-white/60 hover:text-white'}`}
            >
              For Recruiters
            </button>
            <button 
              onClick={() => setActiveHowTab('candidates')}
              className={`relative z-10 px-8 py-3 rounded-[8px] font-sans text-[15px] font-medium transition-colors ${activeHowTab === 'candidates' ? 'text-white' : 'text-white/60 hover:text-white'}`}
            >
              For Candidates
            </button>
            <motion.div 
              layoutId="howTabIndicator" 
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-primary rounded-[8px] z-0" 
              initial={false}
              animate={{ left: activeHowTab === 'recruiters' ? '4px' : 'calc(50%)' }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          </div>

          <div className="relative w-full">
            {/* Connecting dashed line */}
            <div className="hidden lg:block absolute top-[50%] left-0 right-0 h-[2px] border-t-2 border-dashed border-primary/30 z-0"></div>
            
            <AnimatePresence mode="wait">
              {activeHowTab === 'recruiters' ? (
                <motion.div key="rectab" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                  <div className="bg-white text-dark rounded-[20px] p-8 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                    <div className="absolute -top-4 -right-4 font-serif text-[100px] font-bold text-black/5 leading-none select-none">01</div>
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-6"><ChatCircleText size={32} weight="fill" className="text-primary"/></div>
                    <h3 className="font-serif text-[22px] font-bold text-dark mb-3">Tell Claura What You Need</h3>
                    <p className="font-sans text-[15px] text-[#555] mb-6 min-h-[100px]">Describe the role in plain language. Claura asks smart questions and builds a complete job profile automatically. No forms. No boring dropdowns.</p>
                    <div className="inline-block bg-primary/10 text-primary text-[12px] font-medium px-3 py-1 rounded-full">Takes 3 minutes</div>
                  </div>
                  <div className="bg-primary text-white rounded-[20px] p-8 relative overflow-hidden shadow-xl shadow-primary/20 group hover:-translate-y-2 transition-transform duration-300">
                    <div className="absolute -top-4 -right-4 font-serif text-[100px] font-bold text-white/10 leading-none select-none">02</div>
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-6"><Lightning size={32} weight="fill" className="text-white"/></div>
                    <h3 className="font-serif text-[22px] font-bold text-white mb-3">AI Finds Perfect Matches</h3>
                    <p className="font-sans text-[15px] text-white/90 mb-6 min-h-[100px]">Our engine scans all candidates and surfaces the best matches with detailed compatibility scores in real-time.</p>
                    <div className="inline-block bg-white/20 text-white text-[12px] font-medium px-3 py-1 rounded-full">Instant results</div>
                  </div>
                  <div className="bg-white text-dark rounded-[20px] p-8 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                    <div className="absolute -top-4 -right-4 font-serif text-[100px] font-bold text-black/5 leading-none select-none">03</div>
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-6"><CheckCircle size={32} weight="fill" className="text-primary"/></div>
                    <h3 className="font-serif text-[22px] font-bold text-dark mb-3">Connect and Hire</h3>
                    <p className="font-sans text-[15px] text-[#555] mb-6 min-h-[100px]">Use Hiries to unlock direct chat with your top candidates. Only serious parties can connect. Full refund if hired.</p>
                    <div className="inline-block bg-primary/10 text-primary text-[12px] font-medium px-3 py-1 rounded-full">Risk-free connection</div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="candtab" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                  {/* Candidates Tab Content matching exactly */}
                  <div className="bg-white text-dark rounded-[20px] p-8 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                    <div className="absolute -top-4 -right-4 font-serif text-[100px] font-bold text-black/5 leading-none select-none">01</div>
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-6"><ChatCircleText size={32} weight="fill" className="text-primary"/></div>
                    <h3 className="font-serif text-[22px] font-bold text-dark mb-3">Share Your Skills with Claura</h3>
                    <p className="font-sans text-[15px] text-[#555] mb-6 min-h-[100px]">Just have a conversation. No resume needed to start. Claura extracts your full profile from your answers automatically.</p>
                    <div className="inline-block bg-primary/10 text-primary text-[12px] font-medium px-3 py-1 rounded-full">Takes 4 minutes</div>
                  </div>
                  <div className="bg-primary text-white rounded-[20px] p-8 relative overflow-hidden shadow-xl shadow-primary/20 group hover:-translate-y-2 transition-transform duration-300">
                    <div className="absolute -top-4 -right-4 font-serif text-[100px] font-bold text-white/10 leading-none select-none">02</div>
                    <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-6"><Lightning size={32} weight="fill" className="text-white"/></div>
                    <h3 className="font-serif text-[22px] font-bold text-white mb-3">Get Matched Automatically</h3>
                    <p className="font-sans text-[15px] text-white/90 mb-6 min-h-[100px]">Sit back while our AI finds roles that match your skills, salary expectations, and work preferences perfectly.</p>
                    <div className="inline-block bg-white/20 text-white text-[12px] font-medium px-3 py-1 rounded-full">Instant results</div>
                  </div>
                  <div className="bg-white text-dark rounded-[20px] p-8 relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                    <div className="absolute -top-4 -right-4 font-serif text-[100px] font-bold text-black/5 leading-none select-none">03</div>
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-6"><CheckCircle size={32} weight="fill" className="text-primary"/></div>
                    <h3 className="font-serif text-[22px] font-bold text-dark mb-3">Land Your Dream Job</h3>
                    <p className="font-sans text-[15px] text-[#555] mb-6 min-h-[100px]">Accept matches with Hiries. If you get hired, all your Hiries are refunded. Zero risk for successful hires.</p>
                    <div className="inline-block bg-primary/10 text-primary text-[12px] font-medium px-3 py-1 rounded-full">Total safety</div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* SECTION 5: FEATURES SPLIT */}
      <section className="bg-light py-[120px] px-6 lg:px-12 flex flex-col items-center overflow-hidden">
        <div className="max-w-[1280px] w-full mx-auto flex flex-col items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="flex flex-col items-center text-center">
            <div className="border border-orange text-orange font-medium text-[12px] px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider">Features</div>
            <h2 className="font-serif text-[40px] md:text-[52px] font-bold leading-tight mb-12 text-dark">
              Built for Recruiters<br/>and <span className="text-primary">Candidates</span>
            </h2>
          </motion.div>

          <div className="w-full flex justify-center mb-16 space-x-8 border-b border-black/10">
            <button 
              onClick={() => setActiveFeaturesTab('recruiters')}
              className={`pb-4 px-2 font-serif text-[24px] font-medium transition-colors relative ${activeFeaturesTab === 'recruiters' ? 'text-primary' : 'text-dark/40 hover:text-dark/60'}`}
            >
              Recruiters
              {activeFeaturesTab === 'recruiters' && <motion.div layoutId="featTabUnderline" className="absolute bottom-[-1px] left-0 right-0 h-1 bg-primary rounded-t-sm"/>}
            </button>
            <button 
              onClick={() => setActiveFeaturesTab('candidates')}
              className={`pb-4 px-2 font-serif text-[24px] font-medium transition-colors relative ${activeFeaturesTab === 'candidates' ? 'text-primary' : 'text-dark/40 hover:text-dark/60'}`}
            >
              Candidates
              {activeFeaturesTab === 'candidates' && <motion.div layoutId="featTabUnderline" className="absolute bottom-[-1px] left-0 right-0 h-1 bg-primary rounded-t-sm"/>}
            </button>
          </div>

          <div className="w-full">
            <AnimatePresence mode="wait">
              {activeFeaturesTab === 'recruiters' ? (
                <motion.div key="feat-rec" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-[#0F0F0F] text-white rounded-[24px] p-8 flex flex-col hover:-translate-y-1 transition-transform border border-black/5 shadow-sm">
                    <ChatCircleText size={32} className="text-primary mb-6"/>
                    <h3 className="font-serif text-xl font-bold mb-3">AI-Powered Job Posting</h3>
                    <p className="font-sans text-[14px] text-white/70 mb-6 flex-1">Tell Claura about your role in natural language. No job description templates. Just a conversation.</p>
                    <div className="flex items-center text-primary font-medium text-[14px] mt-auto">Learn more <ArrowRight className="ml-2" size={16}/></div>
                  </div>
                  <div className="bg-white text-dark rounded-[24px] p-8 flex flex-col hover:-translate-y-1 transition-transform border border-black/5 shadow-sm">
                    <Brain size={32} className="text-primary mb-6"/>
                    <h3 className="font-serif text-xl font-bold mb-3">Smart Candidate Matching</h3>
                    <p className="font-sans text-[14px] text-muted mb-6 flex-1">Our engine scores every candidate on skills, salary fit, and culture alignment automatically.</p>
                  </div>
                  <div className="bg-primary text-white rounded-[24px] p-8 flex flex-col hover:-translate-y-1 transition-transform border border-black/5 shadow-sm">
                    <CheckCircle size={32} className="text-white mb-6"/>
                    <h3 className="font-serif text-xl font-bold mb-3">Hiries Safety System</h3>
                    <p className="font-sans text-[14px] text-white/90 mb-6 flex-1">Only committed candidates reach you. Our credit system filters out time-wasters before they reach your inbox.</p>
                  </div>
                  <div className="bg-[#CFE8E5] text-[#0F0F0F] rounded-[24px] p-8 flex flex-col hover:-translate-y-1 transition-transform border border-black/5 shadow-sm">
                    <Bell size={32} className="text-[#0F0F0F] mb-6"/>
                    <h3 className="font-serif text-xl font-bold mb-3">Real-time Notifications</h3>
                    <p className="font-sans text-[14px] text-[#333] mb-6 flex-1">Get instant alerts when candidates match, accept, or message you — on platform and via email.</p>
                  </div>
                  <div className="bg-[#0F0F0F] text-white rounded-[24px] p-8 flex flex-col hover:-translate-y-1 transition-transform border border-black/5 shadow-sm">
                    <ChatCircleText size={32} className="text-primary mb-6"/>
                    <h3 className="font-serif text-xl font-bold mb-3">Direct Candidate Chat</h3>
                    <p className="font-sans text-[14px] text-white/70 mb-6 flex-1">When both parties commit, unlock a direct private chat. No third-party apps needed.</p>
                  </div>
                  <div className="bg-white text-dark rounded-[24px] p-8 flex flex-col hover:-translate-y-1 transition-transform border border-black/5 shadow-sm">
                    <FileText size={32} className="text-primary mb-6"/>
                    <h3 className="font-serif text-xl font-bold mb-3">Hire Analytics</h3>
                    <p className="font-sans text-[14px] text-muted mb-6 flex-1">Track your active roles, match rates, and time-to-hire. Data-driven recruitment decisions.</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="feat-cand" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Candidates Tab Grid matching instructions */}
                  <div className="bg-primary text-white rounded-[24px] p-8 flex flex-col hover:-translate-y-1 transition-transform border border-black/5 shadow-sm">
                    <ChatCircleText size={32} className="text-white mb-6"/>
                    <h3 className="font-serif text-xl font-bold mb-3">Zero-Form Profile Building</h3>
                    <p className="font-sans text-[14px] text-white/90 mb-6 flex-1">Just chat with Claura. She extracts your skills, experience, and preferences automatically.</p>
                  </div>
                  <div className="bg-[#0F0F0F] text-white rounded-[24px] p-8 flex flex-col hover:-translate-y-1 transition-transform border border-black/5 shadow-sm">
                    <FileText size={32} className="text-primary mb-6"/>
                    <h3 className="font-serif text-xl font-bold mb-3">Upload Resume or JD</h3>
                    <p className="font-sans text-[14px] text-white/70 mb-6 flex-1">Drop your resume or a job description. Claura reads it instantly and builds your complete profile.</p>
                  </div>
                  <div className="bg-white text-dark rounded-[24px] p-8 flex flex-col hover:-translate-y-1 transition-transform border border-black/5 shadow-sm">
                    <MicrophoneStage size={32} className="text-primary mb-6"/>
                    <h3 className="font-serif text-xl font-bold mb-3">Voice Input Support</h3>
                    <p className="font-sans text-[14px] text-muted mb-6 flex-1">Talk to Claura in English or Hindi. No typing needed. Just speak naturally.</p>
                  </div>
                  <div className="bg-[#CFE8E5] text-[#0F0F0F] rounded-[24px] p-8 flex flex-col hover:-translate-y-1 transition-transform border border-black/5 shadow-sm">
                    <Lightning size={32} className="text-[#0F0F0F] mb-6"/>
                    <h3 className="font-serif text-xl font-bold mb-3">Smart Job Matching</h3>
                    <p className="font-sans text-[14px] text-[#333] mb-6 flex-1">Get matched with roles that fit your salary, skills, work type, and location — all automatically.</p>
                  </div>
                  <div className="bg-white text-dark rounded-[24px] p-8 flex flex-col hover:-translate-y-1 transition-transform border border-black/5 shadow-sm">
                    <Brain size={32} className="text-primary mb-6"/>
                    <h3 className="font-serif text-xl font-bold mb-3">Salary Negotiation AI</h3>
                    <p className="font-sans text-[14px] text-muted mb-6 flex-1">Claura helps bridge salary gaps between you and recruiters. She negotiates on your behalf.</p>
                  </div>
                  <div className="bg-[#0F0F0F] text-white rounded-[24px] p-8 flex flex-col hover:-translate-y-1 transition-transform border border-black/5 shadow-sm">
                    <CheckCircle size={32} className="text-primary mb-6"/>
                    <h3 className="font-serif text-xl font-bold mb-3">Hiries Refund on Hire</h3>
                    <p className="font-sans text-[14px] text-white/70 mb-6 flex-1">If you get hired, you get all your Hiries back. Only pay for connections that go nowhere.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
      
      {/* SECTION 6: MEET CLAURA */}
      <section className="bg-white py-[120px] px-6 lg:px-12 overflow-hidden">
        <div className="max-w-[1280px] w-full mx-auto flex flex-col lg:flex-row items-center gap-16">
          
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="w-full lg:w-1/2">
            <div className="bg-white/50 backdrop-blur-[20px] rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.1)] p-6 border border-black/5 relative">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-black/5">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-serif font-bold text-lg">C</div>
                <div>
                  <div className="font-serif text-[18px] font-bold text-dark leading-tight">Claura</div>
                  <div className="font-sans text-[13px] text-muted font-medium">AI Hiring Agent</div>
                </div>
              </div>
              
              <div className="flex flex-col gap-4 font-sans text-[14px]">
                <div className="self-end bg-[#0F0F0F] text-white rounded-[16px] rounded-bl-[0px] px-4 py-2.5 max-w-[85%]">I am a video editor, 4 years exp</div>
                <div className="self-start bg-[#F6F1EB] text-dark rounded-[16px] rounded-br-[0px] px-4 py-2.5 max-w-[85%] shadow-sm">Great! What&apos;s your expected salary?</div>
                <div className="self-end bg-[#0F0F0F] text-white rounded-[16px] rounded-bl-[0px] px-4 py-2.5 max-w-[85%]">Around ₹50,000/month</div>
                <div className="self-start bg-[#F6F1EB] text-dark rounded-[16px] rounded-br-[0px] px-4 py-2.5 max-w-[85%] shadow-sm">What work type do you prefer?</div>
                <div className="self-end bg-[#0F0F0F] text-white rounded-[16px] rounded-bl-[0px] px-4 py-2.5 max-w-[85%]">Remote</div>
                <div className="self-start bg-[#F6F1EB] text-dark rounded-[16px] rounded-br-[0px] px-4 py-2.5 max-w-[95%] shadow-sm mb-2">
                  Perfect! I found a match for you!
                </div>
                
                <div className="border border-black/10 rounded-xl p-4 bg-white shadow-sm flex flex-col gap-2">
                  <div className="font-medium text-dark text-[15px]">BizEmporia — Video Editor</div>
                  <div className="text-[13px] text-muted">₹45,000-55,000/mo &middot; Remote &middot; <span className="text-green-600 font-medium">89% match</span></div>
                  <div className="text-[12px] text-[#333] mt-2 bg-light p-2 rounded-lg border border-black/5">
                    This recruiter has accepted your profile.<br/>Spend 2 Hiries to unlock chat?
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button className="flex-1 bg-primary text-white text-[13px] font-medium py-2 rounded-lg hover:bg-orange-dark transition-colors">Accept 2 Hiries</button>
                    <button className="flex-1 bg-transparent border border-black/10 text-dark text-[13px] font-medium py-2 rounded-lg hover:bg-black/5 transition-colors">Decline</button>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex gap-1">
                <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 bg-primary rounded-full"></motion.div>
                <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary rounded-full"></motion.div>
                <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary rounded-full"></motion.div>
              </div>
            </div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="w-full lg:w-1/2">
            <h2 className="font-serif text-[36px] md:text-[44px] font-bold text-dark leading-tight mb-4">
              Meet Claura,<br/>Your AI <span className="text-primary">Hiring Agent</span>
            </h2>
            <p className="font-sans text-[16px] text-muted max-w-[500px] mb-10">
              Claura doesn&apos;t just match — she understands, negotiates, and connects.
            </p>

            <div className="flex flex-col gap-6">
              {[
                { icon: <ChatCircleText size={24} weight="fill" />, title: "Natural Language", desc: "Talk normally. No forms or dropdowns ever." },
                { icon: <FileText size={24} weight="fill" />, title: "Resume Analysis", desc: "Upload a PDF or image. Claura reads it all." },
                { icon: <Brain size={24} weight="fill" />, title: "Smart Negotiation", desc: "Bridges salary gaps between both parties." },
                { icon: <Lightning size={24} weight="fill" />, title: "Real-time Matching", desc: "Matches fire the moment profiles align." },
                { icon: <Bell size={24} weight="fill" />, title: "Instant Alerts", desc: "Notifications via platform and email." },
                { icon: <MicrophoneStage size={24} weight="fill" />, title: "Voice Input", desc: "Speak in English or Hindi naturally." }
              ].map((item, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-sans text-[16px] font-bold text-dark mb-1">{item.title}</h4>
                    <p className="font-sans text-[14px] text-muted">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </section>

      {/* SECTION 7: COMPARISON TABLE */}
      <section className="bg-[linear-gradient(135deg,#0F0F0F,#1A1A1A)] py-[120px] px-6 lg:px-12 text-white overflow-hidden">
        <div className="max-w-[1280px] w-full mx-auto flex flex-col items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="flex flex-col items-center text-center">
            <div className="border border-primary text-primary font-medium text-[12px] px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider">Why Clauhire</div>
            <h2 className="font-serif text-[40px] md:text-[52px] font-bold leading-tight mb-16">
              We&apos;re Different.<br/>Here&apos;s Proof.
            </h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="w-full max-w-[900px] bg-white rounded-[20px] overflow-hidden shadow-2xl">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[700px] text-left border-collapse">
                <thead>
                  <tr className="bg-[#0A0A0A] text-white">
                    <th className="font-sans font-medium text-[15px] p-5 w-[32%] border-r border-[#222]">Feature</th>
                    <th className="font-sans font-bold text-[15px] p-5 w-[17%] text-center text-primary border-r border-[#222] relative">
                      CLAUHIRE
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary"></div>
                    </th>
                    <th className="font-sans font-medium text-[15px] p-5 w-[17%] text-center border-r border-[#222]">LinkedIn</th>
                    <th className="font-sans font-medium text-[15px] p-5 w-[17%] text-center border-r border-[#222]">Indeed</th>
                    <th className="font-sans font-medium text-[15px] p-5 w-[17%] text-center">Agency</th>
                  </tr>
                </thead>
                <tbody className="font-sans text-[14px] text-dark">
                  {[
                    ['AI Conversation', { type: 'icon', val: 'yes' }, { type: 'icon', val: 'no' }, { type: 'icon', val: 'no' }, { type: 'icon', val: 'no' }],
                    ['Auto Profile Build', { type: 'icon', val: 'yes' }, { type: 'icon', val: 'no' }, { type: 'icon', val: 'no' }, { type: 'icon', val: 'no' }],
                    ['Real-time Matching', { type: 'icon', val: 'yes' }, { type: 'icon', val: 'partial' }, { type: 'icon', val: 'partial' }, { type: 'icon', val: 'no' }],
                    ['Credit Safety', { type: 'icon', val: 'yes' }, { type: 'icon', val: 'no' }, { type: 'icon', val: 'no' }, { type: 'icon', val: 'no' }],
                    ['Direct Chat', { type: 'icon', val: 'yes' }, { type: 'icon', val: 'partial' }, { type: 'icon', val: 'no' }, { type: 'icon', val: 'yes' }],
                    ['Voice Input', { type: 'icon', val: 'yes' }, { type: 'icon', val: 'no' }, { type: 'icon', val: 'no' }, { type: 'icon', val: 'no' }],
                    ['Resume Analysis', { type: 'icon', val: 'yes' }, { type: 'icon', val: 'partial' }, { type: 'icon', val: 'partial' }, { type: 'icon', val: 'yes' }],
                    ['Time to Match', { type: 'text', val: '2 min', highlight: true }, { type: 'text', val: 'Days' }, { type: 'text', val: 'Days' }, { type: 'text', val: 'Weeks' }],
                    ['Cost', { type: 'text', val: 'Low', highlight: true }, { type: 'text', val: 'High' }, { type: 'text', val: 'Med' }, { type: 'text', val: 'V.High' }],
                    ['Hire Refund', { type: 'icon', val: 'yes' }, { type: 'icon', val: 'no' }, { type: 'icon', val: 'no' }, { type: 'icon', val: 'no' }],
                  ].map((row: any[], i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-[#FAFAFA]' : 'bg-white'}>
                      <td className="p-4 md:p-5 border-b border-[#F0F0F0] font-medium text-[#444] border-r border-[#F0F0F0]">{row[0]}</td>
                      <td className="p-4 md:p-5 border-b border-[#F0F0F0] text-center bg-primary/5 border-r border-[#F0F0F0]">
                        {row[1].type === 'icon' ? (
                          <div className="flex justify-center">
                            {row[1].val === 'yes' && <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white"><CheckCircle size={14} weight="bold"/></div>}
                            {row[1].val === 'partial' && <div className="w-5 h-5 rounded-full bg-orange-400 flex items-center justify-center text-white"><span className="text-[14px] leading-none mb-1">~</span></div>}
                            {row[1].val === 'no' && <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white"><X size={12} weight="bold"/></div>}
                          </div>
                        ) : (
                          <span className={`font-semibold ${row[1].highlight ? 'text-primary' : ''}`}>{row[1].val}</span>
                        )}
                      </td>
                      <td className="p-4 md:p-5 border-b border-[#F0F0F0] text-center border-r border-[#F0F0F0]">
                        {row[2].type === 'icon' ? (
                          <div className="flex justify-center">
                            {row[2].val === 'yes' && <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white"><CheckCircle size={14} weight="bold"/></div>}
                            {row[2].val === 'partial' && <div className="w-5 h-5 rounded-full bg-orange-400 flex items-center justify-center text-white"><span className="text-[14px] leading-none mb-1">~</span></div>}
                            {row[2].val === 'no' && <div className="w-5 h-5 rounded-full bg-[#E0E0E0] flex items-center justify-center text-white"><X size={12} weight="bold"/></div>}
                          </div>
                        ) : (
                          <span className="font-medium text-muted">{row[2].val}</span>
                        )}
                      </td>
                      <td className="p-4 md:p-5 border-b border-[#F0F0F0] text-center border-r border-[#F0F0F0]">
                        {row[3].type === 'icon' ? (
                          <div className="flex justify-center">
                            {row[3].val === 'yes' && <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white"><CheckCircle size={14} weight="bold"/></div>}
                            {row[3].val === 'partial' && <div className="w-5 h-5 rounded-full bg-orange-400 flex items-center justify-center text-white"><span className="text-[14px] leading-none mb-1">~</span></div>}
                            {row[3].val === 'no' && <div className="w-5 h-5 rounded-full bg-[#E0E0E0] flex items-center justify-center text-white"><X size={12} weight="bold"/></div>}
                          </div>
                        ) : (
                          <span className="font-medium text-muted">{row[3].val}</span>
                        )}
                      </td>
                      <td className="p-4 md:p-5 border-b border-[#F0F0F0] text-center">
                        {row[4].type === 'icon' ? (
                          <div className="flex justify-center">
                            {row[4].val === 'yes' && <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white"><CheckCircle size={14} weight="bold"/></div>}
                            {row[4].val === 'partial' && <div className="w-5 h-5 rounded-full bg-orange-400 flex items-center justify-center text-white"><span className="text-[14px] leading-none mb-1">~</span></div>}
                            {row[4].val === 'no' && <div className="w-5 h-5 rounded-full bg-[#E0E0E0] flex items-center justify-center text-white"><X size={12} weight="bold"/></div>}
                          </div>
                        ) : (
                          <span className="font-medium text-muted">{row[4].val}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 8: TESTIMONIALS */}
      <section className="bg-light py-[120px] px-6 lg:px-12 overflow-hidden">
        <div className="max-w-[1280px] w-full mx-auto flex flex-col items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="flex flex-col items-center text-center">
            <div className="border border-orange text-orange font-medium text-[12px] px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider">Success Stories</div>
            <h2 className="font-serif text-[40px] md:text-[52px] font-bold leading-tight mb-16 text-dark">
              Real People,<br/>Real <span className="text-primary">Results</span>
            </h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            <div className="bg-white rounded-[20px] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-black/5 flex flex-col relative overflow-hidden group hover:-translate-y-1 transition-transform">
              <div className="flex gap-1 mb-8">
                {[...Array(5)].map((_, i) => <div key={i} className="w-2.5 h-2.5 rounded-full bg-primary"></div>)}
              </div>
              <p className="font-serif italic text-[#333] text-[18px] leading-[1.6] mb-8 flex-1">
                &quot;Clauhire found us 3 perfect developers in just 2 days. Claura is like having a brilliant recruiter available 24/7.&quot;
              </p>
              <div className="w-10 h-[1px] bg-black/10 mb-6"></div>
              <div className="flex items-center gap-4">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=48&h=48&fit=crop&crop=face" className="w-12 h-12 rounded-full object-cover shrink-0" alt="Avatar"/>
                <div>
                  <div className="font-sans font-bold text-[15px] text-dark">Priya Sharma</div>
                  <div className="font-sans text-[13px] text-muted">HR Manager, TechVision</div>
                </div>
              </div>
            </div>

            <div className="bg-[#0F0F0F] rounded-[20px] p-8 shadow-xl flex flex-col relative overflow-hidden group hover:-translate-y-1 transition-transform">
              <div className="flex gap-1 mb-8">
                {[...Array(5)].map((_, i) => <div key={i} className="w-2.5 h-2.5 rounded-full bg-primary"></div>)}
              </div>
              <p className="font-serif italic text-white text-[18px] leading-[1.6] mb-8 flex-1">
                &quot;I just told Claura my skills and salary. Within hours I had 3 interview requests. This platform is genuinely incredible.&quot;
              </p>
              <div className="w-10 h-[1px] bg-white/20 mb-6"></div>
              <div className="flex items-center gap-4">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&crop=face" className="w-12 h-12 rounded-full object-cover shrink-0 border border-white/10" alt="Avatar"/>
                <div>
                  <div className="font-sans font-bold text-[15px] text-white">Rahul Mehta</div>
                  <div className="font-sans text-[13px] text-primary">Full Stack Developer</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[20px] p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-black/5 flex flex-col relative overflow-hidden group hover:-translate-y-1 transition-transform">
              <div className="flex gap-1 mb-8">
                {[...Array(5)].map((_, i) => <div key={i} className="w-2.5 h-2.5 rounded-full bg-primary"></div>)}
              </div>
              <p className="font-serif italic text-[#333] text-[18px] leading-[1.6] mb-8 flex-1">
                &quot;The Hiries system is pure genius. Only serious candidates reach us now. Our hire quality went up 10x overnight.&quot;
              </p>
              <div className="w-10 h-[1px] bg-black/10 mb-6"></div>
              <div className="flex items-center gap-4">
                <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=48&h=48&fit=crop&crop=face" className="w-12 h-12 rounded-full object-cover shrink-0" alt="Avatar"/>
                <div>
                  <div className="font-sans font-bold text-[15px] text-dark">Sarah Chen</div>
                  <div className="font-sans text-[13px] text-muted">Founder, StartupXYZ</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      {/* SECTION 9: FAQ */}
      <section className="bg-white py-[120px] px-6 lg:px-12 overflow-hidden border-t border-black/5">
        <div className="max-w-[800px] w-full mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp} className="text-center mb-16">
            <h2 className="font-serif text-[40px] md:text-[52px] font-bold leading-tight text-dark mb-4">
              Got Questions?
            </h2>
            <p className="font-sans text-[16px] text-muted">Everything you need to know about Clauhire.</p>
          </motion.div>

          <div className="flex flex-col gap-4">
            {[
              { q: "What are Hiries?", a: "Hiries are our platform credits. Recruiters use them to unlock direct chats with candidates who have accepted their profile. If you hire the candidate, all Hiries spent on them are refunded." },
              { q: "Do I need a resume to sign up?", a: "No! Candidates can simply chat with Claura to build their profile. However, if you have a resume, you can upload it and Claura will instantly extract your details." },
              { q: "Is Clauhire free for candidates?", a: "Yes, 100% free. Candidates never pay to find a job or accept a match on Clauhire." },
              { q: "How does the AI matching work?", a: "Claura analyzes over 50 data points including skills, salary expectations, work type preference, and location to calculate a percentage match between a candidate and a role." },
              { q: "Can I use voice to talk to Claura?", a: "Absolutely. Claura supports voice input in both English and Hindi, making profile building incredibly accessible." }
            ].map((faq, i) => (
              <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp} className="bg-[#F9F9F9] rounded-[16px] p-6 border border-black/5 hover:border-black/10 transition-colors cursor-pointer group">
                <div className="flex justify-between items-center">
                  <h3 className="font-sans font-bold text-[16px] text-dark">{faq.q}</h3>
                  <CaretDown size={20} className="text-muted group-hover:text-primary transition-colors" />
                </div>
                <p className="font-sans text-[14px] text-[#555] mt-4 leading-relaxed hidden group-hover:block transition-all">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 10: FINAL CTA */}
      <section className="bg-[linear-gradient(135deg,#FF6A2A,#FF8450)] py-[120px] px-6 lg:px-12 text-white relative overflow-hidden">
        {/* Background Graphic */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-[20%] -right-[10%] w-[500px] h-[500px] rounded-full bg-white/10 blur-[80px]"></div>
          <div className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] rounded-full bg-[#0F0F0F]/10 blur-[100px]"></div>
        </div>

        <div className="max-w-[800px] w-full mx-auto text-center relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeInUp}>
            <h2 className="font-serif text-[48px] md:text-[64px] font-bold leading-tight mb-6">
              Ready to Change How You Hire?
            </h2>
            <p className="font-sans text-[18px] text-white/90 mb-12 max-w-[600px] mx-auto">
              Join thousands of recruiters and candidates who have already switched to AI-driven, zero-BS hiring.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/sign-up" className="w-full sm:w-auto bg-dark text-white font-sans text-[16px] font-bold px-10 py-5 rounded-[12px] hover:bg-black transition-all shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:-translate-y-1 text-center border-2 border-transparent">
                Start Hiring Now
              </Link>
              <Link href="/sign-up" className="w-full sm:w-auto bg-white text-primary font-sans text-[16px] font-bold px-10 py-5 rounded-[12px] hover:bg-[#F9F9F9] transition-all shadow-[0_10px_30px_rgba(255,255,255,0.2)] hover:-translate-y-1 text-center border-2 border-white">
                Find Your Dream Job
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 11: FOOTER */}
      <footer className="bg-[#0F0F0F] pt-20 pb-10 px-6 lg:px-12 text-white">
        <div className="max-w-[1280px] w-full mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <Link href="/" className="font-serif font-bold text-[28px] tracking-tight text-white flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg leading-none">C</span>
                </div>
                Clauhire
              </Link>
              <p className="font-sans text-[15px] text-white/60 max-w-[300px] mb-8">
                The AI-powered recruitment platform that values your time. No forms, no spam, just matches.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                  <div className="font-bold text-lg">𝕏</div>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors">
                  <div className="font-bold text-lg">in</div>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-sans font-bold text-[16px] mb-6">Product</h4>
              <ul className="flex flex-col gap-4 font-sans text-[15px] text-white/60">
                <li><a href="#how-it-works" className="hover:text-primary transition-colors">How it Works</a></li>
                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Wall of Love</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-sans font-bold text-[16px] mb-6">Legal</h4>
              <ul className="flex flex-col gap-4 font-sans text-[15px] text-white/60">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-sans text-[14px] text-white/40">
              &copy; {new Date().getFullYear()} Clauhire. All rights reserved.
            </p>
            <div className="flex items-center gap-2 font-sans text-[14px] text-white/40">
              Made with <div className="text-red-500">♥</div> in India
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
