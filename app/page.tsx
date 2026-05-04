import Link from "next/link";
import NavButtons from "@/components/NavButtons";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050714] text-white overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-sm font-bold">
            R
          </div>
          <span className="font-semibold text-white text-lg">RaveAI</span>
        </div>
        <NavButtons />
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center pt-20">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-violet-600/20 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-purple-800/15 rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-2 text-sm text-violet-300 mb-8">
            <span className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
            AI-Powered Review Generation
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            Turn happy customers into{" "}
            <span className="gradient-text">5-star reviews.</span>{" "}
            <span className="text-white/90">Instantly.</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
            Share a QR code. Customers tap their rating. AI writes the perfect
            review. They post it in one click. That simple.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up">
              <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold text-lg">
                Get Started Free
              </button>
            </Link>
            <Link
              href="/r/demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-white/10 hover:border-violet-500/50 text-white/70 hover:text-white font-medium px-8 py-4 rounded-2xl text-lg transition-all duration-200"
            >
              See Demo
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-white/40 rounded-full" />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How it{" "}
              <span className="gradient-text">works</span>
            </h2>
            <p className="text-white/50 text-lg">Three steps to more reviews</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: "🏪",
                title: "Add your business",
                desc: "Register your business and get a unique QR code and link instantly.",
              },
              {
                step: "02",
                icon: "⭐",
                title: "Customer scans & rates",
                desc: "They tap an emoji, choose tags, and AI crafts the perfect review.",
              },
              {
                step: "03",
                icon: "🚀",
                title: "Review posted",
                desc: "One tap copies + opens Google, TripAdvisor, or MakeMyTrip.",
              },
            ].map((item) => (
              <div key={item.step} className="glass-card rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-4 right-4 text-6xl font-black text-white/5">
                  {item.step}
                </div>
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything you need to{" "}
              <span className="gradient-text">dominate reviews</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "🤖", title: "AI Review Writer", desc: "Gemini AI generates natural, human-sounding reviews tailored to your business." },
              { icon: "📱", title: "Mobile-First UX", desc: "Buttery smooth experience designed for phones. No friction, no confusion." },
              { icon: "📊", title: "Analytics Dashboard", desc: "Track reviews, ratings, and platform performance in real-time." },
              { icon: "🔒", title: "Private Feedback", desc: "Unhappy customers go to a private channel. Fix issues before they go public." },
              { icon: "🔗", title: "QR Code + Link", desc: "Print your QR code or share your link anywhere — table cards, receipts, social." },
              { icon: "⚡", title: "Multi-Platform", desc: "Google, MakeMyTrip, TripAdvisor, and WhatsApp — all in one flow." },
            ].map((f) => (
              <div key={f.title} className="glass-card rounded-2xl p-6 hover:border-violet-500/30 transition-all duration-300">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-white/40 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">
            Ready to collect more{" "}
            <span className="gradient-text">5-star reviews?</span>
          </h2>
          <p className="text-white/50 text-lg mb-8">
            Join businesses using RaveAI to build trust and attract more customers.
          </p>
          <Link href="/sign-up">
            <button className="px-10 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold text-lg">
              Get Started Free — No credit card required
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/5 text-center text-white/30 text-sm">
        <p>© 2025 RaveAI. All rights reserved.</p>
      </footer>
    </div>
  );
}
