import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { ui } from "@clerk/ui";
import "@fontsource-variable/dm-sans";
import "@fontsource/dm-mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Recast — AI-Powered Podcast Processing",
  description:
    "Turn episodes into viral clips, automatically. AI-powered transcription, clip detection, and video extraction.",
  metadataBase: new URL("https://www.getrecast.app"),
  openGraph: {
    title: "Recast — AI-Powered Podcast Processing",
    description:
      "Turn episodes into viral clips, automatically. AI-powered transcription, clip detection, and video extraction.",
    url: "https://www.getrecast.app",
    siteName: "Recast",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Recast — AI-Powered Podcast Processing",
    description:
      "Turn episodes into viral clips, automatically. AI-powered transcription, clip detection, and video extraction.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      ui={ui}
      appearance={{
        variables: {
          colorPrimary: "#F59E0B",
          colorBackground: "#0E0E10",
        } as Record<string, string>,
      }}
    >
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
