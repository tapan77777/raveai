"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

type Business = {
  id: string;
  name: string;
  type: string;
};

export default function BusinessSwitcher({
  businesses,
  selectedId,
}: {
  businesses: Business[];
  selectedId: string;
}) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {businesses.map((b) => (
        <button
          key={b.id}
          onClick={() => router.push(`/dashboard?business=${b.id}`)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            b.id === selectedId
              ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
              : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
          }`}
        >
          {b.name}
        </button>
      ))}
      <Link
        href="/dashboard/add-business"
        className="px-4 py-2 rounded-xl text-sm font-medium bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-all border border-dashed border-white/15 flex items-center gap-1.5"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Another Business
      </Link>
    </div>
  );
}
