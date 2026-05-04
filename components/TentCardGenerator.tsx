"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type ThemeId = "dark" | "ocean" | "sunset";

// Front panel, fold strip, back panel heights in px (preview scale)
const FRONT_H = 258;
const FOLD_H = 30;
const BACK_H = 252;
const CARD_W = 320;
// Split y for canvas rotation (center of fold strip)
const SPLIT_Y = FRONT_H + Math.round(FOLD_H / 2);

interface ThemeCfg {
  label: string;
  emoji: string;
  frontBg: string;
  dotColor: string;
  frontText: string;
  taglineColor: string;
  starColor: string;
  goldLine: string;
  backBg: string;
  backText: string;
  backSubtext: string;
  qrDark: string;
  qrLight: string;
  backAccent: string;
  backPowered: string;
  foldBg: string;
  foldTextColor: string;
  accentBar: string;
}

const THEMES: Record<ThemeId, ThemeCfg> = {
  dark: {
    label: "Dark",
    emoji: "🌙",
    frontBg: [
      "radial-gradient(ellipse at 88% 12%, rgba(139,92,246,0.55) 0%, transparent 48%)",
      "radial-gradient(ellipse at 12% 85%, rgba(67,56,202,0.45) 0%, transparent 42%)",
      "radial-gradient(ellipse at 55% 55%, rgba(45,27,105,0.28) 0%, transparent 60%)",
      "linear-gradient(148deg, #0d0f2b 0%, #18103d 52%, #0d0f2b 100%)",
    ].join(", "),
    dotColor: "rgba(255,255,255,0.055)",
    frontText: "#ffffff",
    taglineColor: "rgba(255,255,255,0.7)",
    starColor: "#F59E0B",
    goldLine: "rgba(245,158,11,0.45)",
    backBg: "#ffffff",
    backText: "#111827",
    backSubtext: "#6b7280",
    qrDark: "#111827",
    qrLight: "#ffffff",
    backAccent: "#7C3AED",
    backPowered: "#9ca3af",
    foldBg: "#faf9ff",
    foldTextColor: "#c4b5fd",
    accentBar: "linear-gradient(90deg, #4c1d95, #7C3AED, #a78bfa, #7C3AED, #4c1d95)",
  },
  ocean: {
    label: "Ocean",
    emoji: "🌊",
    frontBg: [
      "radial-gradient(ellipse at 88% 12%, rgba(14,165,233,0.6) 0%, transparent 48%)",
      "radial-gradient(ellipse at 12% 85%, rgba(6,182,212,0.45) 0%, transparent 42%)",
      "radial-gradient(ellipse at 55% 55%, rgba(3,105,161,0.28) 0%, transparent 60%)",
      "linear-gradient(148deg, #0c4a6e 0%, #065e80 52%, #0e7490 100%)",
    ].join(", "),
    dotColor: "rgba(255,255,255,0.055)",
    frontText: "#ffffff",
    taglineColor: "rgba(255,255,255,0.72)",
    starColor: "#FBBF24",
    goldLine: "rgba(251,191,36,0.5)",
    backBg: "#f0f9ff",
    backText: "#0c4a6e",
    backSubtext: "#0369a1",
    qrDark: "#0c4a6e",
    qrLight: "#f0f9ff",
    backAccent: "#0284c7",
    backPowered: "#38bdf8",
    foldBg: "#e0f2fe",
    foldTextColor: "#7dd3fc",
    accentBar: "linear-gradient(90deg, #0c4a6e, #0284c7, #38bdf8, #0284c7, #0c4a6e)",
  },
  sunset: {
    label: "Sunset",
    emoji: "🌅",
    frontBg: [
      "radial-gradient(ellipse at 88% 12%, rgba(251,146,60,0.65) 0%, transparent 48%)",
      "radial-gradient(ellipse at 12% 85%, rgba(244,63,94,0.42) 0%, transparent 42%)",
      "radial-gradient(ellipse at 55% 55%, rgba(194,65,12,0.22) 0%, transparent 60%)",
      "linear-gradient(148deg, #7c2d12 0%, #b45309 42%, #c2410c 78%, #9a3412 100%)",
    ].join(", "),
    dotColor: "rgba(255,255,255,0.06)",
    frontText: "#ffffff",
    taglineColor: "rgba(255,255,255,0.74)",
    starColor: "#FCD34D",
    goldLine: "rgba(252,211,77,0.55)",
    backBg: "#fff7ed",
    backText: "#7c2d12",
    backSubtext: "#c2410c",
    qrDark: "#7c2d12",
    qrLight: "#fff7ed",
    backAccent: "#ea580c",
    backPowered: "#fdba74",
    foldBg: "#fef3c7",
    foldTextColor: "#fbbf24",
    accentBar: "linear-gradient(90deg, #7c2d12, #ea580c, #f97316, #ea580c, #7c2d12)",
  },
};

const THEME_ORDER: ThemeId[] = ["dark", "ocean", "sunset"];

export default function TentCardGenerator({
  businessName,
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
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const t = THEMES[themeId];

  useEffect(() => {
    let cancelled = false;
    async function genQR() {
      const QRCode = (await import("qrcode")).default;
      const url = await QRCode.toDataURL(reviewUrl, {
        width: 480,
        margin: 2,
        color: { dark: t.qrDark, light: t.qrLight },
      });
      if (!cancelled) setQrDataUrl(url);
    }
    genQR();
    return () => { cancelled = true; };
  }, [reviewUrl, t.qrDark, t.qrLight]);

  const download = useCallback(async () => {
    if (!cardRef.current || !qrDataUrl) return;
    setDownloading(true);

    const html2canvas = (await import("html2canvas")).default;
    const scale = 3;
    const raw = await html2canvas(cardRef.current, {
      scale,
      useCORS: true,
      allowTaint: false,
      logging: false,
    });

    // Create final canvas with back panel rotated 180° for proper tent card printing
    const final = document.createElement("canvas");
    final.width = raw.width;
    final.height = raw.height;
    const ctx = final.getContext("2d")!;

    const splitPx = SPLIT_Y * scale;

    // Front panel — draw as-is
    ctx.drawImage(raw, 0, 0, raw.width, splitPx, 0, 0, raw.width, splitPx);

    // Back panel — rotate 180° around the center of its area
    const backH = raw.height - splitPx;
    const backCenterY = splitPx + backH / 2;
    ctx.save();
    ctx.translate(raw.width / 2, backCenterY);
    ctx.rotate(Math.PI);
    ctx.drawImage(raw, 0, splitPx, raw.width, backH, -raw.width / 2, -backH / 2, raw.width, backH);
    ctx.restore();

    const link = document.createElement("a");
    link.download = `${businessName.replace(/\s+/g, "-").toLowerCase()}-tent-card.png`;
    link.href = final.toDataURL("image/png");
    link.click();
    setDownloading(false);
  }, [qrDataUrl, businessName]);

  return (
    <div className="space-y-5">

      {/* Theme switcher */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-white/40 text-xs mr-1">Theme</span>
        {THEME_ORDER.map((id) => {
          const th = THEMES[id];
          return (
            <button
              key={id}
              onClick={() => setThemeId(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                themeId === id
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/10"
              }`}
            >
              {th.emoji} {th.label}
            </button>
          );
        })}
      </div>

      {/* Card preview */}
      <div className="flex justify-center">
        <div
          ref={cardRef}
          style={{
            width: CARD_W,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.45), 0 4px 16px rgba(0,0,0,0.3)",
          }}
        >
          {/* ── FRONT PANEL ── */}
          <div
            style={{
              position: "relative",
              width: CARD_W,
              height: FRONT_H,
              background: t.frontBg,
              overflow: "hidden",
            }}
          >
            {/* Dot grid overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `radial-gradient(circle, ${t.dotColor} 1px, transparent 0)`,
                backgroundSize: "20px 20px",
              }}
            />

            {/* Content */}
            <div
              style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "26px 24px 20px",
                height: "100%",
                boxSizing: "border-box",
              }}
            >
              {/* Logo or initial avatar */}
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt={businessName}
                  crossOrigin="anonymous"
                  style={{
                    width: 62,
                    height: 62,
                    objectFit: "contain",
                    borderRadius: 14,
                    marginBottom: 12,
                    border: "2px solid rgba(255,255,255,0.2)",
                    background: "rgba(255,255,255,0.12)",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 62,
                    height: 62,
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.18)",
                    border: "2px solid rgba(255,255,255,0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                    fontSize: 26,
                    fontWeight: 800,
                    color: "#ffffff",
                  }}
                >
                  {businessName.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Business name */}
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 800,
                  color: t.frontText,
                  letterSpacing: "-0.4px",
                  lineHeight: 1.15,
                  textAlign: "center",
                  marginBottom: 10,
                }}
              >
                {businessName}
              </div>

              {/* Gold divider */}
              <div
                style={{
                  width: 48,
                  height: 2,
                  borderRadius: 2,
                  background: t.goldLine,
                  marginBottom: 10,
                }}
              />

              {/* Tagline */}
              <div
                style={{
                  fontSize: 13,
                  color: t.taglineColor,
                  fontStyle: "italic",
                  letterSpacing: "0.2px",
                  marginBottom: 18,
                  textAlign: "center",
                }}
              >
                How was your experience?
              </div>

              {/* Stars */}
              <div
                style={{
                  display: "flex",
                  gap: 5,
                  alignItems: "center",
                }}
              >
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} style={{ position: "relative" }}>
                    {/* Shadow layer */}
                    <span
                      style={{
                        position: "absolute",
                        inset: 0,
                        fontSize: 26,
                        color: "rgba(0,0,0,0.25)",
                        lineHeight: 1,
                        textShadow: "0 1px 3px rgba(0,0,0,0.4)",
                      }}
                    >
                      ★
                    </span>
                    <span
                      style={{
                        fontSize: 26,
                        color: t.starColor,
                        lineHeight: 1,
                        display: "block",
                        position: "relative",
                      }}
                    >
                      ★
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── FOLD STRIP ── */}
          <div
            style={{
              width: CARD_W,
              height: FOLD_H,
              background: t.foldBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <div style={{ flex: 1, height: 1, borderTop: `1.5px dashed ${t.foldTextColor}`, marginLeft: 16 }} />
            <span style={{ fontSize: 8.5, color: t.foldTextColor, letterSpacing: "1px", fontWeight: 600, whiteSpace: "nowrap" }}>
              ✂ &nbsp; FOLD HERE &nbsp; ✂
            </span>
            <div style={{ flex: 1, height: 1, borderTop: `1.5px dashed ${t.foldTextColor}`, marginRight: 16 }} />
          </div>

          {/* ── BACK PANEL ── */}
          <div
            style={{
              width: CARD_W,
              height: BACK_H,
              background: t.backBg,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "18px 24px 14px",
              boxSizing: "border-box",
              gap: 0,
            }}
          >
            {/* Accent line */}
            <div
              style={{
                width: 36,
                height: 3,
                borderRadius: 2,
                background: t.accentBar,
                marginBottom: 14,
              }}
            />

            {/* QR Code */}
            <div
              style={{
                padding: 10,
                background: "#ffffff",
                borderRadius: 12,
                boxShadow: "0 2px 16px rgba(0,0,0,0.10)",
                marginBottom: 14,
                border: `1px solid rgba(0,0,0,0.05)`,
              }}
            >
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt="QR Code"
                  style={{ width: 148, height: 148, display: "block" }}
                />
              ) : (
                <div
                  style={{
                    width: 148,
                    height: 148,
                    background: "#f3f4f6",
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#9ca3af",
                    fontSize: 11,
                  }}
                >
                  Generating…
                </div>
              )}
            </div>

            {/* Scan & Share */}
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: t.backText,
                letterSpacing: "-0.2px",
                marginBottom: 4,
                textAlign: "center",
              }}
            >
              Scan &amp; Share Your Review
            </div>

            {/* Takes 20 seconds */}
            <div
              style={{
                fontSize: 11.5,
                color: t.backSubtext,
                marginBottom: 12,
                textAlign: "center",
                fontWeight: 500,
              }}
            >
              Takes only 20 seconds ✨
            </div>

            {/* Powered by RaveAI */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 4,
                  background: "linear-gradient(135deg, #7C3AED, #a78bfa)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 9,
                  fontWeight: 800,
                  color: "#ffffff",
                }}
              >
                R
              </div>
              <span style={{ fontSize: 10, color: t.backPowered, letterSpacing: "0.2px" }}>
                Powered by <strong style={{ color: t.backSubtext }}>RaveAI</strong>
              </span>
            </div>
          </div>

          {/* Accent bar — very bottom */}
          <div style={{ height: 5, background: t.accentBar }} />
        </div>
      </div>

      {/* Print instructions */}
      <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5">
        <span className="text-xl">🖨️</span>
        <div>
          <p className="text-white/75 text-sm font-medium">Print instructions</p>
          <p className="text-white/40 text-xs mt-0.5 leading-relaxed">
            Print on 4×6 inch or A5 paper. Fold along the dashed line to create an A-frame tent card.
            The back panel auto-rotates in the download so it prints correctly.
          </p>
        </div>
      </div>

      {/* Download */}
      <button
        onClick={download}
        disabled={downloading || !qrDataUrl}
        className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-40 text-white font-semibold px-4 py-3 rounded-xl transition-all text-sm shadow-lg shadow-violet-500/20"
      >
        {downloading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating high-res PNG…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Tent Card (Print-Ready PNG)
          </>
        )}
      </button>
    </div>
  );
}
