"use client";

import { useAuth } from "@clerk/nextjs";
import Link from "next/link";

export default function NavButtons() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="text-sm text-violet-300 hover:text-white transition-colors"
        >
          Dashboard
        </Link>
        <Link href="/sign-out">
          <button className="text-sm text-white/50 hover:text-white transition-colors">
            Sign Out
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/sign-in">
        <button className="text-sm text-white/70 hover:text-white transition-colors">
          Sign In
        </button>
      </Link>
      <Link href="/sign-up">
        <button className="text-sm bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-full transition-colors">
          Get started
        </button>
      </Link>
    </div>
  );
}
