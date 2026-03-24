import { auth } from "@clerk/nextjs/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2, R2_BUCKET } from "@/lib/r2";
import { db } from "@/db";
import { episodes } from "@/db/schema";
import { checkR2Usage } from "@/lib/usage-guard";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { filename, contentType, title, fileSize } = await req.json();

  if (!filename || !contentType) {
    return Response.json(
      { error: "filename and contentType are required" },
      { status: 400 }
    );
  }

  // Check R2 free tier limits
  const r2Check = await checkR2Usage(fileSize || 0);
  if (!r2Check.allowed) {
    return Response.json(
      {
        error: "free_tier_limit",
        message: `Cloudflare R2 free tier limit approaching. Current storage: ${(r2Check.current / 1024 / 1024 / 1024).toFixed(2)}GB of ${(r2Check.limit / 1024 / 1024 / 1024).toFixed(0)}GB. Please approve this upload or upgrade your plan.`,
        requiresApproval: true,
      },
      { status: 429 }
    );
  }

  // Create episode record
  const [episode] = await db
    .insert(episodes)
    .values({
      userId,
      title: title || filename.replace(/\.[^/.]+$/, ""),
      status: "uploading",
    })
    .returning();

  // Generate presigned URL for direct upload to R2
  const key = `uploads/${userId}/${episode.id}/${filename}`;
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const presignedUrl = await getSignedUrl(r2, command, { expiresIn: 3600 });

  return Response.json({
    uploadUrl: presignedUrl,
    episodeId: episode.id,
    key,
  });
}
