import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "next-themes";

export const metadata: Metadata = {
  title: "Clauhire | Where Talent Meets Opportunity",
  description: "Advanced AI-powered talent acquisition platform.",
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
          colorPrimary: '#FF6B3D',
        },
        elements: {
          formButtonPrimary: 
            "bg-accent hover:bg-accent-hover active:bg-accent/90 normal-case rounded-xl font-medium",
          card: "bg-card border border-border shadow-lg rounded-2xl",
          headerTitle: "text-foreground font-semibold font-sans",
          headerSubtitle: "text-muted font-sans",
          socialButtonsBlockButton: 
            "border-border hover:bg-black/5 dark:hover:bg-white/5 rounded-xl font-medium text-foreground",
          socialButtonsBlockButtonText: "font-semibold",
          dividerLine: "bg-border",
          dividerText: "text-muted",
          formFieldLabel: "text-foreground font-medium",
          formFieldInput: 
            "bg-background border-border text-foreground rounded-xl focus:ring-accent focus:border-accent",
          footerActionText: "text-muted",
          footerActionLink: "text-accent hover:text-accent-hover font-semibold",
        }
      }}
    >
      <html lang="en" suppressHydrationWarning className="dark">
        <body className="font-sans antialiased text-foreground bg-background">
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
