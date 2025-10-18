import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme/theme-provider";
import "./globals.css";
import Navbar from "@/components/navbar";
import { Toaster } from "@/components/ui/sonner";
import { isServerLoggedIn } from "@/lib/auth-server";
import ClientWrapper from "@/hooks/client-wrapper";
import Script from "next/script";

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

const initialWakeScript = `
    (function () {
  try {
    const WEBHOOK_URL = "https://n8n-ved5.onrender.com/webhook/initial-wake";
    const payload = {
      event: "landing_page_load",
      url: location.href,
      userAgent: navigator.userAgent,
      ts: new Date().toISOString(),
    };

    // Do NOT use sendBeacon if you want to guarantee no credentials are sent.
    // Use fetch with credentials: 'omit'
    fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
      mode: "cors",
      credentials: "omit" // <- ensures no cookies or credentials are sent
    }).catch((err) => {
      // optionally silently ignore; logging useful for debug
      console.error("webhook fetch error:", err);
    });
  } catch (err) {
    console.error("initial wake error:", err);
  }
})();

  `;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isLoggedIn = await isServerLoggedIn();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="initial-wake" strategy="beforeInteractive">
          {initialWakeScript}
        </Script>
      </head>
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
