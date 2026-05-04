import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { businesses } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return Response.json({ error: "Slug required" }, { status: 400 });
  }

  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.slug, slug))
    .limit(1);

  if (!business) {
    return Response.json({ error: "Business not found" }, { status: 404 });
  }

  return Response.json(business);
}
