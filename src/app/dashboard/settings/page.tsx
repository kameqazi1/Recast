import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserProfile } from "@clerk/nextjs";
import { VoiceProfilesSection } from "./voice-profiles";

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <>
      <section className="mb-8">
        <span className="label-md text-primary mb-3 block">Account</span>
        <h2 className="font-display text-4xl font-black tracking-tighter text-text">
          Settings
        </h2>
      </section>

      {/* Voice Profiles */}
      <VoiceProfilesSection />

      {/* Account Settings (Clerk) */}
      <div className="bg-surface-low rounded-xl p-8 border border-outline/10 mt-8">
        <UserProfile
          appearance={{
            elements: {
              rootBox: "w-full",
              cardBox: "shadow-none bg-transparent",
              card: "bg-transparent shadow-none",
              navbar: "!bg-transparent",
              navbarButton: "!text-[#F6F3F5] hover:!text-[#F6F3F5]",
              navbarButtonActive: "!text-[#F6F3F5]",
              headerTitle: "!text-[#F6F3F5]",
              headerSubtitle: "!text-[#F6F3F5]",
              formFieldLabel: "!text-[#F6F3F5]",
              formFieldInput: "!bg-black !border-[#48474A]/30 !text-[#F6F3F5]",
              formButtonPrimary:
                "!bg-gradient-to-r !from-[#F6F3F5] !to-[#F6F3F5] !text-[#F6F3F5] !font-bold",
              profileSectionTitle: "!text-[#F6F3F5]",
              profileSectionContent: "!text-[#F6F3F5]",
              profileSectionPrimaryButton: "!text-[#F6F3F5]",
              badge: "!text-[#F6F3F5]",
              footer: "hidden",
            },
          }}
        />
      </div>
    </>
  );
}
