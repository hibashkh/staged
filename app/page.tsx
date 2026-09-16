"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Splash() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const t = setTimeout(() => {
      const questionnaireDone = localStorage.getItem("staged_questionnaire_done");
      const onboardingDone = localStorage.getItem("staged_onboarding_done");
      if (questionnaireDone) router.replace("/home");
      else if (onboardingDone) router.replace("/login");
      else router.replace("/onboarding");
    }, 2600);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <main className="min-h-screen bg-[#0F0F0F] flex flex-col items-center justify-center">
      <div className={`flex flex-col items-center gap-6 transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"}`}>
        {/* Logo mark */}
        <div className="anim-scale-in">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="18" fill="white"/>
            <path d="M14 46 L14 26 L32 14 L50 26 L50 46 Z" stroke="#0F0F0F" strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
            <rect x="24" y="34" width="16" height="12" rx="1" stroke="#0F0F0F" strokeWidth="2" fill="none"/>
            <rect x="20" y="26" width="10" height="8" rx="1" stroke="#0F0F0F" strokeWidth="2" fill="none"/>
          </svg>
        </div>

        {/* Wordmark */}
        <div className="anim-fade-up delay-200 text-center">
          <h1 className="text-white text-4xl font-bold tracking-[0.18em] uppercase">Staged</h1>
          <p className="text-neutral-500 text-sm mt-2 tracking-widest uppercase">Your space, transformed</p>
        </div>
      </div>

      {/* Loading dots */}
      <div className="absolute bottom-16 flex gap-1.5 anim-fade-in delay-600">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-neutral-600"
            style={{ animation: `pulse-soft 1.2s ease-in-out ${i * 200}ms infinite` }}
          />
        ))}
      </div>
    </main>
  );
}
