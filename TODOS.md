# TODOS

## Phase 1

### Inngest step timeout handling
Add explicit timeout configuration for each Inngest step and a failure handler that marks the job as failed + notifies the user. Without this, a hung API call or very long episode could leave the user with no feedback. Inngest supports `step.run()` with timeout options — set transcription: 10min, clip detection: 5min/chunk, video extraction: 10min. Depends on Inngest integration.

### S3/R2 lifecycle policy for uploaded files
Configure automatic deletion of uploaded audio/video files after processing. Free tier: 7 days, paid: 30 days. Keep processed clips (smaller) indefinitely. Without cleanup, storage costs grow linearly with users (~1GB per video episode). Configure during R2 setup using Cloudflare lifecycle rules.
