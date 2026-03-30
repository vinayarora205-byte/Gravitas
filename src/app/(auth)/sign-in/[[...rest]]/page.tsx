"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10 font-sans"
      style={{ background: "#F6F1EB" }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-8">
        <div className="w-9 h-9 rounded-full bg-[#FF6A2A] flex items-center justify-center text-white font-bold font-serif text-lg">
          C
        </div>
        <span className="font-serif text-[22px] font-bold italic text-[#0F0F0F]">Clauhire</span>
      </Link>

      {/* Card */}
      <div
        className="w-full max-w-[440px] bg-white rounded-[20px] p-8"
        style={{
          boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
          border: "1px solid #E8E3DD",
        }}
      >
        <SignIn
          routing="path"
          path="/sign-in"
          afterSignInUrl="/dashboard/recruiter"
          appearance={{
            variables: {
              colorPrimary: "#FF6A2A",
              colorBackground: "#ffffff",
              colorText: "#0F0F0F",
              colorInputBackground: "#F9F9F9",
              colorInputText: "#0F0F0F",
              borderRadius: "12px",
              fontFamily: "Inter, sans-serif",
            },
            elements: {
              card: "shadow-none border-0 p-0",
              headerTitle: "text-[22px] font-bold text-[#0F0F0F]",
              headerSubtitle: "text-gray-400",
              formButtonPrimary: "bg-[#FF6A2A] hover:opacity-90 font-bold text-white",
              formFieldInput: "bg-[#F9F9F9] border-[#E8E3DD] text-[#0F0F0F] focus:border-[#FF6A2A]",
              footerActionLink: "text-[#FF6A2A] hover:opacity-80 font-semibold",
              socialButtonsBlockButton: "border border-[#E8E3DD] hover:bg-[#F6F1EB]",
            },
          }}
        />
      </div>

      <p className="text-[13px] text-gray-400 mt-6">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="text-[#FF6A2A] font-semibold hover:underline">
          Sign up free
        </Link>
      </p>
    </div>
  );
}
