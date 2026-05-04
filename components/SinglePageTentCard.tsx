"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type ThemeId = "dark" | "ocean" | "sunset";

interface ThemeCfg {
  label: string;
  emoji: string;
  bg: string;
  dotColor: string;
  cornerColor: string;
  text: string;
  taglineColor: string;
  starColor: string;
  accentLine: string;
  subtextColor: string;
  footerColor: string;
  qrDark: string;
  qrLight: string;
  scanBg: string;
  scanText: string;
  waveColor1: string;
  waveColor2: string;
}

const THEMES: Record<ThemeId, ThemeCfg> = {
  dark: {
    label: "Dark Purple",
    emoji: "🌙",
    bg: [
      "radial-gradient(ellipse at 85% 8%, rgba(139,92,246,0.5) 0%, transparent 45%)",
      "radial-gradient(ellipse at 10% 85%, rgba(67,56,202,0.4) 0%, transparent 40%)",
      "radial-gradient(ellipse at 50% 50%, rgba(30,20,80,0.3) 0%, transparent 60%)",
      "linear-gradient(148deg, #0d0f2b 0%, #1a1040 55%, #0d0f2b 100%)",
    ].join(", "),
    dotColor: "rgba(255,255,255,0.05)",
    cornerColor: "rgba(255,255,255,0.18)",
    text: "#ffffff",
    taglineColor: "rgba(255,255,255,0.68)",
    starColor: "#F59E0B",
    accentLine: "linear-gradient(90deg, transparent, rgba(245,158,11,0.6), transparent)",
    subtextColor: "rgba(255,255,255,0.55)",
    footerColor: "rgba(255,255,255,0.3)",
    qrDark: "#1a1040",
    qrLight: "#ffffff",
    scanBg: "rgba(255,255,255,0.08)",
    scanText: "rgba(255,255,255,0.9)",
    waveColor1: "rgba(139,92,246,0.12)",
    waveColor2: "rgba(99,60,200,0.08)",
  },
  ocean: {
    label: "Ocean Teal",
    emoji: "🌊",
    bg: [
      "radial-gradient(ellipse at 85% 8%, rgba(14,165,233,0.55) 0%, transparent 45%)",
      "radial-gradient(ellipse at 10% 85%, rgba(6,182,212,0.4) 0%, transparent 40%)",
      "radial-gradient(ellipse at 50% 50%, rgba(3,78,120,0.3) 0%, transparent 60%)",
      "linear-gradient(148deg, #0c4a6e 0%, #075985 55%, #0e7490 100%)",
    ].join(", "),
    dotColor: "rgba(255,255,255,0.05)",
    cornerColor: "rgba(255,255,255,0.2)",
    text: "#ffffff",
    taglineColor: "rgba(255,255,255,0.7)",
    starColor: "#FBBF24",
    accentLine: "linear-gradient(90deg, transparent, rgba(251,191,36,0.6), transparent)",
    subtextColor: "rgba(255,255,255,0.58)",
    footerColor: "rgba(255,255,255,0.32)",
    qrDark: "#0c4a6e",
    qrLight: "#ffffff",
    scanBg: "rgba(255,255,255,0.08)",
    scanText: "rgba(255,255,255,0.92)",
    waveColor1: "rgba(14,165,233,0.14)",
    waveColor2: "rgba(6,182,212,0.09)",
  },
  sunset: {
    label: "Warm Sunset",
    emoji: "🌅",
    bg: [
      "radial-gradient(ellipse at 85% 8%, rgba(251,146,60,0.6) 0%, transparent 45%)",
      "radial-gradient(ellipse at 10% 85%, rgba(244,63,94,0.38) 0%, transparent 40%)",
      "radial-gradient(ellipse at 50% 50%, rgba(160,40,10,0.22) 0%, transparent 60%)",
      "linear-gradient(148deg, #7c2d12 0%, #b45309 45%, #c2410c 80%, #9a3412 100%)",
    ].join(", "),
    dotColor: "rgba(255,255,255,0.055)",
    cornerColor: "rgba(255,255,255,0.2)",
    text: "#ffffff",
    taglineColor: "rgba(255,255,255,0.72)",
    starColor: "#FCD34D",
    accentLine: "linear-gradient(90deg, transparent, rgba(252,211,77,0.65), transparent)",
    subtextColor: "rgba(255,255,255,0.6)",
    footerColor: "rgba(255,255,255,0.32)",
    qrDark: "#7c2d12",
    qrLight: "#ffffff",
    scanBg: "rgba(255,255,255,0.08)",
    scanText: "rgba(255,255,255,0.92)",
    waveColor1: "rgba(251,146,60,0.15)",
    waveColor2: "rgba(244,63,94,0.09)",
  },
};

// Deterministic star particles scattered across card
const PARTICLES = [
  { x: "6%",  y: "7%",  s: 7,  o: 0.28, c: "✦" },
  { x: "88%", y: "9%",  s: 5,  o: 0.22, c: "✦" },
  { x: "4%",  y: "32%", s: 9,  o: 0.18, c: "✦" },
  { x: "91%", y: "38%", s: 6,  o: 0.2,  c: "✦" },
  { x: "7%",  y: "58%", s: 5,  o: 0.16, c: "✦" },
  { x: "86%", y: "62%", s: 8,  o: 0.18, c: "✦" },
  { x: "14%", y: "82%", s: 6,  o: 0.14, c: "✦" },
  { x: "78%", y: "80%", s: 5,  o: 0.16, c: "✦" },
  { x: "32%", y: "11%", s: 4,  o: 0.14, c: "·" },
  { x: "62%", y: "18%", s: 4,  o: 0.12, c: "·" },
  { x: "22%", y: "91%", s: 5,  o: 0.13, c: "·" },
  { x: "70%", y: "88%", s: 4,  o: 0.12, c: "·" },
];

const CARD_W = 320;
const CARD_H = 480;

export default function SinglePageTentCard({
  businessName: initName,
  businessId,
  logoUrl,
  reviewUrl,
}: {
  businessName: string;
  businessId: string;
  logoUrl?: string | null;
  reviewUrl: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [themeId, setThemeId] = useState<ThemeId>("dark");
  const [name, setName] = useState(initName);
  const [tagline, setTagline] = useState("Scan & Review Us");
  const [scanText, setScanText] = useState("Share Your Experience");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const t = THEMES[themeId];

  // Suppress unused businessId warning — available for future PATCH calls
  void businessId;

  useEffect(() => {
    let cancelled = false;
    async function gen() {
      const QR = (await import("qrcode")).default;
      const url = await QR.toDataURL(reviewUrl, {
        width: 480,
        margin: 2,
        color: { dark: t.qrDark, light: t.qrLight },
      });
      if (!cancelled) setQrDataUrl(url);
    }
    gen();
    return () => { cancelled = true; };
  }, [reviewUrl, t.qrDark, t.qrLight]);

  const download = useCallback(async () => {
    if (!cardRef.current || !qrDataUrl) return;
    setDownloading(true);
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(cardRef.current, {
      scale: 3,
      useCORS: true,
      allowTaint: false,
      logging: false,
    });
    const link = document.createElement("a");
    link.download = `${name.replace(/\s+/g, "-").toLowerCase()}-tent-card.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    setDownloading(false);
  }, [qrDataUrl, name]);

  return (
    <div className="space-y-5">
      {/* Theme selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-white/40 text-xs mr-1">Theme</span>
        {(Object.keys(THEMES) as ThemeId[]).map((id) => (
          <button
            key={id}
            onClick={() => setThemeId(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              themeId === id
                ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/10"
            }`}
          >
            {THEMES[id].emoji} {THEMES[id].label}
          </button>
        ))}
      </div>

      {/* Editable fields */}
      <div className="grid grid-cols-1 gap-3">
        {[
          { label: "Business Name", value: name, set: setName, placeholder: "Your Business Name" },
          { label: "Tagline", value: tagline, set: setTagline, placeholder: "Scan & Review Us" },
          { label: "Scan Text", value: scanText, set: setScanText, placeholder: "Share Your Experience" },
        ].map((f) => (
          <div key={f.label}>
            <label className="text-white/40 text-xs block mb-1">{f.label}</label>
            <input
              value={f.value}
              onChange={(e) => f.set(e.target.value)}
              placeholder={f.placeholder}
              className="w-full bg-white/5 border border-white/10 focus:border-violet-500/50 outline-none rounded-xl px-3 py-2 text-sm text-white placeholder-white/25 transition-colors"
            />
          </div>
        ))}
      </div>

      {/* Card preview */}
      <div className="flex justify-center">
        <div
          ref={cardRef}
          style={{
            width: CARD_W,
            height: CARD_H,
            position: "relative",
            background: t.bg,
            overflow: "hidden",
            borderRadius: 16,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
            boxShadow: "0 24px 64px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.3)",
          }}
        >
          {/* Dot grid */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `radial-gradient(circle, ${t.dotColor} 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }} />

          {/* Corner accents — top-left */}
          <div style={{ position: "absolute", top: 14, left: 14, width: 28, height: 28,
            borderTop: `1.5px solid ${t.cornerColor}`, borderLeft: `1.5px solid ${t.cornerColor}`, borderTopLeftRadius: 7 }} />
          {/* top-right */}
          <div style={{ position: "absolute", top: 14, right: 14, width: 28, height: 28,
            borderTop: `1.5px solid ${t.cornerColor}`, borderRight: `1.5px solid ${t.cornerColor}`, borderTopRightRadius: 7 }} />
          {/* bottom-left */}
          <div style={{ position: "absolute", bottom: 14, left: 14, width: 28, height: 28,
            borderBottom: `1.5px solid ${t.cornerColor}`, borderLeft: `1.5px solid ${t.cornerColor}`, borderBottomLeftRadius: 7 }} />
          {/* bottom-right */}
          <div style={{ position: "absolute", bottom: 14, right: 14, width: 28, height: 28,
            borderBottom: `1.5px solid ${t.cornerColor}`, borderRight: `1.5px solid ${t.cornerColor}`, borderBottomRightRadius: 7 }} />

          {/* Star particles */}
          {PARTICLES.map((p, i) => (
            <span key={i} style={{
              position: "absolute", left: p.x, top: p.y,
              fontSize: p.s, opacity: p.o, color: "#ffffff",
              lineHeight: 1, userSelect: "none",
            }}>
              {p.c}
            </span>
          ))}

          {/* Wave at bottom */}
          <svg
            style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: 100 }}
            viewBox="0 0 320 100" preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0 55 C53 30, 107 10, 160 40 C213 70, 267 85, 320 55 L320 100 L0 100 Z" fill={t.waveColor1} />
            <path d="M0 72 C53 50, 107 28, 160 58 C213 88, 267 102, 320 72 L320 100 L0 100 Z" fill={t.waveColor2} />
          </svg>

          {/* Content */}
          <div style={{
            position: "relative", zIndex: 1,
            display: "flex", flexDirection: "column", alignItems: "center",
            padding: "36px 28px 28px",
            height: "100%", boxSizing: "border-box",
          }}>
            {/* Logo */}
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={name} crossOrigin="anonymous"
                style={{ width: 60, height: 60, objectFit: "contain", borderRadius: 12,
                  marginBottom: 12, border: `1.5px solid rgba(255,255,255,0.2)`,
                  background: "rgba(255,255,255,0.12)" }}
              />
            ) : (
              <div style={{ width: 58, height: 58, borderRadius: 12, marginBottom: 12,
                background: "rgba(255,255,255,0.15)", border: "1.5px solid rgba(255,255,255,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, fontWeight: 800, color: "#ffffff" }}>
                {name.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Business name */}
            <div style={{ fontSize: 22, fontWeight: 800, color: t.text,
              letterSpacing: "-0.3px", lineHeight: 1.15, textAlign: "center", marginBottom: 6 }}>
              {name}
            </div>

            {/* Tagline */}
            <div style={{ fontSize: 12.5, color: t.taglineColor, fontStyle: "italic",
              marginBottom: 12, textAlign: "center" }}>
              {tagline}
            </div>

            {/* Gold accent line */}
            <div style={{ width: 60, height: 1.5, background: t.accentLine, marginBottom: 16, borderRadius: 2 }} />

            {/* QR */}
            <div style={{ padding: 9, background: "#ffffff", borderRadius: 12,
              boxShadow: "0 4px 20px rgba(0,0,0,0.22)", marginBottom: 14 }}>
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrDataUrl} alt="QR" style={{ width: 142, height: 142, display: "block" }} />
              ) : (
                <div style={{ width: 142, height: 142, background: "#f3f4f6", borderRadius: 6,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#9ca3af", fontSize: 11 }}>Generating…</div>
              )}
            </div>

            {/* Stars */}
            <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
              {[1,2,3,4,5].map((i) => (
                <span key={i} style={{ fontSize: 22, color: t.starColor, lineHeight: 1 }}>★</span>
              ))}
            </div>

            {/* Scan CTA */}
            <div style={{ background: t.scanBg, borderRadius: 10, padding: "8px 20px",
              marginBottom: 8, textAlign: "center" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.scanText, marginBottom: 2 }}>
                {scanText}
              </div>
              <div style={{ fontSize: 11, color: t.subtextColor }}>
                Takes only 20 seconds ✨
              </div>
            </div>

            {/* Footer — pushed to bottom by flex spacer */}
            <div style={{ flex: 1 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 14, height: 14, borderRadius: 3.5,
                background: "linear-gradient(135deg, #7C3AED, #a78bfa)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 8, fontWeight: 800, color: "#fff" }}>R</div>
              <span style={{ fontSize: 10, color: t.footerColor, letterSpacing: "0.2px" }}>
                Powered by <strong style={{ color: "rgba(255,255,255,0.5)" }}>RaveAI</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Print note */}
      <div className="flex items-start gap-2.5 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
        <span className="text-base">🖨️</span>
        <p className="text-white/40 text-xs leading-relaxed">
          Print on 4×6 inch card stock. Place on tables, counters, or include in receipts.
        </p>
      </div>

      {/* Download */}
      <button
        onClick={download}
        disabled={downloading || !qrDataUrl}
        className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-40 text-white font-semibold px-4 py-3 rounded-xl transition-all text-sm shadow-lg shadow-violet-500/20"
      >
        {downloading ? (
          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating…</>
        ) : (
          <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>Download Tent Card (High-Res PNG)</>
        )}
      </button>
    </div>
  );
}
