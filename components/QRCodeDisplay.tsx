"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const COLOR_PRESETS = [
  { name: "Classic Black", value: "#000000" },
  { name: "Ocean Blue", value: "#0066CC" },
  { name: "Forest Green", value: "#16a34a" },
  { name: "Royal Purple", value: "#7C3AED" },
  { name: "Sunset Orange", value: "#EA580C" },
];

const QR_SIZE = 240;
const LOGO_RATIO = 0.28;
const LOGO_PADDING = 8;

export default function QRCodeDisplay({
  url,
  businessName,
  businessId,
  initialLogoUrl,
}: {
  url: string;
  businessName: string;
  businessId: string;
  initialLogoUrl?: string | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [color, setColor] = useState("#000000");
  const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl ?? null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const drawQR = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setLoading(true);

    const QRCode = (await import("qrcode")).default;
    const offscreen = document.createElement("canvas");
    await QRCode.toCanvas(offscreen, url, {
      width: QR_SIZE,
      margin: 2,
      color: { dark: color, light: "#ffffff" },
    });

    canvas.width = QR_SIZE;
    canvas.height = QR_SIZE;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(offscreen, 0, 0);

    if (logoUrl) {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const size = Math.round(QR_SIZE * LOGO_RATIO);
          const x = Math.round((QR_SIZE - size) / 2);
          const y = Math.round((QR_SIZE - size) / 2);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(x - LOGO_PADDING, y - LOGO_PADDING, size + LOGO_PADDING * 2, size + LOGO_PADDING * 2);
          ctx.drawImage(img, x, y, size, size);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = logoUrl;
      });
    }

    setLoading(false);
  }, [url, color, logoUrl]);

  useEffect(() => {
    drawQR();
  }, [drawQR]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    const form = new FormData();
    form.append("file", file);
    form.append("businessId", businessId);

    const res = await fetch("/api/upload-logo", { method: "POST", body: form });
    if (res.ok) {
      const { logoUrl: newUrl } = await res.json();
      setLogoUrl(newUrl);
    } else {
      setUploadError("Upload failed. Please try again.");
    }
    setUploading(false);
    e.target.value = "";
  };

  const downloadQR = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `${businessName.replace(/\s+/g, "-").toLowerCase()}-qr.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* QR Preview */}
      <div className="p-4 rounded-2xl bg-white shadow-xl shadow-black/30">
        {loading && (
          <div className="w-[240px] h-[240px] bg-gray-100 animate-pulse rounded-lg" />
        )}
        <canvas ref={canvasRef} className={loading ? "hidden" : ""} />
      </div>

      {/* Color Presets */}
      <div className="w-full">
        <p className="text-white/40 text-xs mb-2.5">QR Color</p>
        <div className="flex gap-3">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.value}
              title={preset.name}
              onClick={() => setColor(preset.value)}
              className={`w-8 h-8 rounded-full transition-all duration-150 ${
                color === preset.value
                  ? "ring-2 ring-white ring-offset-2 ring-offset-[#050714] scale-110"
                  : "opacity-60 hover:opacity-90 hover:scale-105"
              }`}
              style={{ backgroundColor: preset.value }}
            />
          ))}
        </div>
        <p className="text-white/25 text-xs mt-1.5">
          {COLOR_PRESETS.find((p) => p.value === color)?.name}
        </p>
      </div>

      {/* Logo Upload */}
      <div className="w-full">
        <p className="text-white/40 text-xs mb-2.5">
          Business Logo{" "}
          <span className="text-white/25">(appears in center of QR)</span>
        </p>
        <label className="cursor-pointer w-full">
          <div
            className={`flex items-center gap-2.5 border rounded-xl px-3 py-2.5 text-sm transition-colors ${
              uploading
                ? "bg-white/5 border-white/10 text-white/40 cursor-not-allowed"
                : "bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20 text-white/60 hover:text-white"
            }`}
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin flex-shrink-0" />
                Uploading…
              </>
            ) : logoUrl ? (
              <>
                <img
                  src={logoUrl}
                  className="w-5 h-5 rounded object-cover flex-shrink-0"
                  alt=""
                />
                <span className="truncate">Change Logo</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Upload Logo
              </>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoUpload}
            disabled={uploading}
          />
        </label>
        {uploadError && (
          <p className="text-red-400 text-xs mt-1.5">{uploadError}</p>
        )}
      </div>

      {/* Download */}
      <button
        onClick={downloadQR}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 text-sm bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-300 px-4 py-2.5 rounded-xl transition-colors disabled:opacity-40"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download QR Code
      </button>
    </div>
  );
}
