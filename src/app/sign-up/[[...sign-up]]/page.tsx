import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { Film } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary opacity-[0.04] blur-[120px] rounded-full pointer-events-none" />

      {/* Brand */}
      <Link href="/" className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
          <Film size={20} className="text-background" />
        </div>
        <span className="font-display text-2xl font-black tracking-tighter text-text">
          Recast
        </span>
      </Link>

      {/* Clerk card wrapper */}
      <div className="bg-surface-low border border-primary/40 rounded-2xl p-8 shadow-2xl glow-primary">
        <SignUp
          forceRedirectUrl="/dashboard"
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
              headerTitle: "!text-[#F6F3F5] font-display font-bold",
              headerSubtitle: "!text-[#F6F3F5]",
              socialButtonsBlockButton:
                "!bg-[#1F1F22] !border-[#F59E0B]/40 !text-[#F6F3F5] hover:!bg-[#2C2C2F]",
              socialButtonsBlockButtonText: "!text-[#F6F3F5]",
              socialButtonsProviderIcon:
                "!brightness-0 !invert",
              formFieldLabel: "!text-[#F6F3F5]",
              formFieldInput:
                "!bg-black !border-[#48474A]/30 !text-[#F6F3F5] !placeholder-[#ACAAAD] focus:!ring-[#F59E0B]/50",
              formFieldInputPlaceholder: "!text-[#F6F3F5]",
              formButtonPrimary:
                "!bg-gradient-to-r !from-[#F59E0B] !to-[#D97706] hover:!opacity-90 !text-[#0E0E10] !font-bold",
              footerActionLink: "!text-[#F59E0B]",
              footerActionText: "!text-[#F6F3F5]",
              footerAction: "!text-[#F6F3F5]",
              dividerLine: "!bg-[#48474A]/30",
              dividerText: "!text-[#F6F3F5]",
              identityPreviewText: "!text-[#F6F3F5]",
              identityPreviewEditButton: "!text-[#F59E0B]",
              formFieldAction: "!text-[#F59E0B]",
              formFieldInputShowPasswordButton: "!text-[#F6F3F5]",
              alertText: "!text-[#FF6E84]",
              formHeaderTitle: "!text-[#F6F3F5]",
              formHeaderSubtitle: "!text-[#F6F3F5]",
              otpCodeFieldInput: "!text-[#F6F3F5] !border-[#48474A]/30",
              selectButton: "!text-[#F6F3F5]",
              selectOptionsContainer: "!bg-[#1F1F22]",
              selectOption: "!text-[#F6F3F5]",
              internal: "!text-[#F6F3F5]",
              footer: "!text-[#F6F3F5] [&_*]:!text-[#F6F3F5]",
              footerPages: "!text-[#F6F3F5]",
              footerPagesLink: "!text-[#F6F3F5]",
              badge: "!text-[#F6F3F5]",
            },
          }}
        />
      </div>

      {/* Footer */}
      <p className="mt-8 text-sm text-[#F6F3F5]">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-primary font-bold hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
