"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Step = "name" | "gender" | "age" | "referral";

const STEPS: Step[] = ["name", "gender", "age", "referral"];

const GENDERS = ["Man", "Woman", "Non-binary", "Prefer not to say"];
const AGE_RANGES = ["Under 18", "18 – 24", "25 – 34", "35 – 44", "45 – 54", "55+"];
const REFERRALS = [
  { label: "Instagram", icon: "📸" },
  { label: "TikTok", icon: "🎵" },
  { label: "Google", icon: "🔍" },
  { label: "A friend", icon: "🤝" },
  { label: "Pinterest", icon: "📌" },
  { label: "Other", icon: "✨" },
];

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("name");
  const [animDir, setAnimDir] = useState<"r" | "l">("r");
  const [animating, setAnimating] = useState(false);
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [referral, setReferral] = useState("");

  const stepIndex = STEPS.indexOf(step);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const next = (dir: "r" | "l" = "r") => {
    setAnimDir(dir);
    setAnimating(true);
    setTimeout(() => {
      if (stepIndex < STEPS.length - 1) {
        setStep(STEPS[stepIndex + 1]);
      }
      setAnimating(false);
    }, 250);
  };

  const back = () => {
    if (stepIndex === 0) return;
    setAnimDir("l");
    setAnimating(true);
    setTimeout(() => {
      setStep(STEPS[stepIndex - 1]);
      setAnimating(false);
    }, 250);
  };

  const finish = () => {
    localStorage.setItem("staged_onboarding_data", JSON.stringify({ name, gender, age, referral }));
    localStorage.setItem("staged_onboarding_done", "1");
    router.push("/login");
  };

  const animClass = animating
    ? animDir === "r" ? "opacity-0 translate-x-8" : "opacity-0 -translate-x-8"
    : "opacity-100 translate-x-0";

  return (
    <main className="min-h-screen bg-[#FAFAF8] flex flex-col">
      {/* Header */}
      <div className="px-6 pt-10 pb-4">
        <div className="flex items-center gap-3 mb-6">
          {stepIndex > 0 && (
            <button
              onClick={back}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50 transition active:scale-95"
            >
              <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            </button>
          )}
          <div className="flex-1 h-1 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0F0F0F] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-neutral-400 tabular-nums">{stepIndex + 1} / {STEPS.length}</span>
        </div>

        <div className="flex items-center gap-2">
          <svg width="26" height="26" viewBox="0 0 64 64" fill="none">
            <rect width="64" height="64" rx="18" fill="#0F0F0F"/>
            <path d="M14 46 L14 26 L32 14 L50 26 L50 46 Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
            <rect x="24" y="34" width="16" height="12" rx="1" stroke="white" strokeWidth="2" fill="none"/>
            <rect x="20" y="26" width="10" height="8" rx="1" stroke="white" strokeWidth="2" fill="none"/>
          </svg>
          <span className="text-sm font-semibold tracking-widest uppercase text-neutral-900">Staged</span>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 flex flex-col px-6 pt-8 pb-10 max-w-md mx-auto w-full">
        <div
          className={`flex-1 flex flex-col transition-all duration-250 ease-out ${animClass}`}
          style={{ transitionDuration: "250ms" }}
        >
          {step === "name" && (
            <NameStep value={name} onChange={setName} onNext={() => name.trim() && next()} />
          )}
          {step === "gender" && (
            <GenderStep value={gender} onChange={(v) => { setGender(v); setTimeout(() => next(), 300); }} />
          )}
          {step === "age" && (
            <AgeStep value={age} onChange={(v) => { setAge(v); setTimeout(() => next(), 300); }} />
          )}
          {step === "referral" && (
            <ReferralStep value={referral} onChange={(v) => { setReferral(v); setTimeout(() => finish(), 300); }} />
          )}
        </div>

        {step === "name" && (
          <button
            onClick={() => name.trim() && next()}
            disabled={!name.trim()}
            className="w-full bg-[#0F0F0F] text-white rounded-2xl py-4 text-sm font-semibold disabled:opacity-30 active:scale-95 transition-all duration-150"
          >
            Continue
          </button>
        )}
      </div>
    </main>
  );
}

function NameStep({ value, onChange, onNext }: { value: string; onChange: (v: string) => void; onNext: () => void }) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="mb-10">
        <p className="text-xs font-semibold tracking-widest text-neutral-400 uppercase mb-3">Step 1</p>
        <h2 className="text-3xl font-bold text-neutral-900 leading-tight">What should<br />we call you?</h2>
        <p className="text-neutral-500 mt-2 text-sm">This helps us personalise your experience.</p>
      </div>
      <input
        autoFocus
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && value.trim() && onNext()}
        placeholder="Your first name"
        className="w-full bg-transparent border-b-2 border-neutral-200 focus:border-[#0F0F0F] outline-none text-2xl font-medium text-neutral-900 placeholder-neutral-300 py-3 transition-colors duration-200"
      />
    </div>
  );
}

function GenderStep({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="mb-10">
        <p className="text-xs font-semibold tracking-widest text-neutral-400 uppercase mb-3">Step 2</p>
        <h2 className="text-3xl font-bold text-neutral-900 leading-tight">How do<br />you identify?</h2>
        <p className="text-neutral-500 mt-2 text-sm">Helps us tailor style recommendations.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {GENDERS.map((g) => (
          <button
            key={g}
            onClick={() => onChange(g)}
            className={`rounded-2xl border-2 py-4 text-sm font-semibold transition-all duration-150 active:scale-95 ${
              value === g
                ? "border-[#0F0F0F] bg-[#0F0F0F] text-white"
                : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
            }`}
          >
            {g}
          </button>
        ))}
      </div>
    </div>
  );
}

function AgeStep({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="mb-10">
        <p className="text-xs font-semibold tracking-widest text-neutral-400 uppercase mb-3">Step 3</p>
        <h2 className="text-3xl font-bold text-neutral-900 leading-tight">What's your<br />age range?</h2>
        <p className="text-neutral-500 mt-2 text-sm">We keep this completely private.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {AGE_RANGES.map((a) => (
          <button
            key={a}
            onClick={() => onChange(a)}
            className={`rounded-2xl border-2 py-4 text-sm font-semibold transition-all duration-150 active:scale-95 ${
              value === a
                ? "border-[#0F0F0F] bg-[#0F0F0F] text-white"
                : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
            }`}
          >
            {a}
          </button>
        ))}
      </div>
    </div>
  );
}

function ReferralStep({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="mb-10">
        <p className="text-xs font-semibold tracking-widest text-neutral-400 uppercase mb-3">Step 4</p>
        <h2 className="text-3xl font-bold text-neutral-900 leading-tight">How did you<br />hear about us?</h2>
        <p className="text-neutral-500 mt-2 text-sm">Just curious — takes one tap.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {REFERRALS.map((r) => (
          <button
            key={r.label}
            onClick={() => onChange(r.label)}
            className={`rounded-2xl border-2 py-4 flex flex-col items-center gap-1.5 text-sm font-semibold transition-all duration-150 active:scale-95 ${
              value === r.label
                ? "border-[#0F0F0F] bg-[#0F0F0F] text-white"
                : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
            }`}
          >
            <span className="text-xl">{r.icon}</span>
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}
