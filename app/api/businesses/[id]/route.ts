import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { businesses } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const [deleted] = await db
    .delete(businesses)
    .where(and(eq(businesses.id, id), eq(businesses.ownerId, userId)))
    .returning({ id: businesses.id });

  if (!deleted) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json({ success: true });
}
