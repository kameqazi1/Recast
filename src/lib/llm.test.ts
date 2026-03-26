import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the Anthropic SDK
vi.mock("@anthropic-ai/sdk", () => {
  class MockAnthropic {
    messages = {
      create: vi.fn().mockResolvedValue({
        content: [{ type: "text", text: "Generated content here" }],
      }),
    };
  }
  return { default: MockAnthropic };
});

import { generateContent, type ContentFormat, type VoiceProfile } from "./llm";

describe("generateContent", () => {
  const mockVoice: VoiceProfile = {
    tone: "Casual and friendly",
    exampleOutput: "Here's my example post about tech...",
    avoidWords: "leverage, synergy",
  };

  const shortTranscript = "This is a short podcast transcript about AI. ".repeat(50);

  it("generates blog post content", async () => {
    const result = await generateContent(shortTranscript, "blog_post", mockVoice);
    expect(result.content).toBeDefined();
    expect(result.content.length).toBeGreaterThan(0);
    expect(result.wordCount).toBeGreaterThan(0);
  });

  it("generates tweet thread content", async () => {
    const result = await generateContent(shortTranscript, "tweet_thread", mockVoice);
    expect(result.content).toBeDefined();
    expect(result.wordCount).toBeGreaterThan(0);
  });

  it("generates show notes content", async () => {
    const result = await generateContent(shortTranscript, "show_notes", mockVoice);
    expect(result.content).toBeDefined();
    expect(result.wordCount).toBeGreaterThan(0);
  });

  it("generates newsletter content", async () => {
    const result = await generateContent(shortTranscript, "newsletter", mockVoice);
    expect(result.content).toBeDefined();
    expect(result.wordCount).toBeGreaterThan(0);
  });

  it("handles empty voice profile fields", async () => {
    const emptyVoice: VoiceProfile = {
      tone: null,
      exampleOutput: null,
      avoidWords: null,
    };
    const result = await generateContent(shortTranscript, "blog_post", emptyVoice);
    expect(result.content).toBeDefined();
  });

  it("handles empty transcript", async () => {
    const result = await generateContent("", "blog_post", mockVoice);
    expect(result.content).toBeDefined();
  });

  it("pre-summarizes long transcripts", async () => {
    // Create a transcript longer than MAX_TRANSCRIPT_CHARS (60000)
    const longTranscript = "This is a very long transcript. ".repeat(3000);
    expect(longTranscript.length).toBeGreaterThan(60000);

    const result = await generateContent(longTranscript, "blog_post", mockVoice);
    expect(result.content).toBeDefined();
  });

  it("counts words correctly", async () => {
    const result = await generateContent(shortTranscript, "blog_post", mockVoice);
    // "Generated content here" = 3 words
    expect(result.wordCount).toBe(3);
  });
});

describe("generateContent function shape", () => {
  it("is an async function", () => {
    expect(typeof generateContent).toBe("function");
  });

  it("returns content and wordCount", async () => {
    const result = await generateContent("test transcript", "blog_post", {
      tone: null,
      exampleOutput: null,
      avoidWords: null,
    });
    expect(result).toHaveProperty("content");
    expect(result).toHaveProperty("wordCount");
    expect(typeof result.content).toBe("string");
    expect(typeof result.wordCount).toBe("number");
  });
});
