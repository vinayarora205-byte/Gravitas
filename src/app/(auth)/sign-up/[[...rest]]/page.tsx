"use client"
import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(135deg,#FFF5F2,#F7F6F3)",
      display:"flex",
      alignItems:"center",
      justifyContent:"center",
      padding:"24px"
    }}>
      <div style={{
        display:"flex",
        gap:"48px",
        alignItems:"center",
        maxWidth:"900px",
        width:"100%"
      }}>
        <div style={{flex:1}}>
          <h1 style={{fontSize:"32px",fontWeight:"600",color:"#1F1F1F",marginBottom:"12px"}}>
            Join GRAVITAS
          </h1>
          <p style={{color:"#666",marginBottom:"24px"}}>
            AI-powered recruitment. Zero friction.
          </p>
          {["Intelligent AI Chat Agent","Real-time Match Notifications","Automated Role Parsing"].map((item,i)=>(
            <div key={i} style={{display:"flex",gap:"12px",marginBottom:"12px",alignItems:"center"}}>
              <span style={{color:"#FF6B3D",fontWeight:"600"}}>{i+1}</span>
              <span style={{color:"#333"}}>{item}</span>
            </div>
          ))}
        </div>
        <div style={{flex:1}}>
          <SignUp routing="path" path="/sign-up" afterSignUpUrl="/role-select" />
        </div>
      </div>
    </div>
  )
}
