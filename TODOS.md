# TODOS

## Phase 1

### ~~Inngest step timeout handling~~ (DONE — bundled into Content Engine PR)
Bundled into the Content Engine implementation. Timeouts added for all steps: transcription 10min, clip detection 5min, LLM blog post 90s, LLM tweet/show notes/newsletter 60s.

### S3/R2 lifecycle policy for uploaded files
Configure automatic deletion of uploaded audio/video files after processing. Free tier: 7 days, paid: 30 days. Keep processed clips (smaller) indefinitely. Without cleanup, storage costs grow linearly with users (~1GB per video episode). Configure during R2 setup using Cloudflare lifecycle rules.

## Content Engine — Post-Implementation

### Verify Inngest parallel step execution
**Why:** `Promise.all()` with `step.run()` may execute sequentially due to Inngest step memoization. If so, content generation takes 3-5 min instead of ~90s. **How:** Wrap 4 `step.run()` calls in `Promise.all`, log timestamps, check if they overlap. If sequential, refactor to `step.invoke()` fan-out to separate child functions. **Depends on:** Content generation Inngest step implementation. **Added:** 2026-03-26 via /plan-eng-review.

### Add client-side polling timeout + backoff
**Why:** The 5-second polling for content generation status has no maximum duration. A stuck format = infinite polling. **How:** Add `maxPollDuration: 120000` (2 min) and backoff to 10s after 30s. Show timeout error if polling exceeds max. **Depends on:** Episode detail page Content tab. **Added:** 2026-03-26 via /plan-eng-review.

### Benchmark real transcript token counts
**Why:** Cost model may be 2-3x too optimistic. Real transcripts from the existing pipeline would give accurate token counts and inform the free tier limit. **How:** Run the Anthropic tokenizer on 3-5 real transcripts of varying length (30min, 60min, 90min+). Update cost model and free tier limit. **Depends on:** Having real transcripts in the database. **Added:** 2026-03-26 via /plan-eng-review.
