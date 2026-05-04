import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { db } from "@/lib/db";
import { businesses } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const businessId = formData.get("businessId") as string | null;

  if (!file || !businessId) {
    return Response.json({ error: "Missing file or businessId" }, { status: 400 });
  }

  const [business] = await db
    .select({ id: businesses.id })
    .from(businesses)
    .where(and(eq(businesses.id, businessId), eq(businesses.ownerId, userId)));

  if (!business) {
    return Response.json({ error: "Business not found" }, { status: 404 });
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const fileName = `${businessId}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error } = await supabase.storage
    .from("logo-business")
    .upload(fileName, arrayBuffer, { contentType: file.type, upsert: true });

  if (error) {
    console.error("[upload-logo] storage error:", error);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }

  const { data } = supabase.storage.from("logo-business").getPublicUrl(fileName);
  const logoUrl = data.publicUrl;

  await db.update(businesses).set({ logoUrl }).where(eq(businesses.id, businessId));

  return Response.json({ logoUrl });
}
