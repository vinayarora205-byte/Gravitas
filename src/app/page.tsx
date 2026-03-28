/* eslint-disable */
// @ts-nocheck
"use client"

import React, { useState, useEffect } from 'react';
import { motion, useAnimation, useInView, AnimatePresence } from 'framer-motion';
import { 
  RocketLaunch, ChatCircle, Lightning, Star, Handshake, Brain, MagicWand,
  Trophy, ArrowRight, CheckCircle, Bell, Diamond, Microphone, FileText,
  Users, ChartBar, Lock, Globe, Sun, Moon, Plus, Minus, ArrowsClockwise
} from '@phosphor-icons/react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { fadeUp, staggerChildren, scaleIn, float } from '@/lib/animations';

export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<'recruiters' | 'candidates'>('recruiters');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* BACKGROUND GRADIENTS */}
      <div className={`fixed inset-0 z-[-1] transition-colors duration-500 ${theme === 'dark' ? 'bg-[linear-gradient(135deg,#0F0F1A,#1A1A2E,#1F0F0A)]' : 'bg-[linear-gradient(135deg,#FFF5F2,#FAFAFA,#FFF0E8)]'}`} />
      
      {/* FLOATING ORBS */}
      <motion.div animate={{ y: [0, -30, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#FF6B3D] blur-[80px] opacity-20 pointer-events-none" />
      <motion.div animate={{ y: [0, 40, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-[#FFD166] blur-[60px] opacity-15 pointer-events-none" />
      <motion.div animate={{ y: [0, -20, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} className="absolute top-[40%] left-[40%] w-[300px] h-[300px] rounded-full bg-[#FF8C5A] blur-[100px] opacity-10 pointer-events-none" />

      {/* NAVBAR */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'glass py-3 border-b border-white/10' : 'py-5 bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="text-2xl font-extrabold italic text-gradient tracking-tight">
            Clauhire
          </Link>
          <div className="hidden md:flex items-center gap-8 font-medium text-sm">
            <a href="#features" className="hover:text-orange transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-orange transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-orange transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-orange transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full glass hover:bg-orange/10 transition-colors">
              {theme === 'dark' ? <Sun size={20} weight="duotone" className="text-gold" /> : <Moon size={20} weight="duotone" className="text-orange" />}
            </button>
            <Link href="/sign-in" className="hidden sm:block px-5 py-2 font-semibold text-sm rounded-full border border-orange text-orange hover:bg-orange/10 transition-colors">
              Sign In
            </Link>
            <Link href="/role-select" className="px-5 py-2 font-semibold text-sm rounded-full bg-orange text-white hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,107,61,0.4)]">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex items-center pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
          
          {/* LEFT SIDE */}
          <motion.div variants={staggerChildren} initial="initial" animate="animate" className="flex flex-col items-start gap-6">
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[20px] text-[13px] font-semibold text-orange border border-orange/40 bg-[linear-gradient(135deg,rgba(255,107,61,0.1),rgba(255,209,102,0.1))]">
              <RocketLaunch size={16} weight="duotone" />
              AI-Powered Recruitment
            </motion.span>
            
            <motion.h1 variants={fadeUp} className="text-[50px] sm:text-[72px] font-extrabold italic leading-[1.1] tracking-tight">
              Hire Smarter,<br/>
              <span className="text-gradient">Grow Faster</span>
            </motion.h1>
            
            <motion.p variants={fadeUp} className="text-[18px] sm:text-[20px] text-muted max-w-[500px] leading-relaxed">
              Claura, our AI agent handles everything — from sourcing to matching to connecting. Zero forms. Pure conversation.
            </motion.p>
            
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4 mt-4">
              <Link href="/role-select?role=recruiter" className="flex items-center gap-2 bg-orange text-white px-8 py-4 rounded-full font-semibold hover:scale-105 transition-transform shadow-[0_4px_24px_rgba(255,107,61,0.5)]">
                Start Hiring Free <ArrowRight weight="bold" />
              </Link>
              <Link href="/role-select?role=candidate" className="px-8 py-4 rounded-full font-semibold glass border border-white/20 hover:bg-white/5 transition-colors">
                Find Jobs
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="flex items-center gap-4 mt-8 pt-6 border-t border-white/10 w-full max-w-[500px]">
              <div className="flex -space-x-3">
                {[1,2,3,4,5].map(i => (
                  <img key={i} src={`https://ui-avatars.com/api/?name=User+${i}&background=FF6B3D&color=fff&rounded=true`} alt="User" className="w-10 h-10 rounded-full border-2 border-background" />
                ))}
              </div>
              <p className="text-sm font-medium text-muted">Trusted by <span className="text-foreground font-bold">2,000+</span> professionals</p>
            </motion.div>

            <motion.div variants={fadeUp} className="grid grid-cols-3 gap-6 w-full max-w-[500px] mt-4">
              <div>
                <p className="text-2xl font-bold text-gradient">2 min</p>
                <p className="text-xs text-muted uppercase tracking-wider font-semibold">Avg Match Time</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gradient">94%</p>
                <p className="text-xs text-muted uppercase tracking-wider font-semibold">Match Accuracy</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gradient">10x</p>
                <p className="text-xs text-muted uppercase tracking-wider font-semibold">Faster Hiring</p>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT SIDE */}
          <motion.div variants={float} initial="initial" animate="animate" className="relative hidden md:flex items-center justify-center">
            <div className="glass rounded-[24px] p-6 w-[400px] shadow-2xl relative z-10 border border-white/20">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[linear-gradient(135deg,#FF6B3D,#FF8C5A)] flex items-center justify-center text-white font-bold text-lg">C</div>
                  <div>
                    <h3 className="font-bold text-[16px]">Claura</h3>
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/><span className="text-xs text-muted">Online</span></div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 font-sans text-sm">
                <div className="flex justify-end">
                  <div className="bg-[linear-gradient(135deg,#FF6B3D,#FF8C5A)] text-white px-4 py-3 rounded-2xl rounded-br-sm max-w-[85%] shadow-md">
                    I need a React developer, 3 years exp
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className={`glass px-4 py-3 rounded-2xl rounded-bl-sm max-w-[85%] text-foreground shadow-sm ${theme === 'dark' ? 'bg-white/5' : 'bg-white/60'}`}>
                    Got it! What&apos;s your budget range?
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-[linear-gradient(135deg,#FF6B3D,#FF8C5A)] text-white px-4 py-3 rounded-2xl rounded-br-sm max-w-[85%] shadow-md">
                    ₹60,000 - ₹80,000/month
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className={`glass px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1 shadow-sm ${theme === 'dark' ? 'bg-white/5' : 'bg-white/60'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-orange animate-[bounceCustom_600ms_infinite]" style={{animationDelay: '0ms'}}/>
                    <span className="w-1.5 h-1.5 rounded-full bg-orange animate-[bounceCustom_600ms_infinite]" style={{animationDelay: '200ms'}}/>
                    <span className="w-1.5 h-1.5 rounded-full bg-orange animate-[bounceCustom_600ms_infinite]" style={{animationDelay: '400ms'}}/>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Pills */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1, duration: 0.6 }} className="absolute -right-8 top-12 glass px-4 py-2.5 rounded-full flex items-center gap-2 border border-green-500/30 bg-green-500/10 shadow-lg z-20">
              <Lightning size={18} weight="duotone" className="text-green-500" />
              <span className="text-sm font-semibold text-foreground">Match Found! 94%</span>
            </motion.div>
            
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.5, duration: 0.6 }} className="absolute -left-12 bottom-20 glass px-4 py-2.5 rounded-full flex items-center gap-2 border border-orange/30 bg-orange/10 shadow-lg z-20">
              <CheckCircle size={18} weight="duotone" className="text-orange" />
              <span className="text-sm font-semibold text-foreground">Chat Unlocked</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* TRUSTED BY SECTION */}
      <div className="py-10 border-y border-white/5 overflow-hidden glass rounded-none relative">
        <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-background to-transparent z-10" />
        <div className="max-w-7xl mx-auto px-6 mb-6">
          <p className="text-center text-sm font-medium text-muted uppercase tracking-widest">Trusted by innovative teams</p>
        </div>
        <div className="flex w-[200%] animate-[marquee_20s_linear_infinite] whitespace-nowrap">
          {["TechVision", "StartupHub", "InnovateCo", "GrowthLabs", "FutureTech", "ScaleUp", "BuildFast", "LaunchPad", "NextGen", "PivotAI"].map((company, i) => (
             <div key={i} className="inline-flex glass mx-4 px-6 py-2 rounded-full font-semibold text-muted">
               {company}
             </div>
          ))}
          {["TechVision", "StartupHub", "InnovateCo", "GrowthLabs", "FutureTech", "ScaleUp", "BuildFast", "LaunchPad", "NextGen", "PivotAI"].map((company, i) => (
             <div key={i+10} className="inline-flex glass mx-4 px-6 py-2 rounded-full font-semibold text-muted">
               {company}
             </div>
          ))}
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        `}} />
      </div>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[20px] text-[13px] font-semibold text-orange border border-orange/40 bg-[linear-gradient(135deg,rgba(255,107,61,0.1),rgba(255,209,102,0.1))] mb-6">
            <MagicWand size={16} weight="duotone" /> Simple Process
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold italic mb-12 text-center tracking-tight">Recruitment Reimagined</h2>
          
          <div className="flex bg-black/5 dark:bg-white/5 p-1.5 rounded-full mb-16 border border-white/10">
            <button onClick={() => setActiveTab('recruiters')} className={`px-8 py-3 rounded-full font-semibold text-sm transition-all duration-300 ${activeTab === 'recruiters' ? 'bg-[linear-gradient(135deg,#FF6B3D,#FFD166)] text-white shadow-lg' : 'text-muted hover:text-foreground'}`}>For Recruiters</button>
            <button onClick={() => setActiveTab('candidates')} className={`px-8 py-3 rounded-full font-semibold text-sm transition-all duration-300 ${activeTab === 'candidates' ? 'bg-[linear-gradient(135deg,#FF6B3D,#FFD166)] text-white shadow-lg' : 'text-muted hover:text-foreground'}`}>For Candidates</button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative w-full">
            <div className="hidden md:block absolute top-[40%] left-[10%] right-[10%] border-t-2 border-dashed border-orange/20 z-0" />
            
            <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} className="relative z-10 glass p-8 rounded-[24px] overflow-hidden group hover:border-orange/40 transition-colors">
              <div className="absolute -top-10 -right-4 text-[120px] font-black italic text-orange opacity-5 group-hover:opacity-10 transition-opacity">01</div>
              <div className="w-16 h-16 rounded-2xl bg-orange/10 flex items-center justify-center mb-6 border border-orange/20">
                <ChatCircle size={32} weight="duotone" className="text-orange" />
              </div>
              <h3 className="text-xl font-bold mb-3">Tell Claura What You Need</h3>
              <p className="text-muted text-sm leading-relaxed">
                Just describe the role in plain language. Claura asks smart questions and builds a complete job profile automatically.
              </p>
            </motion.div>

            <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay:0.2}} className="relative z-10 glass p-8 rounded-[24px] overflow-hidden group hover:border-orange/40 transition-colors">
              <div className="absolute -top-10 -right-4 text-[120px] font-black italic text-orange opacity-5 group-hover:opacity-10 transition-opacity">02</div>
              <div className="w-16 h-16 rounded-2xl bg-orange/10 flex items-center justify-center mb-6 border border-orange/20">
                <Lightning size={32} weight="duotone" className="text-orange" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Finds Perfect Matches</h3>
              <p className="text-muted text-sm leading-relaxed">
                Our engine scans all candidates and surfaces the best matches with detailed compatibility scores instantly.
              </p>
            </motion.div>

            <motion.div initial={{opacity:0, y:20}} whileInView={{opacity:1, y:0}} viewport={{once:true}} transition={{delay:0.4}} className="relative z-10 glass p-8 rounded-[24px] overflow-hidden group hover:border-orange/40 transition-colors">
              <div className="absolute -top-10 -right-4 text-[120px] font-black italic text-orange opacity-5 group-hover:opacity-10 transition-opacity">03</div>
              <div className="w-16 h-16 rounded-2xl bg-orange/10 flex items-center justify-center mb-6 border border-orange/20">
                <Handshake size={32} weight="duotone" className="text-orange" />
              </div>
              <h3 className="text-xl font-bold mb-3">Connect and Hire</h3>
              <p className="text-muted text-sm leading-relaxed">
                Use Hiries to unlock direct chat with your top candidates. Full refund if hire is confirmed.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[20px] text-[13px] font-semibold text-orange border border-orange/40 bg-[linear-gradient(135deg,rgba(255,107,61,0.1),rgba(255,209,102,0.1))] mb-6">
            <Trophy size={16} weight="duotone" /> Why Clauhire
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold italic mb-12 tracking-tight text-center">See the Difference</h2>

          <div className="w-full overflow-x-auto rounded-[24px] glass border border-white/10 shadow-2xl">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr>
                  <th className="p-6 text-muted font-semibold text-sm border-b border-white/10">Feature</th>
                  <th className="p-6 font-bold text-orange bg-orange/5 border-b border-orange/20 text-center w-1/4">Clauhire</th>
                  <th className="p-6 text-foreground font-semibold text-sm border-b border-white/10 text-center w-1/5">LinkedIn</th>
                  <th className="p-6 text-foreground font-semibold text-sm border-b border-white/10 text-center w-1/5">Indeed</th>
                  <th className="p-6 text-foreground font-semibold text-sm border-b border-white/10 text-center w-1/5">Agencies</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { feature: "AI Conversation", cl: <CheckCircle size={20} weight="fill" className="text-green-500 mx-auto"/>, l: <Minus size={20} className="text-muted mx-auto"/>, i: <Minus size={20} className="text-muted mx-auto"/>, a: <Minus size={20} className="text-muted mx-auto"/> },
                  { feature: "Auto Profile Build", cl: <CheckCircle size={20} weight="fill" className="text-green-500 mx-auto"/>, l: <Minus size={20} className="text-muted mx-auto"/>, i: <Minus size={20} className="text-muted mx-auto"/>, a: <Minus size={20} className="text-muted mx-auto"/> },
                  { feature: "Real-time Matching", cl: <CheckCircle size={20} weight="fill" className="text-green-500 mx-auto"/>, l: <span className="text-gold font-bold text-center block">~</span>, i: <span className="text-gold font-bold text-center block">~</span>, a: <Minus size={20} className="text-muted mx-auto"/> },
                  { feature: "Credit Safety (Hiries)", cl: <CheckCircle size={20} weight="fill" className="text-green-500 mx-auto"/>, l: <Minus size={20} className="text-muted mx-auto"/>, i: <Minus size={20} className="text-muted mx-auto"/>, a: <Minus size={20} className="text-muted mx-auto"/> },
                  { feature: "Direct Chat", cl: <CheckCircle size={20} weight="fill" className="text-green-500 mx-auto"/>, l: <span className="text-gold font-bold text-center block">~</span>, i: <Minus size={20} className="text-muted mx-auto"/>, a: <CheckCircle size={20} weight="fill" className="text-green-500 mx-auto"/> },
                  { feature: "Time to Match", cl: <span className="text-green-500 font-bold block text-center">2 min</span>, l: <span className="text-muted block text-center">Days</span>, i: <span className="text-muted block text-center">Days</span>, a: <span className="text-muted block text-center">Weeks</span> },
                  { feature: "Cost", cl: <span className="text-green-500 font-bold block text-center">Low</span>, l: <span className="text-orange block text-center">High</span>, i: <span className="text-gold block text-center">Med</span>, a: <span className="text-orange block text-center">Very High</span> },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-orange/5 transition-colors border-b border-white/5 last:border-0 group">
                    <td className="p-5 font-medium text-muted group-hover:text-foreground transition-colors">{row.feature}</td>
                    <td className="p-5 bg-orange/5">{row.cl}</td>
                    <td className="p-5">{row.l}</td>
                    <td className="p-5">{row.i}</td>
                    <td className="p-5">{row.a}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section className="py-24 px-6 relative">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[20px] text-[13px] font-semibold text-orange border border-orange/40 bg-[linear-gradient(135deg,rgba(255,107,61,0.1),rgba(255,209,102,0.1))] mb-6">
            <ChartBar size={16} weight="duotone" /> Powerful Dashboard
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold italic mb-16 tracking-tight text-center">Everything in One Place</h2>
          <div className="relative w-full">
            <div className="glass rounded-[24px] overflow-hidden border border-white/20 shadow-2xl relative z-10">
              <div className="bg-black/10 dark:bg-white/5 px-4 py-3 border-b border-white/10 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="mx-auto bg-black/5 dark:bg-white/5 px-32 py-1 rounded-full text-xs text-muted">clauhire.com/dashboard</div>
              </div>
              <div className="aspect-[16/9] bg-background/50 flex">
                <div className="w-[200px] border-r border-white/10 p-4 space-y-4">
                  <div className="h-6 w-24 bg-white/10 rounded-full mb-8"/>
                  {[1,2,3,4].map(i => <div key={i} className="h-8 w-full bg-white/5 rounded-lg"/>)}
                </div>
                <div className="flex-1 p-8">
                  <div className="flex justify-between items-center mb-8">
                    <div className="h-8 w-48 bg-white/10 rounded-full"/>
                    <div className="flex gap-4"><div className="w-8 h-8 rounded-full bg-white/10"/><div className="w-8 h-8 rounded-full bg-orange"/></div>
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    {[1,2,3].map(i => <div key={i} className="h-32 glass rounded-2xl border-t-4 border-t-orange p-4"/>)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[20px] text-[13px] font-semibold text-orange border border-orange/40 bg-[linear-gradient(135deg,rgba(255,107,61,0.1),rgba(255,209,102,0.1))] mb-6">
            <Diamond size={16} weight="duotone" /> Simple Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold italic mb-16 tracking-tight text-center">Pay Only When You Connect</h2>

          <div className="grid md:grid-cols-4 gap-6 w-full max-w-6xl">
            {/* FREE */}
            <div className="glass p-8 rounded-[24px] flex flex-col border border-white/10 hover:border-orange/30 transition-colors">
              <h3 className="text-xl font-bold mb-2">Free</h3>
              <div className="text-4xl font-extrabold text-gradient mb-1 w-max">0 Hiries</div>
              <p className="text-sm text-green-500 font-medium mb-6">5 Free on Signup</p>
              <ul className="space-y-3 mb-8 flex-1 text-sm text-muted">
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-orange" weight="fill"/> AI Conversation</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-orange" weight="fill"/> View Matches</li>
              </ul>
              <Link href="/sign-up" className="w-full py-3 rounded-full text-center font-semibold text-sm border border-white/20 hover:bg-white/5 transition-colors">
                Get Started Free
              </Link>
            </div>

            {/* STARTER */}
            <div className="glass p-8 rounded-[24px] flex flex-col border border-white/10 hover:border-orange/30 transition-colors">
              <h3 className="text-xl font-bold mb-2">Starter</h3>
              <div className="text-4xl font-extrabold text-foreground mb-1 w-max">10 Hiries</div>
              <p className="text-sm text-muted mb-6">₹199</p>
              <ul className="space-y-3 mb-8 flex-1 text-sm text-muted">
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-orange" weight="fill"/> 5 Connections</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-orange" weight="fill"/> Direct Chat</li>
              </ul>
              <button className="w-full py-3 rounded-full text-center font-semibold text-sm border border-white/20 hover:bg-white/5 transition-colors">
                Get Starter
              </button>
            </div>

            {/* PRO */}
            <div className="glass p-8 rounded-[24px] flex flex-col border-2 border-orange relative shadow-[0_0_30px_rgba(255,107,61,0.15)] transform md:-translate-y-4 bg-orange/5">
              <div className="absolute -top-3 right-6 bg-orange text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">Most Popular</div>
              <h3 className="text-xl font-bold mb-2 text-foreground">Pro</h3>
              <div className="text-4xl font-extrabold text-gradient mb-1 w-max">30 Hiries</div>
              <p className="text-sm text-muted mb-6">₹499</p>
              <ul className="space-y-3 mb-8 flex-1 text-sm text-foreground">
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-orange" weight="fill"/> 15 Connections</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-orange" weight="fill"/> Direct Chat</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-orange" weight="fill"/> Priority Support</li>
              </ul>
              <button className="w-full py-3 rounded-full text-center font-bold text-sm bg-orange text-white hover:scale-105 transition-transform shadow-lg">
                Get Pro
              </button>
            </div>

            {/* BUSINESS */}
            <div className="glass p-8 rounded-[24px] flex flex-col border border-white/10 hover:border-orange/30 transition-colors">
              <h3 className="text-xl font-bold mb-2">Business</h3>
              <div className="text-4xl font-extrabold text-foreground mb-1 w-max">75 Hiries</div>
              <p className="text-sm text-muted mb-6">₹999</p>
              <ul className="space-y-3 mb-8 flex-1 text-sm text-muted">
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-orange" weight="fill"/> 37 Connections</li>
                <li className="flex items-center gap-2"><CheckCircle size={16} className="text-orange" weight="fill"/> Dedicated Account</li>
              </ul>
              <button className="w-full py-3 rounded-full text-center font-semibold text-sm border border-white/20 hover:bg-white/5 transition-colors">
                Get Business
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mt-12">
            <span className="glass px-5 py-2 rounded-full text-sm font-medium flex items-center gap-2 text-muted"><Diamond size={16} className="text-orange"/> 2 Hiries per connection</span>
            <span className="glass px-5 py-2 rounded-full text-sm font-medium flex items-center gap-2 text-muted"><ArrowsClockwise size={16} className="text-orange"/> Full refund if declined</span>
            <span className="glass px-5 py-2 rounded-full text-sm font-medium flex items-center gap-2 text-muted"><Trophy size={16} className="text-orange"/> Refund on successful hire</span>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[20px] text-[13px] font-semibold text-orange border border-orange/40 bg-[linear-gradient(135deg,rgba(255,107,61,0.1),rgba(255,209,102,0.1))] mb-6">
            <ChatCircle size={16} weight="duotone" /> Got Questions?
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold italic mb-12 tracking-tight text-center">Frequently Asked Questions</h2>
          <div className="w-full space-y-4">
            {[
              {q: "What is Clauhire?", a: "Clauhire is an AI-powered recruitment platform where recruiters and candidates talk to Claura, our AI agent, instead of filling forms."},
              {q: "What are Hiries?", a: "Hiries are credits used to accept matches. You spend 2 Hiries to connect with a match. Full refund if they decline or you hire them."},
              {q: "Is my data secure?", a: "Yes. We use Supabase with row-level security, encrypted connections, and never share contact details until both agree."},
              {q: "How do I get started?", a: "Sign up free, select your role, and start chatting with Claura. You get 5 free Hiries to begin."}
            ].map((faq, i) => (
              <div key={i} className="glass rounded-[20px] overflow-hidden transition-colors hover:border-orange/30 cursor-pointer" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div className="p-6 flex justify-between items-center">
                  <h4 className={`font-bold transition-colors ${openFaq === i ? 'text-orange' : 'text-foreground'}`}>{faq.q}</h4>
                  {openFaq === i ? <Minus className="text-orange" /> : <Plus className="text-muted" />}
                </div>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div initial={{height:0, opacity:0}} animate={{height:'auto', opacity:1}} exit={{height:0, opacity:0}} className="px-6 pb-6 text-muted text-sm leading-relaxed">
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-orange/20 dark:bg-orange/10 rounded-[40px] max-w-7xl mx-auto" />
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center text-center py-16">
          <h2 className="text-[40px] md:text-[56px] font-extrabold italic mb-6 tracking-tight text-foreground">Ready to Transform Your Hiring?</h2>
          <p className="text-xl text-muted mb-10 max-w-2xl">Join 2,000+ professionals already using Clauhire to hire smarter and find their dream jobs.</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/sign-up" className="bg-orange text-white px-10 py-5 rounded-full font-bold hover:scale-105 transition-transform shadow-xl text-lg">
              Get Started Free
            </Link>
            <button className="px-10 py-5 rounded-full font-bold hover:bg-white/5 transition-colors glass text-lg">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="glass border-t border-white/10 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-muted text-sm space-y-6">
          <div><span className="text-2xl font-extrabold italic text-gradient tracking-tight">Clauhire</span></div>
          <p>Where Talent Meets Opportunity</p>
          <div className="flex justify-center gap-6 pt-4">
            <a href="#" className="hover:text-orange transition-colors">About</a>
            <a href="#" className="hover:text-orange transition-colors">Pricing</a>
            <a href="#" className="hover:text-orange transition-colors">Privacy</a>
            <a href="#" className="hover:text-orange transition-colors">Terms</a>
          </div>
          <div className="pt-8 border-t border-white/5 mt-8">
            © 2026 Clauhire. Made with ❤️ in India.
          </div>
        </div>
      </footer>
    </div>
  );
}
