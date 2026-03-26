import Anthropic from "@anthropic-ai/sdk";

// LLM adapter — wraps Anthropic SDK so provider can be swapped later
//
// Processing flow:
//   transcript (text) ──► [summarize if >20k tokens] ──► format-specific prompt
//        ↓                                                      ↓
//   voice profile (tone, example, avoid words)            Claude Sonnet API
//        ↓                                                      ↓
//   system prompt assembly ◄───────────────────────────► generated content

const anthropic = new Anthropic();

const MODEL = "claude-sonnet-4-20250514";
const MAX_TRANSCRIPT_CHARS = 60000; // ~15k tokens, rough estimate
const SUMMARY_TARGET_CHARS = 20000; // ~5k tokens after summarization

export type ContentFormat =
  | "blog_post"
  | "tweet_thread"
  | "show_notes"
  | "newsletter";

export interface VoiceProfile {
  tone: string | null;
  exampleOutput: string | null;
  avoidWords: string | null;
}

function buildSystemPrompt(format: ContentFormat, voice: VoiceProfile): string {
  let prompt = `You are a professional content writer who repurposes podcast transcripts into high-quality written content. Your output should be ready to publish with minimal editing.`;

  if (voice.tone) {
    prompt += `\n\n## Tone & Style\n${voice.tone}`;
  }

  if (voice.avoidWords) {
    prompt += `\n\n## Words to Avoid\nNever use these words or phrases: ${voice.avoidWords}`;
  }

  if (voice.exampleOutput) {
    prompt += `\n\n## Style Example\nMatch the tone and style of this example:\n\n${voice.exampleOutput}`;
  }

  return prompt;
}

const FORMAT_INSTRUCTIONS: Record<ContentFormat, string> = {
  blog_post: `Convert this podcast transcript into a well-structured blog post.

Requirements:
- 800-1500 words
- Use clear H2 and H3 headers to organize sections
- Include an engaging introduction that hooks the reader
- Pull direct quotes from the transcript where impactful
- End with a clear takeaway or call-to-action
- SEO-friendly: use descriptive headers, natural keyword usage
- Output as Markdown`,

  tweet_thread: `Convert this podcast transcript into a compelling Twitter/X thread.

Requirements:
- 5-10 tweets in the thread
- First tweet is a strong hook that makes people want to read more
- Each tweet should stand alone but flow into the next
- Include key insights, surprising quotes, or contrarian takes from the episode
- Final tweet should be a CTA (subscribe, listen, share)
- Each tweet must be under 280 characters
- Format: number each tweet (1/, 2/, etc.)`,

  show_notes: `Convert this podcast transcript into structured show notes.

Requirements:
- Start with a 2-3 sentence episode summary
- List key topics discussed with approximate timestamps (extract from context clues in the transcript)
- Pull 3-5 notable quotes with speaker attribution if identifiable
- List any resources, tools, books, or links mentioned
- Include guest information if mentioned
- Keep it scannable — use bullet points and short paragraphs`,

  newsletter: `Convert this podcast transcript into a newsletter draft.

Requirements:
- 300-500 words
- Start with a personal, conversational intro (as if writing to subscribers)
- Highlight 2-3 key takeaways from the episode
- Include one compelling quote from the transcript
- End with a CTA to listen to the full episode
- Warm, direct tone — write like you're emailing a friend who's interested in this topic`,
};

async function summarizeTranscript(transcript: string): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `Summarize this podcast transcript into a detailed summary that preserves key topics, quotes, timestamps (if mentioned), speaker names, and main arguments. Keep it under 4000 words.\n\n${transcript}`,
        },
      ],
    });
    const block = response.content[0];
    return block.type === "text" ? block.text : transcript.slice(0, SUMMARY_TARGET_CHARS);
  } catch {
    // Fallback: truncate to target size if summarization fails
    return transcript.slice(0, SUMMARY_TARGET_CHARS);
  }
}

export async function generateContent(
  transcript: string,
  format: ContentFormat,
  voice: VoiceProfile
): Promise<{ content: string; wordCount: number }> {
  // Pre-summarize long transcripts to control cost and context window
  let processedTranscript = transcript;
  if (transcript.length > MAX_TRANSCRIPT_CHARS) {
    processedTranscript = await summarizeTranscript(transcript);
  }

  const systemPrompt = buildSystemPrompt(format, voice);
  const userPrompt = `${FORMAT_INSTRUCTIONS[format]}\n\n---\n\nTRANSCRIPT:\n${processedTranscript}`;

  const maxTokens =
    format === "blog_post" ? 3000 : format === "tweet_thread" ? 1500 : 1000;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const block = response.content[0];
  const content = block.type === "text" ? block.text : "";
  const wordCount = content.split(/\s+/).filter(Boolean).length;

  return { content, wordCount };
}
