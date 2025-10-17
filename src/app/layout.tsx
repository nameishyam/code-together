import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import "./globals.css";
import Navbar from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";
import { isServerLoggedIn } from "@/lib/auth-server";
import ClientWrapper from "@/components/client-wrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Code Together",
  description:
    "Real-time collaborative code editor built with Next.js and WebSockets. Compiler support for multiple languages.",
  icons: {
    icon: "/code.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isLoggedIn = await isServerLoggedIn();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <nav>
            <Navbar isLoggedIn={isLoggedIn} />
          </nav>
          <main>
            <ClientWrapper isLoggedIn={isLoggedIn}>{children}</ClientWrapper>
          </main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
