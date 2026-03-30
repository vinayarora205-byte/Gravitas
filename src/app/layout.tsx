import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Clauhire | Where Talent Meets Opportunity",
  description: "Advanced AI-powered talent acquisition platform. Find your perfect hire or dream job through conversation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#FF6A2A',
          colorBackground: '#ffffff',
          colorText: '#0F0F0F',
          colorInputBackground: '#F9F9F9',
          colorInputText: '#0F0F0F',
          borderRadius: '14px',
        },
        elements: {
          formButtonPrimary: "bg-[#FF6A2A] hover:opacity-90 normal-case font-bold text-white",
          card: "bg-white border border-[#E8E3DD] shadow-[0_8px_40px_rgba(0,0,0,0.08)] rounded-[20px]",
          headerTitle: "text-[#0F0F0F] font-bold font-serif italic",
          headerSubtitle: "text-gray-400 font-sans",
          socialButtonsBlockButton: "border border-[#E8E3DD] hover:bg-[#F6F1EB] rounded-xl font-medium text-[#0F0F0F]",
          formFieldLabel: "text-[#0F0F0F] font-medium",
          formFieldInput: "bg-[#F9F9F9] border-[#E8E3DD] text-[#0F0F0F] rounded-xl focus:border-[#FF6A2A]",
          footerActionLink: "text-[#FF6A2A] hover:text-[#E5512A] font-semibold",
        }
      }}
    >
      <html lang="en">
        <head>
          <link
            href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Inter:wght@300;400;500;600;700&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="font-sans antialiased bg-[#F6F1EB] text-[#0F0F0F]">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
