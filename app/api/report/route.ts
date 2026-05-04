import { auth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { businesses, reviews } from "@/lib/schema";
import { eq, and, gte, lt } from "drizzle-orm";

function weekStart(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  date.setDate(date.getDate() - day + (day === 0 ? -6 : 1));
  date.setHours(0, 0, 0, 0);
  return date;
}

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const businessId = searchParams.get("businessId");
  const period = searchParams.get("period") as "week" | "month" | null;

  if (!businessId || !period) {
    return Response.json({ error: "Missing params" }, { status: 400 });
  }

  const [biz] = await db
    .select({ id: businesses.id, name: businesses.name })
    .from(businesses)
    .where(and(eq(businesses.id, businessId), eq(businesses.ownerId, userId)));

  if (!biz) return Response.json({ error: "Not found" }, { status: 404 });

  const now = new Date();
  let periodStart: Date;
  let prevStart: Date;
  let prevEnd: Date;

  if (period === "week") {
    periodStart = weekStart(now);
    prevEnd = new Date(periodStart);
    prevStart = new Date(periodStart);
    prevStart.setDate(prevStart.getDate() - 7);
  } else {
    periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    prevEnd = new Date(periodStart);
  }

  const current = await db
    .select()
    .from(reviews)
    .where(and(eq(reviews.businessId, businessId), gte(reviews.createdAt, periodStart)));

  const [prevRow] = await db
    .select({ count: db.$count(reviews, and(eq(reviews.businessId, businessId), gte(reviews.createdAt, prevStart), lt(reviews.createdAt, prevEnd))) })
    .from(businesses)
    .where(eq(businesses.id, businessId));

  const pub = current.filter((r) => !r.isPrivate);
  const total = pub.length;
  const avgRating = total > 0 ? pub.reduce((s, r) => s + r.rating, 0) / total : null;

  const ratingBreakdown = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: pub.filter((r) => r.rating === rating).length,
  }));

  const tagMap = new Map<string, number>();
  for (const r of pub) {
    for (const tag of r.tags ?? []) tagMap.set(tag, (tagMap.get(tag) ?? 0) + 1);
  }
  const topTags = [...tagMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag, count]) => ({ tag, count }));

  const recentReviews = pub
    .filter((r) => r.generatedReview)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 3)
    .map((r) => ({ rating: r.rating, text: r.generatedReview!, createdAt: r.createdAt.toISOString() }));

  const prevTotal = Number(prevRow?.count ?? 0);
  const trend = prevTotal === 0 ? null : Math.round(((total - prevTotal) / prevTotal) * 100);

  let bestWeek = null;
  if (period === "month") {
    const wkMap = new Map<string, number>();
    for (const r of pub) {
      const k = weekStart(r.createdAt).toISOString();
      wkMap.set(k, (wkMap.get(k) ?? 0) + 1);
    }
    if (wkMap.size > 0) {
      const [key, count] = [...wkMap.entries()].sort((a, b) => b[1] - a[1])[0];
      const d = new Date(key);
      bestWeek = {
        label: `Week of ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
        count,
      };
    }
  }

  const periodLabel =
    period === "week"
      ? `Week of ${periodStart.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
      : `${periodStart.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`;

  return Response.json({
    businessName: biz.name,
    period,
    periodLabel,
    totalReviews: total,
    avgRating,
    ratingBreakdown,
    topTags,
    recentReviews,
    privateFeedbackCount: current.filter((r) => r.isPrivate).length,
    previousPeriodTotal: prevTotal,
    trend,
    bestWeek,
  });
}
