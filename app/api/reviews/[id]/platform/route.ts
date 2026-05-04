import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { reviews } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { platformClicked } = body;

  await db
    .update(reviews)
    .set({ platformClicked })
    .where(eq(reviews.id, id));

  return Response.json({ success: true });
}
