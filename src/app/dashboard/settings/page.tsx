import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserProfile } from "@clerk/nextjs";

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

      <div className="bg-surface-low rounded-xl p-8 border border-outline/10">
        <UserProfile
          appearance={{
            variables: {
              colorText: "#F6F3F5",
              colorTextSecondary: "#ACAAAD",
              colorPrimary: "#F59E0B",
              colorBackground: "transparent",
              colorInputBackground: "#000000",
              colorInputText: "#F6F3F5",
            },
            elements: {
              rootBox: "w-full",
              cardBox: "shadow-none bg-transparent",
              card: "bg-transparent shadow-none",
              navbar: "!bg-transparent",
              navbarButton: "!text-[#ACAAAD] hover:!text-[#F6F3F5]",
              navbarButtonActive: "!text-[#F59E0B]",
              headerTitle: "!text-[#F6F3F5]",
              headerSubtitle: "!text-[#ACAAAD]",
              formFieldLabel: "!text-[#F6F3F5]",
              formFieldInput: "!bg-black !border-[#48474A]/30 !text-[#F6F3F5]",
              formButtonPrimary:
                "!bg-gradient-to-r !from-[#F59E0B] !to-[#D97706] !text-[#0E0E10] !font-bold",
              profileSectionTitle: "!text-[#F6F3F5]",
              profileSectionContent: "!text-[#ACAAAD]",
              profileSectionPrimaryButton: "!text-[#F59E0B]",
              badge: "!text-[#F6F3F5]",
              footer: "hidden",
            },
          }}
        />
      </div>
    </>
  );
}
