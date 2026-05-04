"use client";

import { useState } from "react";

export default function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 glass-card rounded-xl p-3 w-full">
      <span className="flex-1 text-sm text-white/60 truncate font-mono">{url}</span>
      <button
        onClick={copy}
        className="shrink-0 text-sm bg-violet-600/20 hover:bg-violet-600/40 border border-violet-500/30 text-violet-300 px-3 py-1.5 rounded-lg transition-colors"
      >
        {copied ? "✅ Copied!" : "Copy"}
      </button>
    </div>
  );
}
