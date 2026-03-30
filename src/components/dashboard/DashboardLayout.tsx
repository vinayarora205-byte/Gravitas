import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";
import React from "react";

interface LayoutProps {
  children: React.ReactNode;
  role: string;
}

export default function DashboardLayout({ children, role }: LayoutProps) {
  const { userId } = auth();
  if (!userId) redirect("/sign-in");
  
  return (
    <div className="h-screen flex bg-background font-sans overflow-hidden relative">
      <div className="fixed inset-0 z-[-1] bg-[#F6F1EB]" />
      <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-orange/5 rounded-full blur-[120px] pointer-events-none z-[-1]" />
      
      <Sidebar role={role} />
      
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Header role={role} />
        <main className="flex-1 overflow-y-auto px-6 py-10 lg:px-12 relative scroll-smooth custom-scrollbar">
          <div className="max-w-[1280px] mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

