# Design System — Recast

## Product Context
- **What this is:** AI-powered podcast & video processing platform — upload episodes, get transcriptions, auto-detected clips, and video exports
- **Who it's for:** Podcasters, content creators, and media teams repurposing long-form content into short clips
- **Space/industry:** Creator tools (peers: Descript, Opus Clip, Riverside, Castmagic)
- **Project type:** Web app (landing page + authenticated dashboard)

## Aesthetic Direction
- **Direction:** Industrial/Utilitarian meets Luxury — a professional editing suite, not a toy
- **Decoration level:** Intentional — glassmorphism for floating elements, tonal layering for depth, no gratuitous decoration
- **Mood:** Cinematic, warm, precise. The UI feels like a professional control room with amber instrument lighting. Content is the protagonist.
- **Key principles:**
  - Tonal layering over borders — surface shifts define boundaries, not 1px lines
  - Glass panels for floating elements (playheads, transport bars, modals)
  - Editorial asymmetry — vary spacing to create rhythm, not uniform grids
  - No AI slop: no purple gradients, no 3-column icon grids, no "Built for X" copy

## Typography
- **Display/Hero:** Satoshi Black (900) — geometric, modern, distinctive. Not the default AI-generated pick. Use with tight letter-spacing (-0.04em) for cinematic impact.
- **Body:** DM Sans (400/500/600) — clean, excellent readability, great tabular-nums for data tables
- **UI/Labels:** DM Sans Semibold (600), 11px, uppercase, letter-spacing 0.1em
- **Data/Tables:** DM Mono (400) — monospace for timestamps, IDs, technical metadata
- **Code:** DM Mono
- **Loading:** Google Fonts — `Satoshi` via Fontshare API, `DM Sans` + `DM Mono` via Google Fonts
- **Scale:**
  - Display: 72px / 64px (hero headlines)
  - H1: 48px
  - H2: 32px
  - H3: 24px
  - H4: 18px
  - Body: 16px (default), 18px (large)
  - Label: 11px uppercase
  - Caption: 13px
  - Mono: 14px

## Color
- **Approach:** Restrained — amber is rare and meaningful, used for interactive elements and emphasis only
- **Primary:** #F59E0B (Warm Amber) — premium, cinematic, unique in the podcast tool space
- **Primary Dim:** #D97706 — gradient endpoint, hover states
- **Primary Light:** #FDE68A — subtle highlights, selection backgrounds
- **Secondary:** #FB923C (Warm Orange) — complementary accent, sparingly used
- **Neutrals (cool grays):**
  - Background: #0E0E10
  - Surface Low: #131315
  - Surface: #19191C
  - Surface High: #1F1F22
  - Surface Highest: #262528
  - Surface Bright: #2C2C2F
  - Outline: #48474A
  - Text Muted: #ACAAAD
  - Text: #F6F3F5 (never pure white)
- **Semantic:**
  - Success: #34D399
  - Warning: #FBBF24
  - Error: #FF6E84
  - Info: #F59E0B (uses primary)
- **Gradient:** `linear-gradient(135deg, #F59E0B, #D97706)` — signature gradient for primary CTAs only
- **Glow:** `box-shadow: 0 0 40px 8px rgba(245, 158, 11, 0.08)` — ambient glow for elevated elements
- **Dark mode:** This IS the dark mode. Light mode is not planned for v1.

### CRITICAL: Text Visibility Rule
**All text must be white (#F6F3F5) by default.** This is a dark-mode-only app on a near-black background. Any text that is not explicitly a secondary/muted element MUST use #F6F3F5 (text) for maximum visibility. This includes:
- All headings, labels, body text, input text, button text on dark backgrounds
- Placeholder text in inputs: use #ACAAAD minimum (never darker)
- Third-party component text (Clerk, etc): force override to #F6F3F5 with !important if needed
- Social login buttons, form labels, footer text, divider text: all #F6F3F5
- Only use #ACAAAD (text-muted) for intentionally de-emphasized secondary info
- **Never leave text at a third-party default color** — dark-on-dark is invisible and unacceptable

## Spacing
- **Base unit:** 4px
- **Density:** Comfortable — generous whitespace, editorial breathing room
- **Scale:** 2xs(2px) xs(4px) sm(8px) md(16px) lg(24px) xl(32px) 2xl(48px) 3xl(64px) 4xl(80px)
- **Editorial rhythm:** Vary section padding — don't use uniform spacing. Hero: 80px, features: 64px, tighter sections: 48px. The variation creates visual rhythm.

## Layout
- **Approach:** Hybrid — grid-disciplined for dashboard, creative-editorial for landing/marketing
- **Grid:** 12 columns, responsive breakpoints at sm(640) md(768) lg(1024) xl(1280) 2xl(1536)
- **Max content width:** 1200px (7xl)
- **Sidebar:** 256px fixed left, bg surface-low
- **Border radius:**
  - sm: 4px (badges, small elements)
  - md: 8px (buttons, inputs, small cards)
  - lg: 12px (cards, panels, containers)
  - xl: 16px (large cards, sections)
  - 2xl: 24px (hero sections, modals)
  - full: 9999px (pills, avatars, status dots)

## Motion
- **Approach:** Minimal-functional — only transitions that aid comprehension
- **Easing:** enter(ease-out) exit(ease-in) move(ease-in-out)
- **Duration:** micro(100ms) short(150ms) medium(200ms) long(300ms)
- **Patterns:**
  - Hover: scale(1.02) for CTAs, background-color shift for nav items
  - Active: scale(0.98) for press feedback
  - Glass panels: backdrop-filter blur(20px)
  - No entrance animations, no scroll-driven effects for v1

## Component Patterns (from Stitch screens — keep these)
- **Glass panel:** `background: rgba(31,31,34,0.7); backdrop-filter: blur(20px)` — for floating elements
- **Status badges:** Pill shape, dot + text, colored by semantic palette
- **Stat cards:** Icon in tinted background box, label above, large number below
- **Episode table:** Thumbnail + title + meta, hover highlights row
- **Transcript view:** Timestamp (mono, muted) + speaker label (colored) + dialogue text
- **Floating transport:** Glass panel at bottom of viewport for media playback

## Decisions Log
| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-24 | Warm amber (#F59E0B) over purple | Purple is the #1 AI-generated design tell. Every competitor uses blue/teal/orange — amber is unique in the space and reads as premium/cinematic. |
| 2026-03-24 | Satoshi + DM Sans over Manrope + Inter | Manrope is overused in AI-generated designs. Satoshi is geometric and distinctive for headlines; DM Sans has superior tabular-nums for data-heavy dashboard. |
| 2026-03-24 | Tonal layering, no 1px borders | Surface color shifts define boundaries — more sophisticated than visible borders, consistent with professional editing tool aesthetic. |
| 2026-03-24 | Dark mode only for v1 | Media tools are used in dark environments. Every competitor defaults to dark. Light mode deferred to post-launch. |
| 2026-03-24 | Border radius 8-12px default | Stitch generated 2px radius — too sharp for a creative tool. 8-12px adds warmth and approachability. |
