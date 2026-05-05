"use client";

import { useState } from "react";
import type { Business } from "@/lib/schema";
import GoogleGuideModal from "@/components/GoogleGuideModal";

const RATING_EMOJIS = [
  { rating: 5, emoji: "😍", label: "Amazing" },
  { rating: 4, emoji: "🙂", label: "Good" },
  { rating: 3, emoji: "😐", label: "Okay" },
  { rating: 2, emoji: "😕", label: "Poor" },
  { rating: 1, emoji: "😞", label: "Terrible" },
];

const TAGS_BY_RATING: Record<number, { emoji: string; label: string }[]> = {
  5: [
    { emoji: "🤿", label: "Amazing Experience" },
    { emoji: "👨‍💼", label: "Friendly Staff" },
    { emoji: "📍", label: "Great Location" },
    { emoji: "💰", label: "Worth Every Penny" },
    { emoji: "🏖️", label: "Beautiful Surroundings" },
    { emoji: "📸", label: "Instagram Worthy" },
    { emoji: "✨", label: "Exceeded Expectations" },
    { emoji: "🔄", label: "Will Come Again" },
  ],
  4: [
    { emoji: "👍", label: "Good Overall" },
    { emoji: "🛏️", label: "Comfortable Stay" },
    { emoji: "🍽️", label: "Good Food" },
    { emoji: "💬", label: "Helpful Staff" },
    { emoji: "💰", label: "Good Value" },
    { emoji: "📍", label: "Easy to Find" },
  ],
  3: [
    { emoji: "⏰", label: "Slow Service" },
    { emoji: "🍽️", label: "Average Food" },
    { emoji: "💰", label: "Slightly Overpriced" },
    { emoji: "📍", label: "Hard to Find" },
    { emoji: "🔇", label: "Noisy" },
    { emoji: "🛏️", label: "Average Stay" },
  ],
};

type Screen = "rating" | "tags" | "generating" | "review" | "private" | "done";

interface ReviewFlowProps {
  business: Business;
}

export default function ReviewFlow({ business }: ReviewFlowProps) {
  const [screen, setScreen] = useState<Screen>("rating");
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [generatedReview, setGeneratedReview] = useState("");
  const [privateFeedback, setPrivateFeedback] = useState("");
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clickedPlatform, setClickedPlatform] = useState<string | null>(null);
  const [showGoogleGuide, setShowGoogleGuide] = useState(false);

  const handleRating = async (r: number) => {
    setRating(r);
    if (r <= 2) {
      // Save private review
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: business.id,
          rating: r,
          isPrivate: true,
        }),
      });
      const data = await res.json();
      setReviewId(data.id);
      setScreen("private");
    } else {
      setScreen("tags");
    }
  };

  const toggleTag = (label: string) => {
    setSelectedTags((prev) =>
      prev.includes(label) ? prev.filter((t) => t !== label) : [...prev, label]
    );
  };

  const handleGenerateReview = async () => {
    setScreen("generating");
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

      // Save review
      const reviewRes = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: business.id,
          rating,
          tags: selectedTags,
          generatedReview: data.review,
          isPrivate: false,
        }),
      });
      const reviewData = await reviewRes.json();
      setReviewId(reviewData.id);

      // Auto copy
      await navigator.clipboard.writeText(data.review).catch(() => {});
      setCopied(true);
      setScreen("review");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate review");
      setScreen("tags");
    }
  };

  const handleGoogleClick = async () => {
    setClickedPlatform("google");
    await navigator.clipboard.writeText(generatedReview).catch(() => {});
    setCopied(true);
    if (reviewId) {
      fetch(`/api/reviews/${reviewId}/platform`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platformClicked: "google" }),
      }).catch(() => {});
    }
    setShowGoogleGuide(true);
  };

  const handlePlatformClick = async (platform: string, url: string) => {
    setClickedPlatform(platform);
    // Copy review text
    await navigator.clipboard.writeText(generatedReview).catch(() => {});
    setCopied(true);

    // Track platform click
    if (reviewId) {
      fetch(`/api/reviews/${reviewId}/platform`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platformClicked: platform }),
      }).catch(() => {});
    }

    // Open platform
    setTimeout(() => {
      window.open(url, "_blank");
    }, 300);
  };

  const handleWhatsApp = async () => {
    setClickedPlatform("whatsapp");
    await navigator.clipboard.writeText(generatedReview).catch(() => {});
    setCopied(true);

    if (reviewId) {
      fetch(`/api/reviews/${reviewId}/platform`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platformClicked: "whatsapp" }),
      }).catch(() => {});
    }

    const text = encodeURIComponent(generatedReview);
    setTimeout(() => {
      window.open(`https://wa.me/?text=${text}`, "_blank");
    }, 300);
  };

  const handlePrivateSubmit = async () => {
    setLoading(true);
    // Update review with private feedback
    if (reviewId) {
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: business.id,
          rating,
          isPrivate: true,
          privateFeedback,
        }),
      }).catch(() => {});
    }
    setLoading(false);
    setScreen("done");
  };

  return (
    <div className="min-h-screen bg-[#050714] text-white flex flex-col items-center justify-center px-4">
      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* SCREEN 1: Rating */}
        {screen === "rating" && (
          <div className="animate-slide-up text-center">
            <div className="mb-2 text-violet-400 text-sm font-medium tracking-wide uppercase">
              {business.name}
            </div>
            <h1 className="text-3xl font-bold mb-2">How was your</h1>
            <h1 className="text-3xl font-bold gradient-text mb-10">experience?</h1>

            <div className="space-y-3">
              {RATING_EMOJIS.map(({ rating: r, emoji, label }) => (
                <button
                  key={r}
                  onClick={() => handleRating(r)}
                  className="w-full flex items-center gap-4 bg-white/5 hover:bg-violet-500/20 border border-white/8 hover:border-violet-500/40 rounded-2xl px-6 py-4 transition-all duration-200 active:scale-95 min-h-[60px]"
                >
                  <span className="text-4xl">{emoji}</span>
                  <span className="text-lg font-medium text-white/80">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* SCREEN 2: Tags */}
        {screen === "tags" && (
          <div className="animate-slide-up">
            <button
              onClick={() => setScreen("rating")}
              className="text-white/40 hover:text-white transition-colors mb-6 flex items-center gap-1 text-sm"
            >
              ← Back
            </button>

            <div className="text-center mb-8">
              <div className="text-5xl mb-3">
                {RATING_EMOJIS.find((e) => e.rating === rating)?.emoji}
              </div>
              <h2 className="text-2xl font-bold">What stood out?</h2>
              <p className="text-white/40 text-sm mt-1">Select all that apply</p>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-6">
              {(TAGS_BY_RATING[rating] ?? []).map(({ emoji, label }) => (
                <button
                  key={label}
                  onClick={() => toggleTag(label)}
                  className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-150 active:scale-95 min-h-[52px] ${
                    selectedTags.includes(label)
                      ? "bg-violet-500/30 border border-violet-400/60 text-white"
                      : "bg-white/5 border border-white/8 text-white/60 hover:border-white/20"
                  }`}
                >
                  <span className="text-xl">{emoji}</span>
                  <span className="leading-tight">{label}</span>
                </button>
              ))}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <button
              onClick={handleGenerateReview}
              disabled={selectedTags.length === 0}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl transition-all duration-200 active:scale-95 text-lg"
            >
              ✨ Generate My Review
            </button>
            {selectedTags.length === 0 && (
              <p className="text-center text-white/30 text-xs mt-2">Select at least one tag</p>
            )}
          </div>
        )}

        {/* SCREEN: Generating */}
        {screen === "generating" && (
          <div className="animate-fade-in text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center animate-pulse">
              <span className="text-3xl">✨</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Crafting your review...</h2>
            <p className="text-white/40 text-sm">AI is writing something genuine for you</p>
            <div className="mt-8 flex justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-violet-500 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* SCREEN 3: Generated Review */}
        {screen === "review" && (
          <div className="animate-slide-up">
            <div className="text-center mb-6">
              <div className="text-4xl mb-3">🎉</div>
              <h2 className="text-2xl font-bold mb-1">Your review is ready!</h2>
              {copied && (
                <div className="inline-flex items-center gap-1 text-sm text-green-400 bg-green-400/10 px-3 py-1 rounded-full">
                  ✅ Copied to clipboard!
                </div>
              )}
            </div>

            {/* Review Card */}
            <div className="glass-card rounded-2xl p-5 mb-6 relative">
              <div className="flex mb-3">
                {"⭐".repeat(rating).split("").map((s, i) => (
                  <span key={i} className="text-yellow-400 text-lg">{s}</span>
                ))}
              </div>
              <p className="text-white/85 leading-relaxed text-sm">{generatedReview}</p>
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(generatedReview);
                  setCopied(true);
                }}
                className="mt-4 text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                📋 Copy again
              </button>
            </div>

            {/* Platform Buttons */}
            <div className="space-y-3 mb-4">
              {business.googleMapsUrl && (
                <button
                  onClick={handleGoogleClick}
                  className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-base transition-all duration-200 active:scale-95 min-h-[60px] ${
                    clickedPlatform === "google"
                      ? "bg-blue-500/30 border border-blue-400/60 text-blue-300"
                      : "bg-white text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <span className="text-xl">⭐</span> Post on Google
                </button>
              )}

              {business.makemytripUrl && (
                <button
                  onClick={() => handlePlatformClick("mmt", business.makemytripUrl!)}
                  className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-base transition-all duration-200 active:scale-95 min-h-[60px] ${
                    clickedPlatform === "mmt"
                      ? "bg-red-500/30 border border-red-400/60 text-red-300"
                      : "bg-red-600 hover:bg-red-500 text-white"
                  }`}
                >
                  <span className="text-xl">🏨</span> Post on MakeMyTrip
                </button>
              )}

              {business.tripadvisorUrl && (
                <button
                  onClick={() => handlePlatformClick("tripadvisor", business.tripadvisorUrl!)}
                  className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-base transition-all duration-200 active:scale-95 min-h-[60px] ${
                    clickedPlatform === "tripadvisor"
                      ? "bg-green-500/30 border border-green-400/60 text-green-300"
                      : "bg-green-700 hover:bg-green-600 text-white"
                  }`}
                >
                  <span className="text-xl">✈️</span> Post on TripAdvisor
                </button>
              )}

              <button
                onClick={handleWhatsApp}
                className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-semibold text-base transition-all duration-200 active:scale-95 min-h-[60px] ${
                  clickedPlatform === "whatsapp"
                    ? "bg-emerald-500/30 border border-emerald-400/60 text-emerald-300"
                    : "bg-[#25D366] hover:bg-[#1fb855] text-white"
                }`}
              >
                <span className="text-xl">💬</span> Share on WhatsApp
              </button>
            </div>

            <p className="text-center text-white/30 text-xs leading-relaxed">
              Review copied! Just paste it in the box when the app opens 👆
            </p>
          </div>
        )}

        {/* SCREEN: Private Feedback */}
        {screen === "private" && (
          <div className="animate-slide-up text-center">
            <div className="text-5xl mb-4">😔</div>
            <h2 className="text-2xl font-bold mb-2">Sorry to hear that</h2>
            <p className="text-white/50 text-sm mb-8 leading-relaxed">
              Tell us what went wrong — the owner will personally respond.
            </p>

            <textarea
              value={privateFeedback}
              onChange={(e) => setPrivateFeedback(e.target.value)}
              placeholder="What could we have done better?"
              rows={5}
              className="w-full bg-white/5 border border-white/10 focus:border-violet-500/50 focus:outline-none rounded-2xl px-4 py-3 text-white placeholder:text-white/25 transition-colors resize-none text-sm mb-4"
            />

            <button
              onClick={handlePrivateSubmit}
              disabled={loading || !privateFeedback.trim()}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                "🔒 Submit Privately"
              )}
            </button>

            <p className="text-white/25 text-xs mt-4">
              Your feedback is completely private — only the owner sees this.
            </p>
          </div>
        )}

        {/* SCREEN: Done */}
        {screen === "done" && (
          <div className="animate-slide-up text-center">
            <div className="text-6xl mb-4">🙏</div>
            <h2 className="text-2xl font-bold mb-2">Thank you for your feedback</h2>
            <p className="text-white/50 text-sm leading-relaxed">
              We&apos;ve received your message. The owner will reach out personally to make things right.
            </p>
          </div>
        )}
      </div>

      {/* Google guide modal */}
      {showGoogleGuide && business.googleMapsUrl && (
        <GoogleGuideModal
          googleMapsUrl={business.googleMapsUrl}
          onClose={() => setShowGoogleGuide(false)}
        />
      )}
    </div>
  );
}
