import { auth } from "@clerk/nextjs/server";
import { getEpisodeById, getEpisodeContentOutputs } from "@/lib/queries";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const episode = await getEpisodeById(id, userId);

  if (!episode) {
    return Response.json({ error: "Episode not found" }, { status: 404 });
  }

  const outputs = await getEpisodeContentOutputs(id);
  return Response.json({ outputs });
}
