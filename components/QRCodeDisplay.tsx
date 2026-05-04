"use client";

import { useEffect, useRef, useState } from "react";

interface QRCodeDisplayProps {
  url: string;
  businessName: string;
}

export default function QRCodeDisplay({ url, businessName }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function generate() {
      const QRCode = (await import("qrcode")).default;
      if (cancelled || !canvasRef.current) return;
      await QRCode.toCanvas(canvasRef.current, url, {
        width: 220,
        margin: 2,
        color: { dark: "#ffffff", light: "#0d0d1a" },
      });
      setLoading(false);
    }
    generate();
    return () => { cancelled = true; };
  }, [url]);

  const downloadQR = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `${businessName.replace(/\s+/g, "-").toLowerCase()}-qr.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="p-3 rounded-xl bg-[#0d0d1a] border border-white/10">
        {loading && (
          <div className="w-[220px] h-[220px] shimmer-loading rounded-lg" />
        )}
        <canvas ref={canvasRef} className={loading ? "hidden" : ""} />
      </div>
      <button
        onClick={downloadQR}
        className="flex items-center gap-2 text-sm bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-300 px-4 py-2 rounded-xl transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Download QR Code
      </button>
    </div>
  );
}
