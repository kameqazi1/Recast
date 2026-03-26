import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { voiceProfiles } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getUserVoiceProfiles } from "@/lib/queries";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profiles = await getUserVoiceProfiles(userId);
  return Response.json({ profiles });
}

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, tone, exampleOutput, avoidWords, isDefault } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }
  if (tone && tone.length > 500) {
    return Response.json({ error: "Tone must be under 500 characters" }, { status: 400 });
  }
  if (exampleOutput && exampleOutput.length > 2000) {
    return Response.json({ error: "Example output must be under 2000 characters" }, { status: 400 });
  }
  if (avoidWords && avoidWords.length > 500) {
    return Response.json({ error: "Avoid words must be under 500 characters" }, { status: 400 });
  }

  // If setting as default, unset other defaults first
  if (isDefault) {
    await db
      .update(voiceProfiles)
      .set({ isDefault: false })
      .where(eq(voiceProfiles.userId, userId));
  }

  const [created] = await db
    .insert(voiceProfiles)
    .values({
      userId,
      name: name.trim(),
      tone: tone?.trim() || null,
      exampleOutput: exampleOutput?.trim() || null,
      avoidWords: avoidWords?.trim() || null,
      isDefault: isDefault || false,
    })
    .returning();

  return Response.json({ profile: created }, { status: 201 });
}
