import { auth } from "@clerk/nextjs/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2, R2_BUCKET } from "@/lib/r2";
import { db } from "@/db";
import { episodes } from "@/db/schema";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { filename, contentType, title } = await req.json();

  if (!filename || !contentType) {
    return Response.json(
      { error: "filename and contentType are required" },
      { status: 400 }
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
