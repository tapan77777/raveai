import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { businesses, reviews } from "@/lib/schema";
import { eq, and, gte, count, avg, sql } from "drizzle-orm";
import { getStartOfWeek, getStartOfMonth } from "@/lib/utils";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import CopyLinkButton from "@/components/CopyLinkButton";
import { SignOutButton } from "@clerk/nextjs";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const userBusinesses = await db
    .select()
    .from(businesses)
    .where(eq(businesses.ownerId, userId));

  const business = userBusinesses[0] ?? null;

  let stats = null;
  let privateFeedback: typeof reviews.$inferSelect[] = [];

  if (business) {
    const weekStart = getStartOfWeek();
    const monthStart = getStartOfMonth();

    const [weeklyCount] = await db
      .select({ count: count() })
      .from(reviews)
      .where(and(eq(reviews.businessId, business.id), gte(reviews.createdAt, weekStart)));

    const [monthlyCount] = await db
      .select({ count: count() })
      .from(reviews)
      .where(and(eq(reviews.businessId, business.id), gte(reviews.createdAt, monthStart)));

    const [avgRating] = await db
      .select({ avg: avg(reviews.rating) })
      .from(reviews)
      .where(eq(reviews.businessId, business.id));

    const platformStats = await db
      .select({ platform: reviews.platformClicked, count: count() })
      .from(reviews)
      .where(and(eq(reviews.businessId, business.id), sql`${reviews.platformClicked} IS NOT NULL`))
      .groupBy(reviews.platformClicked);

    privateFeedback = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.businessId, business.id), eq(reviews.isPrivate, true)))
      .orderBy(sql`${reviews.createdAt} DESC`)
      .limit(20);

    stats = {
      weeklyReviews: weeklyCount.count,
      monthlyReviews: monthlyCount.count,
      avgRating: avgRating.avg ? parseFloat(avgRating.avg as string).toFixed(1) : null,
      platformStats,
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://raveai.app";
  const reviewUrl = business ? `${baseUrl}/r/${business.slug}` : null;

  const platformIcons: Record<string, string> = {
    google: "🔍",
    mmt: "🏨",
    tripadvisor: "✈️",
    whatsapp: "💬",
  };

  return (
    <div className="min-h-screen bg-[#050714] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/5 backdrop-blur-md bg-[#050714]/80">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-sm font-bold">
              R
            </div>
            <span className="font-semibold text-lg">RaveAI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-white/50 hover:text-white transition-colors">
              Home
            </Link>
            <SignOutButton>
              <button className="text-sm text-white/50 hover:text-white transition-colors">
                Sign out
              </button>
            </SignOutButton>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Welcome */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
          <p className="text-white/40 text-sm">
            {business ? `Managing ${business.name}` : "Get started by adding your business"}
          </p>
        </div>

        {!business ? (
          /* No business yet */
          <div className="glass-card rounded-2xl p-8 text-center animate-fade-in">
            <div className="text-5xl mb-4">🏪</div>
            <h2 className="text-xl font-semibold mb-2">Add your first business</h2>
            <p className="text-white/40 text-sm mb-6">
              Set up your business to start collecting AI-powered reviews
            </p>
            <Link
              href="/dashboard/add-business"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold px-6 py-3 rounded-xl transition-all"
            >
              Add Business
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Link>
          </div>
        ) : (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in">
              {[
                { label: "This Week", value: stats?.weeklyReviews ?? 0, icon: "📅" },
                { label: "This Month", value: stats?.monthlyReviews ?? 0, icon: "📊" },
                { label: "Avg Rating", value: stats?.avgRating ?? "—", icon: "⭐" },
                { label: "Private Feedback", value: privateFeedback.length, icon: "🔒" },
              ].map((stat) => (
                <div key={stat.label} className="glass-card rounded-2xl p-4">
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-white/40 text-xs mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Business info + QR + Link */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              {/* Business Details */}
              <div className="glass-card rounded-2xl p-6">
                <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  🏪 Business Details
                </h2>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-white/40">Name</dt>
                    <dd className="font-medium">{business.name}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-white/40">Type</dt>
                    <dd className="font-medium capitalize">{business.type}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-white/40">Slug</dt>
                    <dd className="font-mono text-violet-300">{business.slug}</dd>
                  </div>
                  {business.googleMapsUrl && (
                    <div className="flex justify-between">
                      <dt className="text-white/40">Google Maps</dt>
                      <dd>
                        <a href={business.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 text-xs underline">
                          View
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* QR Code */}
              <div className="glass-card rounded-2xl p-6 flex flex-col items-center">
                <h2 className="font-semibold text-lg mb-4 self-start">📱 Your QR Code</h2>
                {reviewUrl && (
                  <QRCodeDisplay url={reviewUrl} businessName={business.name} />
                )}
              </div>
            </div>

            {/* Share Link */}
            {reviewUrl && (
              <div className="glass-card rounded-2xl p-6 animate-fade-in">
                <h2 className="font-semibold text-lg mb-4">🔗 Your Review Link</h2>
                <CopyLinkButton url={reviewUrl} />
                <p className="text-white/30 text-xs mt-3">
                  Share this link or QR code with customers — on receipts, table cards, or social media.
                </p>
              </div>
            )}

            {/* Platform Stats */}
            {stats && stats.platformStats.length > 0 && (
              <div className="glass-card rounded-2xl p-6 animate-fade-in">
                <h2 className="font-semibold text-lg mb-4">📈 Platform Clicks</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {stats.platformStats.map((p) => (
                    <div key={p.platform} className="text-center p-4 bg-white/5 rounded-xl">
                      <div className="text-3xl mb-2">{platformIcons[p.platform ?? ""] ?? "🔗"}</div>
                      <div className="text-xl font-bold">{p.count}</div>
                      <div className="text-white/40 text-xs capitalize mt-1">{p.platform}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Private Feedback */}
            {privateFeedback.length > 0 && (
              <div className="glass-card rounded-2xl p-6 animate-fade-in border border-red-500/10">
                <h2 className="font-semibold text-lg mb-1 flex items-center gap-2">
                  🔒 Private Feedback Inbox
                </h2>
                <p className="text-white/40 text-xs mb-4">
                  These customers left private feedback (1-2 stars). Respond personally.
                </p>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {privateFeedback.map((fb) => (
                    <div key={fb.id} className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium">
                          {"⭐".repeat(fb.rating)}
                        </span>
                        <span className="text-white/30 text-xs">
                          {new Date(fb.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-white/70 text-sm">{fb.privateFeedback || "No feedback provided"}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Add/Manage business CTA */}
        {business && (
          <div className="flex gap-3 pb-8 animate-fade-in">
            <Link
              href="/dashboard/add-business"
              className="text-sm text-white/50 hover:text-white border border-white/10 hover:border-white/20 px-4 py-2 rounded-xl transition-colors"
            >
              + Add Another Business
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
