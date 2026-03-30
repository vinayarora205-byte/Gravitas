"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { CaretLeft, CheckCircle, Diamond, WhatsappLogo, Envelope, Sparkle } from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

export default function PricingPage() {
  const router = useRouter();

  const packages = [
    { name: "Starter", hiries: 10, price: 199, color: "orange", popular: false },
    { name: "Pro", hiries: 30, price: 499, color: "orange", popular: true },
    { name: "Business", hiries: 75, price: 999, color: "orange", popular: false },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-sans selection:bg-orange/20">
      {/* Header */}
      <header className="px-6 py-4 border-b border-black/5 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-orange flex items-center justify-center text-white">
               <Sparkle weight="fill" size={18} />
            </div>
            <span className="text-xl font-bold text-dark serif italic">Clauhire</span>
          </div>
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-1 text-xs font-black text-dark/30 hover:text-dark uppercase tracking-widest transition-colors"
          >
            <CaretLeft size={16} weight="bold" /> Back
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange/10 border border-orange/20 mb-6 fade-up">
             <Diamond weight="fill" className="text-orange size-3" />
             <span className="text-[10px] font-black uppercase tracking-widest text-orange">Capital & Currency</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-dark serif italic tracking-tight mb-6">
            The Hiries Standard
          </h1>
          <p className="text-xl text-dark/40 font-medium max-w-2xl mx-auto">
            Your high-fidelity currency for making premium global connections.
          </p>
        </div>

        {/* Intelligence / Rules Area */}
        <div className="bg-white rounded-[40px] border border-black/5 p-8 md:p-12 mb-20 shadow-[0_20px_60px_rgba(0,0,0,0.03)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            <div>
               <h3 className="text-2xl font-bold text-dark serif italic mb-6">Exchange Protocols</h3>
               <div className="space-y-6">
                 {[
                   "2 Hiries to initiate a secure connection",
                   "Full refund if protocol is not mutually accepted",
                   "Full refund upon successful confirmation"
                 ].map((rule, i) => (
                   <div key={rule} className="flex gap-4 items-start">
                      <div className="size-6 rounded-full bg-green-500/10 flex items-center justify-center text-green-600 shrink-0 mt-0.5">
                         <CheckCircle size={16} weight="bold" />
                      </div>
                      <p className="text-dark font-medium leading-tight">{rule}</p>
                   </div>
                 ))}
               </div>
            </div>
            <div className="bg-gray-50 rounded-3xl p-8 flex flex-col justify-center gap-4">
               <div className="size-12 rounded-2xl bg-orange/10 flex items-center justify-center text-orange">
                  <Diamond size={24} weight="duotone" />
               </div>
               <div>
                 <h4 className="font-bold text-dark text-lg mb-1">Algorithmic Integrity</h4>
                 <p className="text-dark/40 text-sm font-medium">Hiries ensure that every interaction is high-stakes and high-value, maintaining the quality of the Clauhire ecosystem.</p>
               </div>
            </div>
          </div>
        </div>

        {/* Packages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {packages.map((pkg, i) => (
            <div key={pkg.name}>
              <Card className={`relative h-full flex flex-col items-center p-10 text-center group cursor-default transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 border-black/[0.03] ${pkg.popular ? 'ring-2 ring-orange/20 shadow-xl' : ''}`}>
                {pkg.popular && (
                  <div className="absolute top-0 -translate-y-1/2 px-4 py-1.5 bg-orange text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-orange/20">
                    Most Deployed
                  </div>
                )}
                <h3 className="text-xs font-black text-dark/30 uppercase tracking-widest mb-10">{pkg.name}</h3>
                <div className="mb-8">
                   <div className="text-7xl font-bold text-orange serif italic mb-2 tracking-tighter">{pkg.hiries}</div>
                   <div className="text-[10px] font-black text-dark/30 uppercase tracking-widest">Hiries Package</div>
                </div>
                <div className="mt-auto w-full pt-10 border-t border-black/5">
                   <div className="text-4xl font-bold text-dark serif mb-6 tracking-tight">₹{pkg.price.toLocaleString()}</div>
                   <Button variant="outline" className="w-full grayscale opacity-40 cursor-not-allowed">
                     Coming Soon
                   </Button>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* Contact Intelligence */}
        <div className="bg-dark rounded-[40px] p-12 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_#FF6B3D_0%,_transparent_70%)]" />
          <h3 className="text-3xl md:text-4xl font-bold text-white serif italic mb-4 relative z-10">Manual Provisioning</h3>
          <p className="text-white/40 font-medium mb-12 max-w-lg mx-auto relative z-10">Our deployment team can manually allocate capital to your account within minutes.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer">
              <Button variant="primary" className="w-full sm:w-auto bg-[#25D366] hover:bg-[#1eb856] text-white border-none py-4 px-8">
                <WhatsappLogo size={20} weight="fill" /> WhatsApp Dispatch
              </Button>
            </a>
            <a href="mailto:support@clauhire.com">
              <Button variant="primary" className="w-full sm:w-auto py-4 px-8">
                <Envelope size={20} weight="fill" /> Email Protocol
              </Button>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

