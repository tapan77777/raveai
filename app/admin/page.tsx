import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { businesses, reviews } from "@/lib/schema";
import { count, avg } from "drizzle-orm";
import Link from "next/link";
import { SignOutButton } from "@clerk/nextjs";

const ADMIN_USER_ID = process.env.ADMIN_USER_ID;

export default async function AdminPage() {
  const { userId } = await auth();

  if (!userId || userId !== ADMIN_USER_ID) {
    redirect("/dashboard");
  }

  const allBusinesses = await db.select().from(businesses);
  const [totalReviews] = await db.select({ count: count() }).from(reviews);
  const [avgRating] = await db.select({ avg: avg(reviews.rating) }).from(reviews);

  const businessIds = allBusinesses.map((b) => b.id);

  // Reviews per business
  const reviewCountsRaw = businessIds.length > 0
    ? await db
        .select({ businessId: reviews.businessId, count: count() })
        .from(reviews)
        .groupBy(reviews.businessId)
    : [];

  const reviewCountMap = Object.fromEntries(
    reviewCountsRaw.map((r) => [r.businessId, r.count])
  );

  return (
    <div className="min-h-screen bg-[#050714] text-white">
      <header className="sticky top-0 z-40 border-b border-white/5 backdrop-blur-md bg-[#050714]/80">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-sm font-bold">
              R
            </div>
            <span className="font-semibold">RaveAI</span>
            <span className="text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-white/50 hover:text-white transition-colors">
              Dashboard
            </Link>
            <SignOutButton>
              <button className="text-sm text-white/50 hover:text-white transition-colors">Sign out</button>
            </SignOutButton>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Admin Panel</h1>
          <p className="text-white/40 text-sm">Platform overview</p>
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Businesses", value: allBusinesses.length, icon: "🏪" },
            { label: "Total Reviews", value: totalReviews.count, icon: "⭐" },
            {
              label: "Avg Platform Rating",
              value: avgRating.avg ? parseFloat(avgRating.avg as string).toFixed(1) : "—",
              icon: "📊",
            },
          ].map((s) => (
            <div key={s.label} className="glass-card rounded-2xl p-6">
              <div className="text-3xl mb-3">{s.icon}</div>
              <div className="text-3xl font-bold">{s.value}</div>
              <div className="text-white/40 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Revenue Tracking (Manual) */}
        <div className="glass-card rounded-2xl p-6 border border-yellow-500/10">
          <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
            💰 Revenue Tracking
            <span className="text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 px-2 py-0.5 rounded-full">Manual</span>
          </h2>
          <p className="text-white/40 text-sm">
            Manual revenue tracking coming soon. Connect Stripe or Razorpay to automate.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            {[
              { label: "MRR", value: "—" },
              { label: "Total Revenue", value: "—" },
              { label: "Paying Businesses", value: "—" },
            ].map((m) => (
              <div key={m.label} className="bg-white/5 rounded-xl p-3">
                <div className="text-xl font-bold text-yellow-300">{m.value}</div>
                <div className="text-xs text-white/30 mt-1">{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Businesses List */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-semibold text-lg mb-4">🏪 All Businesses ({allBusinesses.length})</h2>
          {allBusinesses.length === 0 ? (
            <p className="text-white/40 text-sm">No businesses yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-2 text-white/40 font-medium">Business</th>
                    <th className="text-left py-3 px-2 text-white/40 font-medium">Type</th>
                    <th className="text-left py-3 px-2 text-white/40 font-medium">Slug</th>
                    <th className="text-right py-3 px-2 text-white/40 font-medium">Reviews</th>
                    <th className="text-right py-3 px-2 text-white/40 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {allBusinesses.map((b) => (
                    <tr key={b.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                      <td className="py-3 px-2 font-medium">{b.name}</td>
                      <td className="py-3 px-2 text-white/50 capitalize">{b.type}</td>
                      <td className="py-3 px-2">
                        <Link
                          href={`/r/${b.slug}`}
                          className="text-violet-400 hover:text-violet-300 font-mono text-xs"
                          target="_blank"
                        >
                          /r/{b.slug}
                        </Link>
                      </td>
                      <td className="py-3 px-2 text-right text-white/70">
                        {reviewCountMap[b.id] ?? 0}
                      </td>
                      <td className="py-3 px-2 text-right text-white/30 text-xs">
                        {new Date(b.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
