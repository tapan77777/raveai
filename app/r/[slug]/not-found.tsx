import Link from "next/link";

export default function ReviewNotFound() {
  return (
    <div className="min-h-screen bg-[#050714] text-white flex flex-col items-center justify-center px-4 text-center">
      <div className="text-6xl mb-4">🔍</div>
      <h1 className="text-2xl font-bold mb-2">Business not found</h1>
      <p className="text-white/40 text-sm mb-8">
        This review link doesn&apos;t exist or has been removed.
      </p>
      <Link
        href="/"
        className="text-violet-400 hover:text-violet-300 text-sm transition-colors"
      >
        ← Back to RaveAI
      </Link>
    </div>
  );
}
