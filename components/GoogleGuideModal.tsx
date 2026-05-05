"use client";

import { useEffect, useState, useCallback } from "react";

const STEPS = [
  { text: "Google Maps will open", emoji: "📍" },
  { text: "Tap 'Write a Review'", emoji: "✍️" },
  { text: "Long press → Tap Paste", emoji: "📋" },
  { text: "Select your stars", emoji: "⭐" },
  { text: "Hit Submit — You're done!", emoji: "🎉" },
];

const CONFETTI = [
  { emoji: "🎊", x: -80, y: -100, delay: 0 },
  { emoji: "⭐", x: 80, y: -100, delay: 0.07 },
  { emoji: "🎉", x: -110, y: -55, delay: 0.12 },
  { emoji: "✨", x: 110, y: -55, delay: 0.05 },
  { emoji: "🌟", x: -55, y: -115, delay: 0.15 },
  { emoji: "💫", x: 55, y: -115, delay: 0.1 },
  { emoji: "🎈", x: 0, y: -125, delay: 0.03 },
  { emoji: "⭐", x: -130, y: -25, delay: 0.18 },
  { emoji: "✨", x: 130, y: -25, delay: 0.09 },
];

/* ── Step scene components ─────────────────────────────── */

function Step1Scene() {
  return (
    <div style={{ animation: "phoneSlideUp 0.55s cubic-bezier(0.34,1.56,0.64,1) both" }}>
      {/* Phone frame */}
      <div style={{
        width: 96, height: 164, borderRadius: 18, background: "#1f2937",
        border: "3.5px solid #374151", overflow: "hidden",
        boxShadow: "0 12px 40px rgba(0,0,0,0.25)", position: "relative",
      }}>
        {/* Notch */}
        <div style={{ width: 36, height: 8, background: "#1f2937", borderRadius: "0 0 8px 8px",
          margin: "0 auto", position: "relative", zIndex: 2 }} />
        {/* Screen — map */}
        <div style={{
          flex: 1, height: "100%", marginTop: -8,
          background:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.25) 0px, rgba(255,255,255,0.25) 1.5px, transparent 1.5px, transparent 24px)," +
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.25) 0px, rgba(255,255,255,0.25) 1.5px, transparent 1.5px, transparent 32px)," +
            "linear-gradient(148deg, #86efac 0%, #4ade80 60%, #22c55e 100%)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0,
          paddingTop: 12,
        }}>
          {/* Google Maps header strip */}
          <div style={{ width: "90%", background: "rgba(255,255,255,0.95)", borderRadius: 6,
            padding: "3px 6px", fontSize: 7, fontWeight: 700, color: "#1a73e8",
            marginBottom: 20, textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.15)" }}>
            Google Maps
          </div>
          {/* Pin */}
          <div style={{ fontSize: 28, lineHeight: 1, animation: "pinBounce 0.6s ease 0.5s 2 alternate" }}>
            📍
          </div>
        </div>
      </div>
    </div>
  );
}

function Step2Scene() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
      animation: "fadeScaleIn 0.4s ease both" }}>
      {/* Mini Google reviews card */}
      <div style={{ width: 176, background: "#fff", borderRadius: 12,
        boxShadow: "0 4px 20px rgba(0,0,0,0.12)", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ background: "#1a73e8", padding: "8px 12px" }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: "#fff" }}>Google Maps</div>
        </div>
        {/* Stars row */}
        <div style={{ padding: "8px 12px 4px", display: "flex", gap: 2 }}>
          {[1,2,3,4,5].map(i => <span key={i} style={{ fontSize: 12, color: "#f59e0b" }}>★</span>)}
        </div>
        {/* Write a review button */}
        <div style={{ margin: "0 10px 10px", background: "#1a73e8",
          borderRadius: 8, padding: "7px 10px", textAlign: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>Write a Review</span>
        </div>
      </div>
      {/* Finger tapping */}
      <div style={{ fontSize: 28, animation: "fingerTap 0.5s ease-in-out 0.3s 3 alternate",
        transformOrigin: "bottom center" }}>
        👆
      </div>
    </div>
  );
}

function Step3Scene() {
  return (
    <div style={{ position: "relative", display: "flex", flexDirection: "column",
      alignItems: "center", gap: 8, animation: "fadeScaleIn 0.4s ease both" }}>
      {/* Paste popup */}
      <div style={{
        background: "#1c1c1e", color: "#fff", fontSize: 12, fontWeight: 600,
        padding: "5px 16px", borderRadius: 8,
        boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
        animation: "pastePopIn 0.3s cubic-bezier(0.34,1.56,0.64,1) 0.9s both",
        position: "relative",
      }}>
        Paste
        {/* Arrow */}
        <div style={{ position: "absolute", bottom: -5, left: "50%", transform: "translateX(-50%)",
          width: 0, height: 0, borderLeft: "5px solid transparent",
          borderRight: "5px solid transparent", borderTop: "5px solid #1c1c1e" }} />
      </div>
      {/* Text input box */}
      <div style={{ width: 180, height: 64, background: "#fff", border: "1.5px solid #d1d5db",
        borderRadius: 10, padding: "8px 12px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: 10, color: "#9ca3af" }}>What did you think?</div>
        <div style={{ marginTop: 6, height: 1.5, width: 8, background: "#6b7280",
          animation: "blink 1s step-end infinite" }} />
      </div>
      {/* Finger holding */}
      <div style={{ fontSize: 24, animation: "fingerHold 0.4s ease 0.3s 2 alternate",
        transformOrigin: "bottom center" }}>
        ☝️
      </div>
    </div>
  );
}

function Step4Scene() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
      animation: "fadeScaleIn 0.4s ease both" }}>
      <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>Rate your experience</div>
      <div style={{ display: "flex", gap: 6 }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} style={{
            fontSize: 38,
            color: "#d1d5db",
            animation: `starFill 0.35s ease both ${i * 0.28}s`,
            display: "inline-block",
          }}>★</span>
        ))}
      </div>
    </div>
  );
}

function Step5Scene() {
  return (
    <div style={{ position: "relative", display: "flex", alignItems: "center",
      justifyContent: "center", width: 200, height: 160, animation: "fadeScaleIn 0.4s ease both" }}>
      {/* Confetti */}
      {CONFETTI.map((c, i) => (
        <span key={i} style={{
          position: "absolute", fontSize: 18,
          animation: `confettiBurst 1s ease-out both ${c.delay}s`,
          ["--cx" as string]: `${c.x}px`,
          ["--cy" as string]: `${c.y}px`,
        } as React.CSSProperties}>
          {c.emoji}
        </span>
      ))}
      {/* Glowing submit button */}
      <div style={{
        background: "#22c55e", color: "#fff", fontWeight: 800, fontSize: 18,
        padding: "12px 32px", borderRadius: 16, cursor: "default",
        animation: "glowGreen 1.2s ease-in-out infinite",
        boxShadow: "0 0 24px rgba(34,197,94,0.5)",
        position: "relative", zIndex: 1,
      }}>
        Submit ✓
      </div>
    </div>
  );
}

/* ── Main modal ─────────────────────────────────────────── */

export default function GoogleGuideModal({
  googleMapsUrl,
  onClose,
}: {
  googleMapsUrl: string;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const isLast = step === STEPS.length - 1;

  // Auto-advance all steps except the last
  useEffect(() => {
    if (isLast) return;
    const t = setTimeout(() => setStep((s) => s + 1), 2500);
    return () => clearTimeout(t);
  }, [step, isLast]);

  const finish = useCallback(() => {
    window.open(googleMapsUrl, "_blank");
    onClose();
  }, [googleMapsUrl, onClose]);

  const skip = useCallback(() => {
    window.open(googleMapsUrl, "_blank");
    onClose();
  }, [googleMapsUrl, onClose]);

  return (
    <>
      {/* CSS keyframes */}
      <style>{`
        @keyframes phoneSlideUp {
          from { transform: translateY(80px) scale(0.85); opacity: 0; }
          to   { transform: translateY(0)  scale(1);    opacity: 1; }
        }
        @keyframes pinBounce {
          from { transform: translateY(0); }
          to   { transform: translateY(-6px); }
        }
        @keyframes fadeScaleIn {
          from { transform: scale(0.88); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
        @keyframes fingerTap {
          from { transform: translateY(0)   scale(1);   }
          to   { transform: translateY(-10px) scale(1.1); }
        }
        @keyframes fingerHold {
          from { transform: scale(1);   }
          to   { transform: scale(0.88); }
        }
        @keyframes pastePopIn {
          from { transform: scale(0.6) translateY(6px); opacity: 0; }
          to   { transform: scale(1)   translateY(0);   opacity: 1; }
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
        @keyframes starFill {
          0%   { color: #d1d5db; transform: scale(1); }
          50%  { color: #f59e0b; transform: scale(1.35); }
          100% { color: #f59e0b; transform: scale(1); }
        }
        @keyframes glowGreen {
          0%, 100% { box-shadow: 0 0 20px rgba(34,197,94,0.45); }
          50%      { box-shadow: 0 0 44px rgba(34,197,94,0.85), 0 0 70px rgba(34,197,94,0.35); }
        }
        @keyframes confettiBurst {
          0%   { transform: translate(0,0) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translate(var(--cx), var(--cy)) rotate(380deg) scale(0.2); opacity: 0; }
        }
        @keyframes modalIn {
          from { transform: scale(0.92) translateY(16px); opacity: 0; }
          to   { transform: scale(1)    translateY(0);    opacity: 1; }
        }
        @keyframes stepFade {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4"
        style={{ background: "rgba(0,0,0,0.72)" }}
      >
        {/* Backdrop tap = skip */}
        <div className="absolute inset-0" onClick={skip} />

        {/* Card */}
        <div
          className="relative z-10 bg-white w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl overflow-hidden shadow-2xl"
          style={{ animation: "modalIn 0.4s cubic-bezier(0.34,1.2,0.64,1) both" }}
        >
          {/* Skip */}
          <button
            onClick={skip}
            className="absolute top-4 right-4 z-20 text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors px-1"
          >
            Skip
          </button>

          {/* Progress bar strip */}
          <div className="flex gap-1 px-4 pt-4 pb-0">
            {STEPS.map((_, i) => (
              <div
                key={i}
                onClick={() => setStep(i)}
                className="cursor-pointer transition-all duration-300 rounded-full h-1"
                style={{
                  flex: i === step ? 2 : 1,
                  background: i <= step ? "#1a73e8" : "#e5e7eb",
                }}
              />
            ))}
          </div>

          {/* Animation scene */}
          <div className="h-52 flex items-center justify-center bg-gray-50 mt-4 mx-4 rounded-2xl overflow-hidden">
            {/* key forces remount so entry animation replays each step */}
            <div key={step} className="flex items-center justify-center w-full h-full">
              {step === 0 && <Step1Scene />}
              {step === 1 && <Step2Scene />}
              {step === 2 && <Step3Scene />}
              {step === 3 && <Step4Scene />}
              {step === 4 && <Step5Scene />}
            </div>
          </div>

          {/* Step text */}
          <div
            key={`text-${step}`}
            className="px-6 pt-5 pb-1 text-center"
            style={{ animation: "stepFade 0.35s ease both" }}
          >
            <p className="text-gray-900 text-xl font-bold leading-snug">
              {STEPS[step].text}{" "}
              <span>{STEPS[step].emoji}</span>
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Step {step + 1} of {STEPS.length}
            </p>
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-2 pt-4 pb-5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: i === step ? 20 : 7,
                  height: 7,
                  background: i === step ? "#1a73e8" : "#d1d5db",
                }}
              />
            ))}
          </div>

          {/* Final CTA */}
          <div
            className="px-5 pb-6 transition-all duration-300"
            style={{ height: isLast ? "auto" : 0, overflow: "hidden", opacity: isLast ? 1 : 0 }}
          >
            <button
              onClick={finish}
              className="w-full bg-green-500 hover:bg-green-600 active:scale-95 text-white font-bold py-4 rounded-2xl text-lg transition-all shadow-lg"
              style={{ boxShadow: "0 4px 20px rgba(34,197,94,0.35)" }}
            >
              Got it, Let's Go! 🚀
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
