import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#050714] flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[100px]" />
      </div>
      <div className="relative z-10 w-full flex flex-col items-center">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-lg font-bold text-white">
              R
            </div>
            <span className="font-bold text-white text-2xl">RaveAI</span>
          </div>
          <p className="text-white/50 text-sm">Welcome back</p>
        </div>
        <SignIn
          appearance={{
            variables: {
              colorPrimary: "#7c3aed",
              colorBackground: "#0d0d1a",
              colorText: "#f0f0ff",
              colorTextSecondary: "#9ca3af",
              colorInputBackground: "#1a1a2e",
              colorInputText: "#f0f0ff",
              borderRadius: "12px",
            },
          }}
        />
      </div>
    </div>
  );
}
