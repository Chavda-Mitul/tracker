import type { Metadata } from "next";
import { Patrick_Hand, Kalam } from "next/font/google";
import { AppShell } from "@/components/common/app-shell";
import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const sketchBody = Patrick_Hand({
  variable: "--font-sketch-body",
  weight: "400",
  subsets: ["latin"],
});

const sketchHeading = Kalam({
  variable: "--font-sketch-heading",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Task Tracker",
  description: "Level up your skills by tracking your tasks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) { 
  return (
    <html
      lang="en"
      className={`${sketchBody.variable} ${sketchHeading.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
          <filter id="sketchy">
            <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" />
          </filter>
        </svg>
        <QueryProvider>
          <AppShell>{children}</AppShell>
        </QueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
