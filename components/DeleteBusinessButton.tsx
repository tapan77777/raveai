"use client";

import { useState } from "react";

export default function DeleteBusinessButton({
  businessId,
  businessName,
}: {
  businessId: string;
  businessName: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const res = await fetch(`/api/businesses/${businessId}`, { method: "DELETE" });
    if (res.ok) {
      window.location.href = "/dashboard";
    } else {
      setDeleting(false);
      setConfirming(false);
      alert("Failed to delete. Please try again.");
    }
  };

  if (confirming) {
    return (
      <div className="mt-4 pt-4 border-t border-white/8">
        <p className="text-xs text-white/50 mb-3 leading-relaxed">
          Permanently delete <strong className="text-white/80">{businessName}</strong> and all its
          reviews? This cannot be undone.
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => setConfirming(false)}
            disabled={deleting}
            className="flex-1 text-xs text-white/50 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 text-xs text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/80 border border-red-500/30 px-3 py-2 rounded-lg transition-all disabled:opacity-50 font-medium"
          >
            {deleting ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-white/8">
      <button
        onClick={() => setConfirming(true)}
        className="text-xs text-red-400/60 hover:text-red-400 transition-colors flex items-center gap-1.5"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Delete Business
      </button>
    </div>
  );
}
