"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [onboardingName, setOnboardingName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem("staged_onboarding_data") ?? "{}");
      if (data.name) setOnboardingName(data.name);
    } catch {}
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  };

  return (
    <main className="min-h-screen bg-[#FAFAF8] flex flex-col">
      {/* Top brand strip */}
      <div className="px-6 pt-10 flex items-center gap-2">
        <svg width="26" height="26" viewBox="0 0 64 64" fill="none">
          <rect width="64" height="64" rx="18" fill="#0F0F0F"/>
          <path d="M14 46 L14 26 L32 14 L50 26 L50 46 Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
          <rect x="24" y="34" width="16" height="12" rx="1" stroke="white" strokeWidth="2" fill="none"/>
          <rect x="20" y="26" width="10" height="8" rx="1" stroke="white" strokeWidth="2" fill="none"/>
        </svg>
        <span className="text-sm font-semibold tracking-widest uppercase text-neutral-900">Staged</span>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-6 pb-10 max-w-sm mx-auto w-full">
        <div className="mb-10 anim-fade-up">
          {onboardingName ? (
            <>
              <h1 className="text-3xl font-bold text-neutral-900 leading-tight">
                Hey {onboardingName},<br />ready to get started?
              </h1>
              <p className="text-neutral-500 mt-2 text-sm">
                Create your account to save your rooms and results.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-neutral-900 leading-tight">
                Welcome<br />to Staged
              </h1>
              <p className="text-neutral-500 mt-2 text-sm">
                Sign in to save your rooms and results.
              </p>
            </>
          )}
        </div>

        <div className="space-y-3 anim-fade-up delay-100">
          {/* Google */}
          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-2xl border border-neutral-200 bg-white text-neutral-900 py-4 text-sm font-semibold shadow-sm hover:shadow-md hover:border-neutral-300 active:scale-95 transition-all duration-150 disabled:opacity-60"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-neutral-300 border-t-neutral-700 rounded-full animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Continue with Google
          </button>

          {/* Apple — UI only */}
          <button
            disabled
            className="w-full flex items-center justify-center gap-3 rounded-2xl border border-neutral-100 bg-neutral-50 text-neutral-400 py-4 text-sm font-semibold cursor-not-allowed"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-neutral-400 shrink-0">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Continue with Apple
            <span className="text-xs text-neutral-300 font-normal">coming soon</span>
          </button>
        </div>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3 anim-fade-up delay-200">
          <div className="flex-1 h-px bg-neutral-200" />
          <span className="text-xs text-neutral-400">or</span>
          <div className="flex-1 h-px bg-neutral-200" />
        </div>

        {/* Sign up / sign in toggle hint */}
        <p className="text-center text-xs text-neutral-400 anim-fade-up delay-300">
          New here? Your account is created automatically on first sign-in.
        </p>
      </div>

      <p className="pb-8 text-center text-xs text-neutral-400 px-6">
        By continuing you agree to our{" "}
        <span className="underline underline-offset-2 cursor-pointer">Terms</span> and{" "}
        <span className="underline underline-offset-2 cursor-pointer">Privacy Policy</span>
      </p>
    </main>
  );
}
