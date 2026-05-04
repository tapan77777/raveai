import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { businesses } from "@/lib/schema";
import { slugify } from "@/lib/utils";
import { eq } from "drizzle-orm";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const results = await db
    .select()
    .from(businesses)
    .where(eq(businesses.ownerId, userId));

  return Response.json(results);
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, type, googleMapsUrl, makemytripUrl, tripadvisorUrl } = body;

  if (!name || !type) {
    return Response.json({ error: "Name and type are required" }, { status: 400 });
  }

  const baseSlug = slugify(name);
  let slug = baseSlug;
  let attempt = 0;

  while (true) {
    const existing = await db
      .select({ id: businesses.id })
      .from(businesses)
      .where(eq(businesses.slug, slug))
      .limit(1);

    if (existing.length === 0) break;
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  const [business] = await db
    .insert(businesses)
    .values({
      ownerId: userId,
      name,
      slug,
      type,
      googleMapsUrl: googleMapsUrl || null,
      makemytripUrl: makemytripUrl || null,
      tripadvisorUrl: tripadvisorUrl || null,
    })
    .returning();

  return Response.json(business, { status: 201 });
}
