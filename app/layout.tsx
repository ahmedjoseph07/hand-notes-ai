//External imports
import type { Metadata } from "next";
import { IBM_Plex_Serif, Mona_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { shadcn } from "@clerk/ui/themes";

import { NuqsAdapter } from "nuqs/adapters/next/app";

// Internal imports
import "./globals.css";
import { Toaster } from "@/components/feedback/Toaster";

const ibmPlexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  variable: "--font-ibm-plex-serif",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const monaSans = Mona_Sans({
  subsets: ["latin"],
  variable: "--font-mona-sans",
  display: "swap",
});

const siteDescription =
  "Transform your notes into digital text with ease using hand-notes-ai. Upload your notes and chat with them effortlessly. Experience the power of AI in note-taking today.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "HandNotesAI · Study from your handwritten notes", template: "%s · HandNotesAI" },
  description: siteDescription,
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "hand-notes-ai",
    description: siteDescription,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "hand-notes-ai: your handwritten notes, ready to talk back.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // data-sidebar is set by an inline script before hydration (app/(app)/layout.tsx)
      suppressHydrationWarning
      className={`${ibmPlexSerif.variable} ${monaSans.variable} h-full relative font-sans antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ClerkProvider
          appearance={{ theme: shadcn }}
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          signInFallbackRedirectUrl="/library"
          signUpFallbackRedirectUrl="/onboarding"
        >
          <NuqsAdapter>{children}</NuqsAdapter>
          <Toaster />
        </ClerkProvider>
      </body>
    </html>
  );
}