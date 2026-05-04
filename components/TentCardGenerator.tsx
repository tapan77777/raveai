"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type Theme = "light" | "dark";

const THEMES = {
  light: {
    bg: "#ffffff",
    cardBg: "#ffffff",
    border: "#e5e7eb",
    text: "#111827",
    subtext: "#6b7280",
    tagline: "#374151",
    scanText: "#4b5563",
    poweredBy: "#9ca3af",
    divider: "#e5e7eb",
    starColor: "#F59E0B",
    accentTop: "#7C3AED",
    accentBottom: "#a78bfa",
  },
  dark: {
    bg: "#0d0d1a",
    cardBg: "#0d0d1a",
    border: "#1e1e30",
    text: "#ffffff",
    subtext: "#a1a1aa",
    tagline: "#d4d4d8",
    scanText: "#a1a1aa",
    poweredBy: "#52525b",
    divider: "#1e1e30",
    starColor: "#F59E0B",
    accentTop: "#7C3AED",
    accentBottom: "#4c1d95",
  },
};

export default function TentCardGenerator({
  businessName,
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
  const [theme, setTheme] = useState<Theme>("light");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const t = THEMES[theme];

  // Generate QR as data URL so html2canvas captures it correctly
  useEffect(() => {
    let cancelled = false;
    async function genQR() {
      const QRCode = (await import("qrcode")).default;
      const url = await QRCode.toDataURL(reviewUrl, {
        width: 480,
        margin: 2,
        color: {
          dark: theme === "dark" ? "#ffffff" : "#111827",
          light: theme === "dark" ? "#0d0d1a" : "#ffffff",
        },
      });
      if (!cancelled) setQrDataUrl(url);
    }
    genQR();
    return () => { cancelled = true; };
  }, [reviewUrl, theme]);

  const download = useCallback(async () => {
    if (!cardRef.current || !qrDataUrl) return;
    setDownloading(true);
    const html2canvas = (await import("html2canvas")).default;
    const canvas = await html2canvas(cardRef.current, {
      scale: 3,
      useCORS: true,
      allowTaint: false,
      backgroundColor: t.cardBg,
      logging: false,
    });
    const link = document.createElement("a");
    link.download = `${businessName.replace(/\s+/g, "-").toLowerCase()}-tent-card.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    setDownloading(false);
  }, [qrDataUrl, businessName, t.cardBg]);

  return (
    <div className="space-y-5">
      {/* Theme Toggle */}
      <div className="flex items-center gap-3">
        <span className="text-white/40 text-xs">Theme</span>
        <div className="flex gap-2">
          {(["light", "dark"] as Theme[]).map((opt) => (
            <button
              key={opt}
              onClick={() => setTheme(opt)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                theme === opt
                  ? "bg-violet-600 text-white"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
              }`}
            >
              {opt === "light" ? "☀️ Light" : "🌙 Dark"}
            </button>
          ))}
        </div>
      </div>

      {/* Card Preview */}
      <div className="flex justify-center">
        <div
          ref={cardRef}
          style={{
            width: 320,
            background: t.cardBg,
            borderRadius: 16,
            overflow: "hidden",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            border: `1px solid ${t.border}`,
            boxShadow: theme === "light" ? "0 8px 32px rgba(0,0,0,0.12)" : "0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          {/* Accent bar top */}
          <div style={{ height: 6, background: "linear-gradient(90deg, #7C3AED, #a78bfa, #7C3AED)" }} />

          {/* Main content */}
          <div style={{ padding: "28px 28px 0 28px", textAlign: "center" }}>
            {/* Logo */}
            {logoUrl ? (
              <div style={{ marginBottom: 14 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logoUrl}
                  alt={businessName}
                  crossOrigin="anonymous"
                  style={{
                    width: 64,
                    height: 64,
                    objectFit: "contain",
                    borderRadius: 12,
                    margin: "0 auto",
                    display: "block",
                    border: `1px solid ${t.border}`,
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #7C3AED, #a78bfa)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 14px",
                  fontSize: 24,
                  color: "#ffffff",
                  fontWeight: 700,
                }}
              >
                {businessName.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Business name */}
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: t.text,
                letterSpacing: "-0.5px",
                lineHeight: 1.2,
                marginBottom: 6,
              }}
            >
              {businessName}
            </div>

            {/* Tagline */}
            <div
              style={{
                fontSize: 13,
                color: t.tagline,
                marginBottom: 22,
                fontStyle: "italic",
                opacity: 0.85,
              }}
            >
              How was your experience?
            </div>

            {/* QR Code */}
            <div
              style={{
                display: "inline-block",
                padding: 10,
                background: "#ffffff",
                borderRadius: 12,
                boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
                marginBottom: 18,
              }}
            >
              {qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={qrDataUrl}
                  alt="QR Code"
                  style={{ width: 160, height: 160, display: "block" }}
                />
              ) : (
                <div
                  style={{
                    width: 160,
                    height: 160,
                    background: "#f3f4f6",
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#9ca3af",
                    fontSize: 12,
                  }}
                >
                  Loading…
                </div>
              )}
            </div>

            {/* Stars */}
            <div style={{ fontSize: 22, letterSpacing: 3, marginBottom: 10, color: t.starColor }}>
              ★★★★★
            </div>

            {/* Scan text */}
            <div
              style={{
                fontSize: 12,
                color: t.scanText,
                marginBottom: 24,
                fontWeight: 500,
                letterSpacing: "0.3px",
              }}
            >
              Scan to share your review
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: t.divider, margin: "0 28px" }} />

          {/* Fold line indicator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 28px",
              justifyContent: "center",
            }}
          >
            <div style={{ flex: 1, borderTop: `1px dashed ${t.divider}` }} />
            <span style={{ fontSize: 9, color: t.poweredBy, letterSpacing: "0.5px", whiteSpace: "nowrap" }}>
              ✂ FOLD HERE
            </span>
            <div style={{ flex: 1, borderTop: `1px dashed ${t.divider}` }} />
          </div>

          {/* Back panel */}
          <div
            style={{
              padding: "12px 28px 20px",
              textAlign: "center",
              transform: "rotate(180deg)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 5,
                  background: "linear-gradient(135deg, #7C3AED, #a78bfa)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  fontSize: 10,
                  fontWeight: 800,
                  fontFamily: "-apple-system, sans-serif",
                }}
              >
                R
              </div>
              <span
                style={{
                  fontSize: 11,
                  color: t.poweredBy,
                  letterSpacing: "0.3px",
                  fontFamily: "-apple-system, sans-serif",
                }}
              >
                Powered by <strong style={{ color: t.subtext }}>RaveAI</strong>
              </span>
            </div>
          </div>

          {/* Accent bar bottom */}
          <div style={{ height: 4, background: "linear-gradient(90deg, #a78bfa, #7C3AED, #a78bfa)" }} />
        </div>
      </div>

      {/* Print instructions */}
      <div className="flex items-start gap-2.5 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
        <span className="text-lg mt-0.5">🖨️</span>
        <div>
          <p className="text-white/70 text-sm font-medium">Print instructions</p>
          <p className="text-white/40 text-xs mt-0.5">
            Print on A5 or 4×6 paper and fold along the dashed line. Place on tables or counters.
          </p>
        </div>
      </div>

      {/* Download button */}
      <button
        onClick={download}
        disabled={downloading || !qrDataUrl}
        className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:from-violet-800 disabled:to-purple-800 disabled:opacity-50 text-white font-semibold px-4 py-3 rounded-xl transition-all text-sm"
      >
        {downloading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating…
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Tent Card (Print-Ready)
          </>
        )}
      </button>
    </div>
  );
}
