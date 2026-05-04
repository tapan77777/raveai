import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { businesses, reviews } from "@/lib/schema";
import { eq, and, gte, count, avg, sql } from "drizzle-orm";
import { getStartOfWeek, getStartOfMonth } from "@/lib/utils";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const userBusinesses = await db
    .select()
    .from(businesses)
    .where(eq(businesses.ownerId, userId));

  if (userBusinesses.length === 0) {
    return Response.json({ business: null, stats: null });
  }

  const business = userBusinesses[0];
  const weekStart = getStartOfWeek();
  const monthStart = getStartOfMonth();

  const [weeklyCount] = await db
    .select({ count: count() })
    .from(reviews)
    .where(
      and(
        eq(reviews.businessId, business.id),
        gte(reviews.createdAt, weekStart)
      )
    );

  const [monthlyCount] = await db
    .select({ count: count() })
    .from(reviews)
    .where(
      and(
        eq(reviews.businessId, business.id),
        gte(reviews.createdAt, monthStart)
      )
    );

  const [avgRating] = await db
    .select({ avg: avg(reviews.rating) })
    .from(reviews)
    .where(eq(reviews.businessId, business.id));

  const platformStats = await db
    .select({
      platform: reviews.platformClicked,
      count: count(),
    })
    .from(reviews)
    .where(
      and(
        eq(reviews.businessId, business.id),
        sql`${reviews.platformClicked} IS NOT NULL`
      )
    )
    .groupBy(reviews.platformClicked);

  const privateFeedback = await db
    .select()
    .from(reviews)
    .where(
      and(eq(reviews.businessId, business.id), eq(reviews.isPrivate, true))
    )
    .orderBy(sql`${reviews.createdAt} DESC`)
    .limit(20);

  return Response.json({
    business,
    stats: {
      weeklyReviews: weeklyCount.count,
      monthlyReviews: monthlyCount.count,
      avgRating: avgRating.avg ? parseFloat(avgRating.avg as string).toFixed(1) : null,
      platformStats,
    },
    privateFeedback,
  });
}
