import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { businesses, reviews } from "@/lib/schema";
import { count, avg } from "drizzle-orm";

const ADMIN_USER_ID = process.env.ADMIN_USER_ID;

export async function GET() {
  const { userId } = await auth();

  if (!userId || userId !== ADMIN_USER_ID) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const allBusinesses = await db.select().from(businesses);

  const [totalReviews] = await db.select({ count: count() }).from(reviews);

  const [avgRating] = await db
    .select({ avg: avg(reviews.rating) })
    .from(reviews);

  return Response.json({
    businesses: allBusinesses,
    totalReviews: totalReviews.count,
    avgRating: avgRating.avg
      ? parseFloat(avgRating.avg as string).toFixed(1)
      : null,
  });
}
