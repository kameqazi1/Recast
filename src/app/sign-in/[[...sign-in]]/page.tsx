import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Film } from "lucide-react";

export default function SignInPage() {
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
      <div className="bg-surface-low border border-outline/20 rounded-2xl p-8 shadow-2xl">
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full",
              cardBox: "shadow-none bg-transparent",
              card: "bg-transparent shadow-none",
              headerTitle: "text-text font-display font-bold",
              headerSubtitle: "text-text-muted",
              socialButtonsBlockButton:
                "bg-surface-high border-outline/20 text-text hover:bg-surface-bright",
              formFieldLabel: "text-text-muted",
              formFieldInput:
                "bg-black border-outline/20 text-text focus:ring-primary/50",
              formButtonPrimary:
                "bg-gradient-to-r from-primary to-primary-dim hover:opacity-90 text-background font-bold",
              footerActionLink: "text-primary hover:text-primary-light",
              dividerLine: "bg-outline/20",
              dividerText: "text-text-muted",
              identityPreviewEditButton: "text-primary",
              formFieldAction: "text-primary",
              alertText: "text-error",
              footer: "hidden",
            },
          }}
        />
      </div>

      {/* Footer */}
      <p className="mt-8 text-sm text-text-muted">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="text-primary font-bold hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
