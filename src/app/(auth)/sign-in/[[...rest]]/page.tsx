"use client";

import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { motion } from "framer-motion";
import { Sparkle, Headset, Briefcase, LockKey } from "@phosphor-icons/react";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex p-4 lg:p-6 overflow-hidden relative">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,107,61,0.05),rgba(255,209,102,0.02))] z-0" />
      
      <div className="w-full max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12 relative z-10">
        
        {/* Left Column — Value Prop */}
        <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto lg:mx-0 p-8 pt-12 lg:pt-8 relative animate-fade-in-up">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange/20 rounded-full blur-[120px] pointer-events-none" />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/5 mb-8">
              <Sparkle weight="fill" className="text-orange" />
              <span className="text-sm font-bold tracking-widest uppercase text-foreground">Welcome Back</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold text-foreground italic tracking-tighter leading-[1.1] mb-6 drop-shadow-sm">
              Resume <span className="text-transparent bg-clip-text bg-[linear-gradient(135deg,#FF6B3D,#FFD166)]">Brilliance.</span>
            </h1>
            
            <p className="text-lg lg:text-xl text-muted font-medium mb-12 max-w-md leading-relaxed">
              Sign in to continue your journey. Your next great opportunity or perfect hire is just a conversation away with Claura.
            </p>
            
            <div className="space-y-6">
              {[
                { icon: <Briefcase weight="fill" size={24} />, title: "Instant Access", desc: "Jump right back into your active matches and opportunities." },
                { icon: <Headset weight="fill" size={24} />, title: "Claura AI Chat", desc: "Continue your personalized interactions seamlessly." },
                { icon: <LockKey weight="fill" size={24} />, title: "Enterprise Security", desc: "Your data is encrypted and securely managed." }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-2xl glass border border-white/5 group hover:border-orange/30 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-orange/10 flex items-center justify-center text-orange group-hover:scale-110 group-hover:bg-orange group-hover:text-white transition-all shadow-sm">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-foreground font-bold text-base">{item.title}</h3>
                    <p className="text-muted text-sm font-medium mt-1">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
        
        {/* Right Column — Clerk Auth */}
        <div className="flex-1 flex items-center justify-center w-full max-w-md mx-auto relative animate-fade-in">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,rgba(255,107,61,0.1)_0%,transparent_60%)] pointer-events-none" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-full max-w-[480px]"
          >
            <div className="p-1 rounded-3xl bg-[linear-gradient(135deg,rgba(255,255,255,0.1),rgba(255,255,255,0.02))] shadow-2xl relative z-10 backdrop-blur-3xl border border-white/10 overflow-hidden">
              <SignIn 
                routing="path" 
                path="/sign-in" 
                afterSignInUrl="/dashboard/recruiter"
                appearance={{
                  baseTheme: dark,
                  variables: {
                    colorPrimary: '#FF6B3D',
                    colorBackground: 'transparent',
                    colorText: '#f5f5f5',
                    colorInputBackground: 'rgba(255,255,255,0.03)',
                    colorInputText: '#fff',
                    borderRadius: '16px',
                    fontFamily: 'var(--font-poppins)',
                  },
                  elements: {
                    card: "bg-transparent shadow-none border-0",
                    headerTitle: "text-2xl font-extrabold italic tracking-tight text-white",
                    headerSubtitle: "text-white/60 font-medium",
                    formButtonPrimary: "bg-[linear-gradient(135deg,#FF6B3D,#FF8C5A)] hover:opacity-90 transition-all text-white font-bold shadow-[0_4px_14px_rgba(255,107,61,0.4)]",
                    formFieldInput: "border-white/10 focus:border-orange bg-black/20 focus:bg-black/40 transition-colors backdrop-blur-md rounded-xl font-medium",
                    formFieldLabel: "text-white/70 font-semibold text-xs uppercase tracking-wider",
                    dividerLine: "bg-white/10",
                    dividerText: "text-white/40 font-medium",
                    socialButtonsBlockButton: "border-white/10 hover:bg-white/5 text-white bg-white/5 transition-colors font-semibold rounded-xl",
                    footerActionText: "text-white/60 font-medium",
                    footerActionLink: "text-orange hover:text-orange-400 font-bold"
                  }
                }}
              />
            </div>
          </motion.div>
        </div>
        
      </div>
    </div>
  );
}
