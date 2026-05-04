"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { slugify } from "@/lib/utils";

const BUSINESS_TYPES = [
  { value: "hotel", label: "🏨 Hotel" },
  { value: "restaurant", label: "🍽️ Restaurant" },
  { value: "homestay", label: "🏡 Homestay" },
  { value: "dive-center", label: "🤿 Dive Center" },
  { value: "activity", label: "🎯 Activity" },
];

export default function AddBusinessPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    type: "",
    googleMapsUrl: "",
    makemytripUrl: "",
    tripadvisorUrl: "",
  });

  const slug = form.name ? slugify(form.name) : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.type) {
      setError("Business name and type are required.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create business");
      }

      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050714] text-white">
      <header className="sticky top-0 z-40 border-b border-white/5 backdrop-blur-md bg-[#050714]/80">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard" className="text-white/40 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="font-semibold text-lg">Add Business</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="glass-card rounded-2xl p-6 sm:p-8 animate-fade-in">
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-1">Business details</h2>
            <p className="text-white/40 text-sm">
              Fill in your business info to generate your review link and QR code.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Business Name <span className="text-violet-400">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. The Blue Horizon Resort"
                className="w-full bg-white/5 border border-white/10 focus:border-violet-500/50 focus:outline-none rounded-xl px-4 py-3 text-white placeholder:text-white/25 transition-colors"
                required
              />
              {slug && (
                <p className="text-xs text-white/30 mt-2">
                  Your link will be:{" "}
                  <span className="text-violet-400 font-mono">/r/{slug}</span>
                </p>
              )}
            </div>

            {/* Business Type */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Business Type <span className="text-violet-400">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {BUSINESS_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setForm({ ...form, type: t.value })}
                    className={`p-3 rounded-xl border text-sm text-left transition-all ${
                      form.type === t.value
                        ? "border-violet-500 bg-violet-500/20 text-white"
                        : "border-white/10 bg-white/5 text-white/60 hover:border-white/20"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Google Maps URL */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Google Maps Review URL <span className="text-white/30 text-xs">(recommended)</span>
              </label>
              <input
                type="url"
                value={form.googleMapsUrl}
                onChange={(e) => setForm({ ...form, googleMapsUrl: e.target.value })}
                placeholder="https://g.page/r/..."
                className="w-full bg-white/5 border border-white/10 focus:border-violet-500/50 focus:outline-none rounded-xl px-4 py-3 text-white placeholder:text-white/25 transition-colors"
              />
              <p className="text-xs text-white/25 mt-1">
                Go to your Google Business Profile → Get more reviews → copy the link
              </p>
            </div>

            {/* MakeMyTrip URL */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                MakeMyTrip URL <span className="text-white/30 text-xs">(optional)</span>
              </label>
              <input
                type="url"
                value={form.makemytripUrl}
                onChange={(e) => setForm({ ...form, makemytripUrl: e.target.value })}
                placeholder="https://www.makemytrip.com/..."
                className="w-full bg-white/5 border border-white/10 focus:border-violet-500/50 focus:outline-none rounded-xl px-4 py-3 text-white placeholder:text-white/25 transition-colors"
              />
            </div>

            {/* TripAdvisor URL */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                TripAdvisor URL <span className="text-white/30 text-xs">(optional)</span>
              </label>
              <input
                type="url"
                value={form.tripadvisorUrl}
                onChange={(e) => setForm({ ...form, tripadvisorUrl: e.target.value })}
                placeholder="https://www.tripadvisor.com/..."
                className="w-full bg-white/5 border border-white/10 focus:border-violet-500/50 focus:outline-none rounded-xl px-4 py-3 text-white placeholder:text-white/25 transition-colors"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !form.name || !form.type}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating...
                </>
              ) : (
                "Create Business & Get QR Code →"
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
