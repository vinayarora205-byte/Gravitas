"use client";

import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SignUpContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role");

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

      {/* Role badge if provided */}
      {role && (
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-medium mb-5"
          style={{ background: "#FFF3EE", color: "#FF6A2A", border: "1px solid #FFD5C0" }}
        >
          {role === "recruiter" ? "🏢 Signing up as a Recruiter" : "💼 Signing up as a Candidate"}
        </div>
      )}

      {/* Card */}
      <div
        className="w-full max-w-[440px] bg-white rounded-[20px] p-8"
        style={{
          boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
          border: "1px solid #E8E3DD",
        }}
      >
        <SignUp
          routing="path"
          path="/sign-up"
          afterSignUpUrl="/role-select"
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
        Already have an account?{" "}
        <Link href="/sign-in" className="text-[#FF6A2A] font-semibold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6F1EB] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-[#FF6A2A] border-t-transparent animate-spin" /></div>}>
      <SignUpContent />
    </Suspense>
  );
}
