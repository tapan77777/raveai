"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import type { Business } from "@/lib/schema";

// ── Constants ─────────────────────────────────────────────────
const BUSINESS_EMOJIS: Record<string, string> = {
  hotel: "🏨",
  restaurant: "🍽️",
  homestay: "🏡",
  "dive-center": "🤿",
  activity: "🎯",
};

const TAGS_BY_RATING: Record<number, string[]> = {
  5: [
    "Amazing Experience", "Friendly Staff", "Great Location",
    "Worth Every Penny", "Beautiful Surroundings", "Instagram Worthy",
    "Exceeded Expectations", "Will Come Again",
  ],
  4: [
    "Good Overall", "Comfortable Stay", "Good Food",
    "Helpful Staff", "Good Value", "Easy to Find",
  ],
  3: [
    "Average Experience", "Could Be Better", "Slow Service",
    "Average Food", "Okay Value",
  ],
};

// ── Google G logo ─────────────────────────────────────────────
function GoogleLogo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

// ── Types ─────────────────────────────────────────────────────
type Screen = "path" | "ai";

interface ReviewFlowProps {
  business: Business;
}

// ── Main component ────────────────────────────────────────────
export default function ReviewFlow({ business }: ReviewFlowProps) {
  const [screen, setScreen] = useState<Screen>("path");

  // AI flow
  const [rating, setRating] = useState(0);
  const [animatingRating, setAnimatingRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generatedReview, setGeneratedReview] = useState("");
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [clickedPlatform, setClickedPlatform] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Tutorial: 0=hidden, 1=step1, 2=step2, 3=done
  const [tutorialStep, setTutorialStep] = useState(0);

  // Private feedback (1-2 star)
  const [privateFeedback, setPrivateFeedback] = useState("");
  const [privateSubmitting, setPrivateSubmitting] = useState(false);
  const [privateSubmitted, setPrivateSubmitted] = useState(false);

  // Scroll targets
  const tagsRef = useRef<HTMLDivElement>(null);
  const reviewRef = useRef<HTMLDivElement>(null);
  const tutorialRef = useRef<HTMLDivElement>(null);
  const postRef = useRef<HTMLDivElement>(null);

  // Derived
  const isLowRating = rating === 1 || rating === 2;
  const tags = TAGS_BY_RATING[rating] ?? [];
  const postUnlocked = copied && tutorialStep === 3;

  // Auto-advance tutorial
  useEffect(() => {
    if (tutorialStep === 0 || tutorialStep === 3) return;
    const t = setTimeout(
      () => setTutorialStep((s) => (s >= 2 ? 3 : s + 1)),
      2500
    );
    return () => clearTimeout(t);
  }, [tutorialStep]);

  // Scroll to tags when rating selected
  useEffect(() => {
    if (rating > 0) {
      setTimeout(
        () => tagsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
        160
      );
    }
  }, [rating]);

  // Scroll to review when generated
  useEffect(() => {
    if (generatedReview) {
      setTimeout(
        () => reviewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        200
      );
    }
  }, [generatedReview]);

  // Scroll to tutorial when it starts
  useEffect(() => {
    if (tutorialStep === 1) {
      setTimeout(
        () => tutorialRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
        120
      );
    }
    if (tutorialStep === 3) {
      setTimeout(
        () => postRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
        120
      );
    }
  }, [tutorialStep]);

  // ── Handlers ──────────────────────────────────────────────────
  const handleDirectGoogle = () => {
    fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId: business.id,
        reviewPath: "direct",
        platformClicked: "google",
        isPrivate: false,
      }),
    }).catch(() => {});
    if (business.googleMapsUrl) window.open(business.googleMapsUrl, "_blank");
  };

  const handleRating = (r: number) => {
    setRating(r);
    setAnimatingRating(r);
    setTimeout(() => setAnimatingRating(0), 700);
    setSelectedTags([]);
    setGeneratedReview("");
    setCopied(false);
    setTutorialStep(0);
    setPrivateFeedback("");
    setPrivateSubmitted(false);
    setReviewId(null);
    setError("");
    setClickedPlatform(null);
  };

  const toggleTag = (label: string) => {
    setSelectedTags((prev) =>
      prev.includes(label) ? prev.filter((t) => t !== label) : [...prev, label]
    );
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch("/api/generate-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: business.name,
          businessType: business.type,
          rating,
          tags: selectedTags,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setGeneratedReview(data.review);

      const reviewRes = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: business.id,
          rating,
          tags: selectedTags,
          generatedReview: data.review,
          reviewPath: "ai",
          isPrivate: false,
        }),
      });
      const reviewData = await reviewRes.json();
      setReviewId(reviewData.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate review");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedReview).catch(() => {});
    setCopied(true);
    setTutorialStep(1);
  };

  const handleGoogleClick = () => {
    setClickedPlatform("google");
    if (reviewId) {
      fetch(`/api/reviews/${reviewId}/platform`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platformClicked: "google" }),
      }).catch(() => {});
    }
    if (business.googleMapsUrl) window.open(business.googleMapsUrl, "_blank");
  };

  const handlePlatformClick = (platform: string, url: string) => {
    setClickedPlatform(platform);
    if (reviewId) {
      fetch(`/api/reviews/${reviewId}/platform`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platformClicked: platform }),
      }).catch(() => {});
    }
    setTimeout(() => window.open(url, "_blank"), 300);
  };

  const handleWhatsApp = () => {
    setClickedPlatform("whatsapp");
    if (reviewId) {
      fetch(`/api/reviews/${reviewId}/platform`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platformClicked: "whatsapp" }),
      }).catch(() => {});
    }
    const text = encodeURIComponent(generatedReview);
    setTimeout(() => window.open(`https://wa.me/?text=${text}`, "_blank"), 300);
  };

  const handlePrivateSubmit = async () => {
    if (!privateFeedback.trim()) return;
    setPrivateSubmitting(true);
    await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        businessId: business.id,
        rating,
        reviewPath: "ai",
        isPrivate: true,
        privateFeedback,
      }),
    }).catch(() => {});
    setPrivateSubmitting(false);
    setPrivateSubmitted(true);
  };

  // ── PATH SCREEN ───────────────────────────────────────────────
  const businessEmoji = BUSINESS_EMOJIS[business.type] ?? "🏪";

  if (screen === "path") {
    return (
      <div
        className="min-h-screen text-white flex flex-col items-center justify-center px-4"
        style={{ background: "#0a0a14" }}
      >
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 w-full max-w-sm text-center">
          {/* Logo */}
          <div
            className="animate-float-down mx-auto mb-4 flex items-center justify-center rounded-full overflow-hidden"
            style={{
              width: 64, height: 64,
              background: "rgba(255,255,255,0.07)",
              border: "1.5px solid rgba(255,255,255,0.12)",
            }}
          >
            {business.logoUrl ? (
              <Image
                src={business.logoUrl}
                alt={business.name}
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            ) : (
              <span style={{ fontSize: 30 }}>{businessEmoji}</span>
            )}
          </div>

          <h1
            className="font-bold mb-1"
            style={{ fontSize: 18, color: "#fff", animation: "fadeIn 0.5s 0.15s ease forwards", opacity: 0 }}
          >
            {business.name}
          </h1>

          <p
            style={{
              fontSize: 13,
              color: "rgba(255,255,255,0.45)",
              marginBottom: 20,
              animation: "fadeIn 0.5s 0.25s ease forwards",
              opacity: 0,
            }}
          >
            How was your experience?
          </p>

          {/* Decorative stars */}
          <div
            className="flex justify-center gap-2 mb-8"
            style={{ animation: "fadeIn 0.1s 0.3s ease forwards", opacity: 0 }}
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                style={{
                  fontSize: 26,
                  display: "inline-block",
                  animation: `starPop 0.45s ${0.35 + i * 0.1}s cubic-bezier(0.22,1,0.36,1) forwards`,
                  opacity: 0,
                }}
              >
                ⭐
              </span>
            ))}
          </div>

          {/* Option cards */}
          <div className="space-y-3">
            {/* Google — direct */}
            <button
              onClick={handleDirectGoogle}
              className="animate-card-slide-up w-full flex items-center gap-4 rounded-2xl px-5 py-4 active:scale-95 transition-transform duration-150"
              style={{ background: "#fff", animationDelay: "0.55s", minHeight: 72 }}
            >
              <div
                className="flex items-center justify-center rounded-full shrink-0"
                style={{ width: 40, height: 40, background: "#f1f3f4" }}
              >
                <GoogleLogo />
              </div>
              <div className="flex-1 text-left">
                <div style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>Post on Google</div>
                <div style={{ fontSize: 12, color: "#666", marginTop: 1 }}>Write your own review</div>
              </div>
              <span style={{ color: "#999", fontSize: 18, fontWeight: 300 }}>›</span>
            </button>

            {/* AI flow */}
            <button
              onClick={() => setScreen("ai")}
              className="animate-card-slide-up w-full flex items-center gap-4 rounded-2xl px-5 py-4 active:scale-95 transition-transform duration-150"
              style={{
                background: "#13132a",
                border: "1px solid rgba(139,92,246,0.25)",
                animationDelay: "0.65s",
                minHeight: 72,
              }}
            >
              <div
                className="flex items-center justify-center rounded-full shrink-0"
                style={{ width: 40, height: 40, background: "rgba(139,92,246,0.18)" }}
              >
                <span style={{ fontSize: 20 }}>🪄</span>
              </div>
              <div className="flex-1 text-left">
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>Let AI write it</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 1 }}>Done in 20 seconds</div>
              </div>
              <div
                className="shrink-0 flex items-center gap-1 rounded-full px-2 py-0.5"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #a855f7)",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                ✨ AI
              </div>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 18, fontWeight: 300, marginLeft: 4 }}>›</span>
            </button>
          </div>

          <p
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.2)",
              marginTop: 28,
              animation: "fadeIn 0.5s 0.8s ease forwards",
              opacity: 0,
            }}
          >
            Powered by RaveAI
          </p>
        </div>
      </div>
    );
  }

  // ── AI FLOW (single-page scroll) ───────────────────────────────
  return (
    <div className="min-h-screen text-white" style={{ background: "#0a0a14" }}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-sm mx-auto px-4 pb-20">

        {/* Back */}
        <div className="pt-6 pb-0">
          <button
            onClick={() => setScreen("path")}
            className="flex items-center gap-1 text-sm"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            ← Back
          </button>
        </div>

        {/* Header */}
        <div className="text-center py-7">
          <div className="text-sm font-medium mb-1" style={{ color: "#a78bfa" }}>{business.name}</div>
          <h1 className="text-2xl font-bold">Rate your experience</h1>
        </div>

        {/* ── SECTION 1: Stars ── */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRating(star)}
              style={{ width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <span
                style={{
                  fontSize: 44,
                  display: "inline-block",
                  color: star <= rating ? "#FBBF24" : "rgba(255,255,255,0.14)",
                  transition: "color 0.18s ease",
                  animation:
                    star <= animatingRating
                      ? `starBounce 0.42s ${(star - 1) * 0.07}s cubic-bezier(0.22,1,0.36,1) both`
                      : undefined,
                }}
              >
                ★
              </span>
            </button>
          ))}
        </div>

        {/* ── SECTION 2: Tags or Private feedback ── */}
        {rating > 0 && (
          <div key={`section2-${rating}`} ref={tagsRef} className="animate-section-reveal">
            {isLowRating ? (
              /* Private feedback */
              !privateSubmitted ? (
                <div className="text-center">
                  <div style={{ fontSize: 48, marginBottom: 12 }}>😔</div>
                  <h2 className="text-xl font-bold mb-2">We&apos;re sorry to hear that</h2>
                  <p className="text-sm mb-6 leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                    Your feedback goes directly to the owner
                  </p>
                  <textarea
                    value={privateFeedback}
                    onChange={(e) => setPrivateFeedback(e.target.value)}
                    placeholder="What could we have done better?"
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 focus:border-violet-500/50 focus:outline-none rounded-2xl px-4 py-3 text-white placeholder:text-white/25 resize-none text-sm mb-4"
                  />
                  <button
                    onClick={handlePrivateSubmit}
                    disabled={privateSubmitting || !privateFeedback.trim()}
                    className="w-full bg-gradient-to-r from-violet-600 to-purple-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-2xl active:scale-95 transition-all duration-150 flex items-center justify-center gap-2"
                    style={{ minHeight: 56, fontSize: 15 }}
                  >
                    {privateSubmitting ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : "🔒 Submit Privately"}
                  </button>
                  <p className="text-xs mt-4" style={{ color: "rgba(255,255,255,0.2)" }}>
                    Only the owner sees this.
                  </p>
                </div>
              ) : (
                <div className="text-center animate-fade-in py-8">
                  <div style={{ fontSize: 52, marginBottom: 12 }}>🙏</div>
                  <h2 className="text-xl font-bold mb-2">Thank you!</h2>
                  <p className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                    We&apos;ll make it better
                  </p>
                </div>
              )
            ) : (
              /* Tag pills */
              <div>
                <p className="text-sm text-center mb-4" style={{ color: "rgba(255,255,255,0.5)" }}>
                  What stood out?{" "}
                  <span style={{ color: "rgba(255,255,255,0.25)" }}>Select all that apply</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((label) => (
                    <button
                      key={label}
                      onClick={() => toggleTag(label)}
                      className={`rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150 active:scale-95 ${
                        selectedTags.includes(label)
                          ? "bg-violet-500/30 border border-violet-400/60 text-white"
                          : "bg-white/5 border border-white/10 text-white/55"
                      }`}
                      style={{ minHeight: 40 }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SECTION 3: Generate button ── */}
        {!isLowRating && selectedTags.length > 0 && !generatedReview && (
          <div key={`gen-${selectedTags.length > 0}`} className="animate-section-reveal pt-6 pb-2">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">
                {error}
              </div>
            )}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 disabled:opacity-60 text-white font-semibold rounded-2xl active:scale-95 transition-all duration-150 flex items-center justify-center gap-2"
              style={{ minHeight: 56, fontSize: 16 }}
            >
              {generating ? (
                <>
                  <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Writing your review...
                </>
              ) : "✨ Generate My Review"}
            </button>
          </div>
        )}

        {/* ── SECTION 4: Review card + Copy ── */}
        {generatedReview && (
          <div ref={reviewRef} className="animate-section-reveal pt-6">
            <div className="text-center mb-4">
              <div style={{ fontSize: 32, marginBottom: 6 }}>🎉</div>
              <h2 className="text-xl font-bold">Your review is ready!</h2>
            </div>

            {/* Review card */}
            <div
              className="rounded-2xl p-5 mb-4"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: rating }).map((_, i) => (
                  <span key={i} style={{ color: "#FBBF24", fontSize: 15 }}>★</span>
                ))}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.85)" }}>
                {generatedReview}
              </p>
            </div>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className="w-full font-bold rounded-2xl active:scale-95 transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                minHeight: 56,
                fontSize: 16,
                background: copied
                  ? "linear-gradient(135deg, #059669, #10b981)"
                  : "linear-gradient(135deg, #7c3aed, #a855f7)",
                color: "#fff",
              }}
            >
              {copied ? "✅ Copied!" : "📋 Copy Review"}
            </button>
          </div>
        )}

        {/* ── Tutorial (shows after copy, auto-advances) ── */}
        {tutorialStep > 0 && tutorialStep < 3 && (
          <div ref={tutorialRef} className="animate-section-reveal mt-5">
            <div
              className="relative rounded-2xl p-5"
              style={{ background: "#0f0f24", border: "1px solid rgba(139,92,246,0.22)" }}
            >
              <button
                onClick={() => setTutorialStep(3)}
                className="absolute top-3 right-4 text-xs"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                Skip
              </button>

              {/* Progress dots */}
              <div className="flex gap-2 justify-center mb-4">
                {[1, 2].map((step) => (
                  <div
                    key={step}
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: tutorialStep >= step ? 22 : 6,
                      background: tutorialStep >= step ? "#7c3aed" : "rgba(255,255,255,0.15)",
                    }}
                  />
                ))}
              </div>

              {/* Step content */}
              <div className="text-center animate-fade-in" key={tutorialStep}>
                {tutorialStep === 1 && (
                  <>
                    <div style={{ fontSize: 40, marginBottom: 10 }}>📱</div>
                    <p className="font-semibold mb-1" style={{ color: "#fff" }}>Google Maps will open</p>
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                      Review is already copied to clipboard
                    </p>
                  </>
                )}
                {tutorialStep === 2 && (
                  <>
                    <div
                      className="animate-paste-bounce"
                      style={{ fontSize: 40, marginBottom: 10, display: "inline-block" }}
                    >
                      📋
                    </div>
                    <p className="font-semibold mb-1" style={{ color: "#fff" }}>Long press → Paste → Submit</p>
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
                      Paste in the Google review box
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── SECTION 5: Post buttons (lock until copy + tutorial) ── */}
        {generatedReview && (
          <div
            ref={postRef}
            className={`space-y-3 mt-5 ${postUnlocked ? "animate-unlock" : ""}`}
            style={{
              opacity: postUnlocked ? 1 : 0.25,
              pointerEvents: postUnlocked ? "auto" : "none",
              filter: postUnlocked ? "none" : "grayscale(1)",
              transition: postUnlocked ? "none" : "opacity 0.2s ease",
            }}
          >
            {!copied && (
              <div
                className="text-center text-xs flex items-center justify-center gap-1 mb-1"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                🔒 Copy the review first to unlock
              </div>
            )}

            {business.googleMapsUrl && (
              <button
                onClick={handleGoogleClick}
                className={`w-full flex items-center justify-center gap-3 rounded-2xl font-semibold text-base active:scale-95 transition-all duration-150 ${
                  clickedPlatform === "google"
                    ? "bg-blue-500/30 border border-blue-400/60 text-blue-300"
                    : "bg-white text-gray-900"
                }`}
                style={{ minHeight: 56 }}
              >
                <GoogleLogo size={20} />
                Post on Google
              </button>
            )}

            {business.makemytripUrl && (
              <button
                onClick={() => handlePlatformClick("mmt", business.makemytripUrl!)}
                className={`w-full flex items-center justify-center gap-3 rounded-2xl font-semibold text-base active:scale-95 transition-all duration-150 ${
                  clickedPlatform === "mmt"
                    ? "bg-red-500/30 border border-red-400/60 text-red-300"
                    : "bg-red-600 text-white"
                }`}
                style={{ minHeight: 56 }}
              >
                🏨 Post on MakeMyTrip
              </button>
            )}

            {business.tripadvisorUrl && (
              <button
                onClick={() => handlePlatformClick("tripadvisor", business.tripadvisorUrl!)}
                className={`w-full flex items-center justify-center gap-3 rounded-2xl font-semibold text-base active:scale-95 transition-all duration-150 ${
                  clickedPlatform === "tripadvisor"
                    ? "bg-green-500/30 border border-green-400/60 text-green-300"
                    : "bg-green-700 text-white"
                }`}
                style={{ minHeight: 56 }}
              >
                ✈️ Post on TripAdvisor
              </button>
            )}

            <button
              onClick={handleWhatsApp}
              className={`w-full flex items-center justify-center gap-3 rounded-2xl font-semibold text-base active:scale-95 transition-all duration-150 ${
                clickedPlatform === "whatsapp"
                  ? "bg-emerald-500/30 border border-emerald-400/60 text-emerald-300"
                  : "bg-[#25D366] text-white"
              }`}
              style={{ minHeight: 56 }}
            >
              💬 Share on WhatsApp
            </button>

            <p
              className="text-center text-xs leading-relaxed pt-1"
              style={{ color: "rgba(255,255,255,0.25)" }}
            >
              Tap a button to post your review
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
