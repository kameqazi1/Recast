# Changelog

All notable changes to Recast will be documented in this file.

## [0.2.0.0] - 2026-03-26

### Added
- Content Engine: auto-generate blog posts, tweet threads, show notes, and newsletter drafts from episode transcripts
- Voice Profiles: configure tone, example output, and words to avoid so generated content sounds like you
- LLM integration via Anthropic Claude API with adapter pattern for provider flexibility
- Per-user usage tracking with free tier guardrails (40 generations/month)
- Content tab on episode detail page with format grid, tabbed viewer, copy-to-clipboard, and markdown download
- Regenerate individual content formats with optional voice profile selection
- Manual content generation for existing episodes via "Generate Content" button
- Parallel content generation using Inngest fan-out (all 4 formats simultaneously)
- Polling UI with automatic backoff for real-time status updates during generation
- Database index on content_outputs(episode_id, status) for efficient polling queries
- Vitest test framework with 27 tests across schema, LLM adapter, and usage guard
- Inngest step timeouts for all pipeline steps (transcription 10min, clip detection 5min, LLM 60-90s)

### Changed
- Settings page now includes Voice Profiles management section above Clerk account settings
- Episode detail page has new "Content" tab alongside Transcript, Clips, and Settings
