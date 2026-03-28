# Recast

## Deploy Configuration (configured by /setup-deploy)
- Platform: Render
- Production URL: https://www.getrecast.app
- Deploy workflow: auto-deploy on push to main
- Deploy status command: HTTP health check
- Merge method: merge commit
- Project type: web app
- Post-deploy health check: /api/health

### Custom deploy hooks
- Pre-merge: none
- Deploy trigger: automatic on push to main (Render auto-deploy)
- Deploy status: poll production URL until healthy
- Health check: https://www.getrecast.app/api/health

## Test Account (Clerk Dev Mode)
- Email: `recasttester2026@gmail.com`
- Password: `Recast!Test2026#`
- Username: `recast-tester`
- Clerk User ID: `user_3BZ5W8oHnhzR4PT8FXJSVFm2kES`
- Sign-in method: Use Clerk sign-in token API to bypass email verification (see `.env.local` for env vars `TEST_EMAIL`, `TEST_PASSWORD`)

## Domain Migration: getrecast.app

### What was already done (in code)
- Updated `CLAUDE.md` production URL and health check references
- Updated `.claude/settings.local.json` curl commands
- Added `metadataBase`, OpenGraph, and Twitter card metadata in `src/app/layout.tsx`
- No hardcoded domain references remain in source code

### What you need to do manually

#### 1. DNS Configuration
- Point `getrecast.app` to your Render service
- Add a **CNAME record**: `getrecast.app` → `recast-0efw.onrender.com`
- If using root domain (no www), your registrar may need an **ALIAS/ANAME** record instead

#### 2. Render Dashboard
- Go to your Render service → **Settings → Custom Domains**
- Add `getrecast.app` as a custom domain
- Render will auto-provision an SSL certificate via Let's Encrypt
- Optionally add `www.getrecast.app` and set up a redirect

#### 3. Clerk Dashboard
- Go to **Clerk Dashboard → Domains**
- Add `getrecast.app` as a production domain
- Update the **Home URL** and **Sign-in/Sign-up URLs** to use `https://www.getrecast.app`
- Generate new **production API keys** (publishable + secret) if switching from dev to prod
- Update `.env.local` (or Render env vars) with the production Clerk keys:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`

#### 4. Render Environment Variables
- In Render Dashboard → **Environment**, ensure all env vars from `.env.local` are set
- Update any callback URLs that reference the old domain

#### 5. Optional: Redirect old domain
- In Render, set up a redirect rule from `recast-0efw.onrender.com` → `https://www.getrecast.app` (301 permanent)

#### 6. Verify
- Visit `https://www.getrecast.app` — should load the landing page
- Visit `https://www.getrecast.app/api/health` — should return healthy
- Test sign-in/sign-up flow with the new domain
- Check OG tags: `curl -s https://www.getrecast.app | grep og:`

## Design System
Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.
