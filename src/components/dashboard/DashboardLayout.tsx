import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface LayoutProps {
 children: React.ReactNode;
 role: string;
}

export default function DashboardLayout({ children, role }: LayoutProps) {
 const { userId } = auth();
 if (!userId) redirect("/sign-in");
 return (
 <div className="h-screen flex flex-col bg-background font-sans overflow-hidden relative">
 <div className="fixed inset-0 z-[-1] transition-colors duration-500 bg-[linear-gradient(135deg,#FFF5F2,#FAFAFA,#FFF0E8)]" />
 <Header role={role} />
 <div className="flex flex-1 overflow-hidden">
 <Sidebar role={role} />
 <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative">
 <div className="max-w-6xl mx-auto w-full">
 {children}
 </div>
 </main>
 </div>
 </div>
 );
}
