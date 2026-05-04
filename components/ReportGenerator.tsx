"use client";

import { useRef, useState, useCallback } from "react";

interface ReportData {
  businessName: string;
  period: "week" | "month";
  periodLabel: string;
  totalReviews: number;
  avgRating: number | null;
  ratingBreakdown: { rating: number; count: number }[];
  topTags: { tag: string; count: number }[];
  recentReviews: { rating: number; text: string; createdAt: string }[];
  privateFeedbackCount: number;
  previousPeriodTotal: number;
  trend: number | null;
  bestWeek: { label: string; count: number } | null;
}

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span style={{ color: "#F59E0B", fontSize: size, lineHeight: 1 }}>
      {"★".repeat(Math.round(rating))}{"☆".repeat(5 - Math.round(rating))}
    </span>
  );
}

function ReportCard({ data }: { data: ReportData }) {
  const max = Math.max(...data.ratingBreakdown.map((r) => r.count), 1);

  const trendColor = data.trend === null ? "#9ca3af" : data.trend > 0 ? "#34d399" : "#f87171";
  const trendLabel = data.trend === null ? "No prior data"
    : data.trend > 0 ? `↑ ${data.trend}% vs last ${data.period}`
    : data.trend < 0 ? `↓ ${Math.abs(data.trend)}% vs last ${data.period}`
    : `Same as last ${data.period}`;

  return (
    <div style={{
      width: 420,
      background: "#050714",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
      color: "#ffffff",
      borderRadius: 16,
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1a1040 0%, #2d1b69 60%, #1a1040 100%)",
        padding: "24px 28px 20px",
        borderBottom: "1px solid rgba(124,58,237,0.3)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6,
            background: "linear-gradient(135deg, #7C3AED, #a78bfa)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 800, color: "#fff" }}>R</div>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: "1px", textTransform: "uppercase" }}>
            RaveAI {data.period === "week" ? "Weekly" : "Monthly"} Report
          </span>
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#ffffff", marginBottom: 4, letterSpacing: "-0.3px" }}>
          {data.businessName}
        </div>
        <div style={{ fontSize: 13, color: "rgba(167,139,250,0.9)" }}>{data.periodLabel}</div>
      </div>

      <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 18 }}>
        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {/* Reviews */}
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12, padding: "14px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#ffffff", lineHeight: 1 }}>
              {data.totalReviews}
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Reviews
            </div>
          </div>
          {/* Avg rating */}
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12, padding: "14px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#F59E0B", lineHeight: 1 }}>
              {data.avgRating ? data.avgRating.toFixed(1) : "—"}
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Avg Rating
            </div>
          </div>
          {/* Trend */}
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12, padding: "14px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: trendColor, lineHeight: 1, marginTop: 4 }}>
              {data.trend === null ? "—" : `${data.trend > 0 ? "+" : ""}${data.trend}%`}
            </div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              vs Prior
            </div>
          </div>
        </div>

        {/* Trend label */}
        <div style={{ fontSize: 11, color: trendColor, textAlign: "center", marginTop: -8 }}>
          {trendLabel}
        </div>

        {/* Best week (monthly only) */}
        {data.bestWeek && (
          <div style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)",
            borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 10, color: "rgba(167,139,250,0.7)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 3 }}>
                Best Week
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#ffffff" }}>{data.bestWeek.label}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#a78bfa" }}>{data.bestWeek.count}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>reviews</div>
            </div>
          </div>
        )}

        {/* Rating breakdown */}
        <div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase",
            letterSpacing: "0.8px", marginBottom: 10 }}>Rating Breakdown</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {data.ratingBreakdown.map(({ rating, count }) => (
              <div key={rating} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 22, textAlign: "right", fontSize: 12, fontWeight: 700,
                  color: "rgba(255,255,255,0.7)", flexShrink: 0 }}>{rating}★</div>
                <div style={{ flex: 1, height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 4,
                    width: max > 0 ? `${(count / max) * 100}%` : "0%",
                    background: rating >= 4 ? "#7C3AED" : rating === 3 ? "#F59E0B" : "#ef4444",
                    transition: "width 0.3s",
                  }} />
                </div>
                <div style={{ width: 26, textAlign: "right", fontSize: 12, color: "rgba(255,255,255,0.5)", flexShrink: 0 }}>
                  {count}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top tags */}
        {data.topTags.length > 0 && (
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase",
              letterSpacing: "0.8px", marginBottom: 10 }}>Top Customer Tags</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {data.topTags.map(({ tag, count }) => (
                <span key={tag} style={{
                  background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)",
                  borderRadius: 8, padding: "4px 10px", fontSize: 11,
                  color: "rgba(167,139,250,0.9)", display: "inline-flex", alignItems: "center", gap: 4,
                }}>
                  {tag}
                  <span style={{ color: "rgba(167,139,250,0.5)", fontSize: 10 }}>·{count}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recent reviews */}
        {data.recentReviews.length > 0 && (
          <div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase",
              letterSpacing: "0.8px", marginBottom: 10 }}>Recent Reviews</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {data.recentReviews.map((r, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "10px 14px" }}>
                  <div style={{ marginBottom: 5 }}>
                    <Stars rating={r.rating} size={12} />
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.5,
                    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    "{r.text}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Private feedback count */}
        {data.privateFeedbackCount > 0 && (
          <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)",
            borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14 }}>🔒</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
              {data.privateFeedbackCount} private feedback {data.privateFeedbackCount === 1 ? "entry" : "entries"} — review in dashboard
            </span>
          </div>
        )}

        {/* No data */}
        {data.totalReviews === 0 && (
          <div style={{ textAlign: "center", padding: "20px 0", color: "rgba(255,255,255,0.3)", fontSize: 13 }}>
            No reviews this {data.period} yet.
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "12px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ width: 16, height: 16, borderRadius: 4,
            background: "linear-gradient(135deg, #7C3AED, #a78bfa)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 9, fontWeight: 800, color: "#fff" }}>R</div>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Powered by RaveAI</span>
        </div>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)" }}>
          Generated {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </span>
      </div>
    </div>
  );
}

export default function ReportGenerator({
  businessId,
}: {
  businessId: string;
}) {
  const weekRef = useRef<HTMLDivElement>(null);
  const monthRef = useRef<HTMLDivElement>(null);
  const [weekData, setWeekData] = useState<ReportData | null>(null);
  const [monthData, setMonthData] = useState<ReportData | null>(null);
  const [loadingWeek, setLoadingWeek] = useState(false);
  const [loadingMonth, setLoadingMonth] = useState(false);

  const generate = useCallback(async (period: "week" | "month") => {
    const setLoading = period === "week" ? setLoadingWeek : setLoadingMonth;
    const setData = period === "week" ? setWeekData : setMonthData;
    const ref = period === "week" ? weekRef : monthRef;

    setLoading(true);
    const res = await fetch(`/api/report?businessId=${businessId}&period=${period}`);
    if (!res.ok) { setLoading(false); return; }
    const data: ReportData = await res.json();
    setData(data);

    // Wait for React to render the report card
    await new Promise((r) => setTimeout(r, 120));

    if (ref.current) {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(ref.current, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: "#050714",
      });
      const link = document.createElement("a");
      link.download = `${data.businessName.replace(/\s+/g, "-").toLowerCase()}-${period}-report.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }

    setLoading(false);
  }, [businessId]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {/* Weekly */}
        <button
          onClick={() => generate("week")}
          disabled={loadingWeek || loadingMonth}
          className="flex flex-col items-center gap-2 bg-white/5 hover:bg-white/8 border border-white/10 hover:border-violet-500/30 rounded-xl p-4 transition-all disabled:opacity-50 group text-left"
        >
          {loadingWeek ? (
            <div className="w-5 h-5 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
          ) : (
            <span className="text-2xl">📊</span>
          )}
          <div>
            <div className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors">
              Weekly Report
            </div>
            <div className="text-xs text-white/40 mt-0.5">This week's performance</div>
          </div>
        </button>

        {/* Monthly */}
        <button
          onClick={() => generate("month")}
          disabled={loadingWeek || loadingMonth}
          className="flex flex-col items-center gap-2 bg-white/5 hover:bg-white/8 border border-white/10 hover:border-violet-500/30 rounded-xl p-4 transition-all disabled:opacity-50 group text-left"
        >
          {loadingMonth ? (
            <div className="w-5 h-5 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
          ) : (
            <span className="text-2xl">📅</span>
          )}
          <div>
            <div className="text-sm font-semibold text-white group-hover:text-violet-300 transition-colors">
              Monthly Report
            </div>
            <div className="text-xs text-white/40 mt-0.5">Full month overview</div>
          </div>
        </button>
      </div>

      <p className="text-white/25 text-xs text-center">Downloads as PNG — shareable with your team</p>

      {/* Hidden report divs — off-screen, captured by html2canvas */}
      <div style={{ position: "fixed", left: -9999, top: 0, zIndex: -1, pointerEvents: "none" }}>
        <div ref={weekRef}>{weekData && <ReportCard data={weekData} />}</div>
      </div>
      <div style={{ position: "fixed", left: -9999, top: 0, zIndex: -1, pointerEvents: "none" }}>
        <div ref={monthRef}>{monthData && <ReportCard data={monthData} />}</div>
      </div>
    </div>
  );
}
