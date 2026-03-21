"use client"
import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(135deg,#FFF5F2,#F7F6F3)",
      display:"flex",
      alignItems:"center",
      justifyContent:"center"
    }}>
      <SignIn routing="path" path="/sign-in" afterSignInUrl="/dashboard/recruiter" />
    </div>
  )
}
