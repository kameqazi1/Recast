import type { Metadata } from "next";
import "@fontsource-variable/dm-sans";
import "@fontsource/dm-mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "Recast — AI-Powered Podcast Processing",
  description:
    "Turn episodes into viral clips, automatically. AI-powered transcription, clip detection, and video extraction.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
