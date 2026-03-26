import { describe, it, expect } from "vitest";
import {
  episodes,
  clips,
  usageLog,
  voiceProfiles,
  contentOutputs,
  userUsage,
  episodeStatusEnum,
  contentOutputFormatEnum,
  contentOutputStatusEnum,
} from "./schema";

describe("schema tables exist", () => {
  it("exports episodes table", () => {
    expect(episodes).toBeDefined();
  });

  it("exports clips table", () => {
    expect(clips).toBeDefined();
  });

  it("exports usageLog table", () => {
    expect(usageLog).toBeDefined();
  });

  it("exports voiceProfiles table", () => {
    expect(voiceProfiles).toBeDefined();
  });

  it("exports contentOutputs table", () => {
    expect(contentOutputs).toBeDefined();
  });

  it("exports userUsage table", () => {
    expect(userUsage).toBeDefined();
  });
});

describe("schema enums", () => {
  it("episodeStatusEnum has correct values", () => {
    expect(episodeStatusEnum.enumValues).toEqual([
      "uploading",
      "processing",
      "completed",
      "failed",
    ]);
  });

  it("contentOutputFormatEnum has correct values", () => {
    expect(contentOutputFormatEnum.enumValues).toEqual([
      "blog_post",
      "tweet_thread",
      "show_notes",
      "newsletter",
    ]);
  });

  it("contentOutputStatusEnum has correct values", () => {
    expect(contentOutputStatusEnum.enumValues).toEqual([
      "pending",
      "generating",
      "completed",
      "failed",
    ]);
  });
});
