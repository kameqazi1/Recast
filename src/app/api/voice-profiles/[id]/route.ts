import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { voiceProfiles } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { name, tone, exampleOutput, avoidWords, isDefault } = body;

  // Verify ownership
  const [profile] = await db
    .select()
    .from(voiceProfiles)
    .where(and(eq(voiceProfiles.id, id), eq(voiceProfiles.userId, userId)))
    .limit(1);

  if (!profile) {
    return Response.json({ error: "Profile not found" }, { status: 404 });
  }

  // If setting as default, unset others
  if (isDefault && !profile.isDefault) {
    await db
      .update(voiceProfiles)
      .set({ isDefault: false })
      .where(eq(voiceProfiles.userId, userId));
  }

  const [updated] = await db
    .update(voiceProfiles)
    .set({
      ...(name !== undefined && { name: name.trim() }),
      ...(tone !== undefined && { tone: tone?.trim() || null }),
      ...(exampleOutput !== undefined && {
        exampleOutput: exampleOutput?.trim() || null,
      }),
      ...(avoidWords !== undefined && {
        avoidWords: avoidWords?.trim() || null,
      }),
      ...(isDefault !== undefined && { isDefault }),
    })
    .where(eq(voiceProfiles.id, id))
    .returning();

  return Response.json({ profile: updated });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify ownership
  const [profile] = await db
    .select()
    .from(voiceProfiles)
    .where(and(eq(voiceProfiles.id, id), eq(voiceProfiles.userId, userId)))
    .limit(1);

  if (!profile) {
    return Response.json({ error: "Profile not found" }, { status: 404 });
  }

  // Check if it's the only profile
  const [{ count: profileCount }] = await db
    .select({ count: count() })
    .from(voiceProfiles)
    .where(eq(voiceProfiles.userId, userId));

  if (profileCount <= 1) {
    return Response.json(
      { error: "Cannot delete your only voice profile." },
      { status: 400 }
    );
  }

  // Delete — content_outputs FK is SET NULL
  await db.delete(voiceProfiles).where(eq(voiceProfiles.id, id));

  // If deleted profile was default, make another one default
  if (profile.isDefault) {
    const [next] = await db
      .select()
      .from(voiceProfiles)
      .where(eq(voiceProfiles.userId, userId))
      .limit(1);

    if (next) {
      await db
        .update(voiceProfiles)
        .set({ isDefault: true })
        .where(eq(voiceProfiles.id, next.id));
    }
  }

  return Response.json({ success: true });
}
