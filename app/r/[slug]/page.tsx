import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { businesses } from "@/lib/schema";
import { eq } from "drizzle-orm";
import ReviewFlow from "./ReviewFlow";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.slug, slug))
    .limit(1);

  if (!business) {
    notFound();
  }

  return <ReviewFlow business={business} />;
}
