import { DeepgramClient } from "@deepgram/sdk";

export const deepgram = new DeepgramClient({
  apiKey: process.env.DEEPGRAM_API_KEY!,
});
