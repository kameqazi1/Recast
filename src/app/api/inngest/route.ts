import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { processEpisode } from "@/inngest/process-episode";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [processEpisode],
});
