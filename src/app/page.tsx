import Link from "next/link";
import {
  Captions,
  Sparkles,
  Share2,
  ArrowRight,
  Play,
  Grid3X3,
  Layers,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background font-display tracking-tight">
        <div className="flex justify-between items-center px-8 py-4 max-w-screen-2xl mx-auto">
          <div className="text-2xl font-black tracking-tighter text-text">
            Recast
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-primary font-bold border-b-2 border-primary pb-1"
            >
              Features
            </a>
            <a
              href="#"
              className="text-text-muted hover:text-text transition-colors"
            >
              Pricing
            </a>
            <Link
              href="/sign-in"
              className="text-text-muted hover:text-text transition-colors"
            >
              Login
            </Link>
          </div>
          <Link
            href="/dashboard"
            className="gradient-primary text-background px-6 py-2 rounded-full font-bold active:scale-95 transition-transform"
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-high border border-outline/15 mb-8">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-text-muted">
                AI-Powered Podcast Engine
              </span>
            </div>
            <h1 className="font-display text-5xl md:text-8xl font-black tracking-tighter text-text leading-[0.9] mb-8">
              Turn episodes into <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-dim">
                viral clips
              </span>
              , automatically
            </h1>
            <p className="max-w-2xl mx-auto text-text-muted text-lg md:text-xl font-light mb-12">
              AI-powered transcription, clip detection, and video extraction to
              grow your audience effortlessly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/dashboard"
                className="gradient-primary text-background px-10 py-4 rounded-full font-black text-lg active:scale-95 transition-transform glow-primary"
              >
                Get Started Free
              </Link>
              <button className="bg-surface-highest border border-outline/15 text-primary px-10 py-4 rounded-full font-bold text-lg hover:bg-surface-bright transition-all">
                Watch Demo
              </button>
            </div>
          </div>
          {/* Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-20">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary blur-[120px] rounded-full" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary blur-[120px] rounded-full" />
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-12 bg-surface-low border-y border-outline/10 overflow-hidden">
          <div className="max-w-7xl mx-auto px-8">
            <p className="text-center text-[10px] uppercase tracking-[0.2em] text-text-muted font-bold mb-8">
              Trusted by top creators
            </p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30">
              {["Creator Studio", "PodFlow", "AudioLab", "ClipMaster", "VoxMedia"].map(
                (name) => (
                  <div
                    key={name}
                    className="h-8 px-4 flex items-center text-text-muted font-display font-bold text-sm tracking-tight"
                  >
                    {name}
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        {/* Features Bento Grid */}
        <section id="features" className="py-24 md:py-40 max-w-7xl mx-auto px-8">
          <div className="mb-20">
            <span className="label-md text-primary font-bold">
              Capabilities
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-black mt-4">
              The Editor&apos;s Edge
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* AI Transcription */}
            <div className="md:col-span-8 bg-surface-low p-10 rounded-xl relative overflow-hidden group border border-transparent hover:border-outline/20 transition-all">
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <Captions
                    size={32}
                    className="text-primary mb-6"
                  />
                  <h3 className="text-3xl font-bold mb-4">
                    AI Transcription
                  </h3>
                  <p className="text-text-muted max-w-md text-lg">
                    Convert speech to text with 99% accuracy across 50+
                    languages. Perfect for captions, SEO, and deep search.
                  </p>
                </div>
                <div className="mt-12">
                  <div className="bg-black p-4 rounded-lg font-mono text-sm border border-outline/10 text-text-muted">
                    <span className="text-primary">[00:12:45]</span>{" "}
                    &ldquo;The future of content is modular. We need to rethink
                    how we distribute long-form media...&rdquo;
                  </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent" />
            </div>

            {/* Smart Clip Detection */}
            <div className="md:col-span-4 bg-surface-high p-10 rounded-xl flex flex-col justify-between glow-primary border border-outline/10">
              <div>
                <Sparkles
                  size={32}
                  className="text-secondary mb-6"
                />
                <h3 className="text-2xl font-bold mb-4">
                  Smart Clip Detection
                </h3>
                <p className="text-text-muted">
                  Our engine automatically identifies high-impact moments for
                  TikTok, Reels, and Shorts.
                </p>
              </div>
              <div className="mt-8 flex items-center justify-center">
                <div className="w-full h-32 bg-black rounded-lg overflow-hidden relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play size={40} className="text-primary/50" />
                  </div>
                  <div className="absolute bottom-0 left-0 h-1 gradient-primary w-3/4" />
                </div>
              </div>
            </div>

            {/* Video Export */}
            <div className="md:col-span-12 bg-surface p-12 rounded-xl border border-outline/15 relative overflow-hidden flex flex-col md:flex-row items-center gap-12">
              <div className="md:w-1/2">
                <Share2
                  size={32}
                  className="text-secondary mb-6"
                />
                <h3 className="text-3xl font-bold mb-4">Video Export</h3>
                <p className="text-text-muted text-lg">
                  One-click export to all social media platforms. Custom
                  templates, dynamic captions, and brand colors baked in
                  instantly.
                </p>
                <button className="mt-8 flex items-center gap-2 text-primary font-bold group">
                  Explore Export Options
                  <ArrowRight
                    size={16}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </div>
              <div className="md:w-1/2 grid grid-cols-3 gap-4">
                {[Play, Grid3X3, Layers].map((Icon, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-surface-high rounded-lg flex items-center justify-center border border-outline/10"
                  >
                    <Icon size={28} className="text-text-muted" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 md:py-40">
          <div className="max-w-5xl mx-auto px-8">
            <div className="bg-surface-highest p-12 md:p-24 rounded-3xl relative overflow-hidden border border-outline/20 text-center">
              <div className="relative z-10">
                <h2 className="font-display text-4xl md:text-6xl font-black tracking-tight mb-8">
                  Ready to amplify your voice?
                </h2>
                <p className="text-text-muted text-lg mb-12 max-w-xl mx-auto">
                  Join 5,000+ creators who are scaling their audience using
                  Recast&apos;s cinematic AI workflow.
                </p>
                <Link
                  href="/dashboard"
                  className="inline-block gradient-primary text-background px-12 py-5 rounded-full font-black text-xl active:scale-95 transition-transform"
                >
                  Get Started Free
                </Link>
              </div>
              <div className="absolute inset-0 pointer-events-none opacity-40">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.15),transparent_70%)]" />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-background w-full border-t border-outline/15">
        <div className="flex flex-col md:flex-row justify-between items-center px-8 py-12 w-full max-w-screen-2xl mx-auto">
          <div className="flex flex-col gap-4 mb-8 md:mb-0">
            <div className="text-lg font-display font-bold text-text">
              Recast
            </div>
            <p className="text-sm text-text-muted max-w-xs">
              &copy; 2024 Recast. The Cinematic Lens in Podcasting.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {["Features", "Pricing", "Privacy Policy", "Terms of Service", "Support"].map(
              (link) => (
                <a
                  key={link}
                  href="#"
                  className="text-sm text-text-muted hover:text-primary transition-colors"
                >
                  {link}
                </a>
              )
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
