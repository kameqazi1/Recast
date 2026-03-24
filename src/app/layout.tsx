import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
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
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: "#F59E0B",
          colorBackground: "#0E0E10",
          colorInputBackground: "#131315",
          colorText: "#F6F3F5",
          colorTextSecondary: "#ACAAAD",
          borderRadius: "0.75rem",
          fontFamily: "'DM Sans Variable', sans-serif",
        },
      }}
    >
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
