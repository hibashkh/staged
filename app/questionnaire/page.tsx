"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const QUESTIONS = [
  {
    id: "goal",
    step: "01",
    question: "What brings you to Staged?",
    subtitle: "Let's personalise your experience from the start.",
    options: [
      { value: "sell", label: "Selling my home", icon: "🏡" },
      { value: "rent", label: "Renting it out", icon: "🔑" },
      { value: "redesign", label: "Personal redesign", icon: "✨" },
      { value: "pro", label: "Real estate pro", icon: "💼" },
    ],
  },
  {
    id: "room",
    step: "02",
    question: "Which room are we starting with?",
    subtitle: "We'll tailor suggestions to your space.",
    options: [
      { value: "living", label: "Living room", icon: "🛋️" },
      { value: "bedroom", label: "Bedroom", icon: "🛏️" },
      { value: "kitchen", label: "Kitchen", icon: "🍳" },
      { value: "dining", label: "Dining room", icon: "🍽️" },
      { value: "office", label: "Home office", icon: "💻" },
      { value: "other", label: "Other", icon: "🏠" },
    ],
  },
  {
    id: "style",
    step: "03",
    question: "How would you describe your style?",
    subtitle: "Pick the vibe that speaks to you.",
    options: [
      { value: "modern", label: "Modern & clean", icon: "◻️" },
      { value: "scandi", label: "Scandi & minimal", icon: "🌿" },
      { value: "cozy", label: "Cozy & warm", icon: "🕯️" },
      { value: "luxe", label: "Luxe & dramatic", icon: "🖤" },
      { value: "boho", label: "Bohemian", icon: "🌸" },
      { value: "industrial", label: "Industrial", icon: "⚙️" },
    ],
  },
  {
    id: "color",
    step: "04",
    question: "What's your color vibe?",
    subtitle: "Colors set the whole mood.",
    options: [
      { value: "neutral", label: "Neutral & timeless", icon: "🤍" },
      { value: "bold", label: "Bold & vibrant", icon: "🎨" },
      { value: "earthy", label: "Earthy & warm", icon: "🌰" },
      { value: "cool", label: "Cool & airy", icon: "🩵" },
    ],
  },
  {
    id: "light",
    step: "05",
    question: "How do you feel about natural light?",
    subtitle: "Light is everything in staging.",
    options: [
      { value: "max", label: "The more, the better", icon: "☀️" },
      { value: "some", label: "A good amount", icon: "🌤️" },
      { value: "moody", label: "I love moody vibes", icon: "🌑" },
      { value: "flexible", label: "Whatever works", icon: "🙂" },
    ],
  },
  {
    id: "furniture",
    step: "06",
    question: "Pick your furniture preference",
    subtitle: "This helps us style your space just right.",
    options: [
      { value: "minimal", label: "Minimal & sleek", icon: "🪑" },
      { value: "layered", label: "Cozy & layered", icon: "🛋️" },
      { value: "classic", label: "Classic & timeless", icon: "🏛️" },
      { value: "mixed", label: "Mix it up", icon: "🎭" },
    ],
  },
  {
    id: "storage",
    step: "07",
    question: "How important is storage?",
    subtitle: "Buyers always notice a well-organised space.",
    options: [
      { value: "critical", label: "Very important", icon: "📦" },
      { value: "some", label: "Some is nice", icon: "🗄️" },
      { value: "low", label: "Not a priority", icon: "💨" },
    ],
  },
  {
    id: "timeline",
    step: "08",
    question: "What's your timeline?",
    subtitle: "So we know how fast to move.",
    options: [
      { value: "now", label: "ASAP — let's go!", icon: "⚡" },
      { value: "week", label: "Within a week", icon: "📅" },
      { value: "month", label: "This month", icon: "🗓️" },
      { value: "exploring", label: "Just exploring", icon: "👀" },
    ],
  },
  {
    id: "rooms_count",
    step: "09",
    question: "How many rooms need staging?",
    subtitle: "Just to get a sense of the scope.",
    options: [
      { value: "1", label: "Just 1", icon: "1️⃣" },
      { value: "2-3", label: "2 or 3", icon: "2️⃣" },
      { value: "4-5", label: "4 to 5", icon: "🏘️" },
      { value: "6+", label: "6 or more", icon: "🏢" },
    ],
  },
  {
    id: "priority",
    step: "10",
    question: "What matters most to you?",
    subtitle: "We'll put extra focus right here.",
    options: [
      { value: "photo", label: "Stunning photos", icon: "📸" },
      { value: "buyer", label: "Buyer appeal", icon: "🤝" },
      { value: "comfort", label: "Personal comfort", icon: "🛌" },
      { value: "social", label: "Social media worthy", icon: "📱" },
    ],
  },
  {
    id: "budget",
    step: "11",
    question: "Do you have a budget in mind?",
    subtitle: "No pressure — just helps us suggest the right pieces.",
    options: [
      { value: "low", label: "Under $1,000", icon: "💵" },
      { value: "mid", label: "$1k – $5k", icon: "💳" },
      { value: "high", label: "$5k – $15k", icon: "💎" },
      { value: "premium", label: "$15,000+", icon: "🏆" },
    ],
  },
  {
    id: "avoid",
    step: "12",
    question: "Any style you absolutely hate?",
    subtitle: "We'll make sure to steer clear.",
    options: [
      { value: "clutter", label: "Too cluttered", icon: "😩" },
      { value: "sparse", label: "Too minimal", icon: "😐" },
      { value: "dark", label: "Dark & heavy", icon: "🌑" },
      { value: "loud", label: "Loud colors", icon: "🙈" },
    ],
  },
  {
    id: "challenge",
    step: "13",
    question: "What's your biggest staging challenge?",
    subtitle: "Let's tackle it head-on.",
    options: [
      { value: "empty", label: "Completely empty room", icon: "🪣" },
      { value: "old", label: "Outdated furniture", icon: "🪑" },
      { value: "lighting", label: "Bad lighting", icon: "💡" },
      { value: "small", label: "Small or awkward space", icon: "📐" },
    ],
  },
  {
    id: "inspiration",
    step: "14",
    question: "Where do you usually get inspired?",
    subtitle: "We'll speak your visual language.",
    options: [
      { value: "pinterest", label: "Pinterest", icon: "📌" },
      { value: "instagram", label: "Instagram", icon: "📷" },
      { value: "magazines", label: "Magazines", icon: "📖" },
      { value: "tv", label: "TV shows", icon: "📺" },
    ],
  },
  {
    id: "experience",
    step: "15",
    question: "What would make this a 10 / 10?",
    subtitle: "Your perfect outcome is our goal.",
    options: [
      { value: "speed", label: "Super fast results", icon: "⚡" },
      { value: "quality", label: "Stunning quality", icon: "🌟" },
      { value: "value", label: "Great value", icon: "💰" },
      { value: "all", label: "All of the above!", icon: "🎯" },
    ],
  },
];

export default function QuestionnairePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [enterDir, setEnterDir] = useState<"r" | "l">("r");
  const [done, setDone] = useState(false);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => {
        if (!data.user) { router.replace("/login"); return; }
        if (localStorage.getItem("staged_questionnaire_done")) { router.replace("/home"); return; }
        setReady(true);
      });
  }, [router]);

  useEffect(() => {
    setSelected(answers[QUESTIONS[current].id] ?? null);
  }, [current, answers]);

  const choose = (value: string) => {
    setSelected(value);
    const next = { ...answers, [QUESTIONS[current].id]: value };
    setAnswers(next);

    if (current < QUESTIONS.length - 1) {
      setTimeout(() => {
        setLeaving(true);
        setEnterDir("r");
        setTimeout(() => {
          setCurrent((c) => c + 1);
          setLeaving(false);
        }, 220);
      }, 260);
    } else {
      setTimeout(() => {
        localStorage.setItem("staged_questionnaire", JSON.stringify(next));
        localStorage.setItem("staged_questionnaire_done", "1");
        setDone(true);
        setTimeout(() => router.replace("/home"), 2000);
      }, 300);
    }
  };

  const back = () => {
    if (current === 0) return;
    setLeaving(true);
    setEnterDir("l");
    setTimeout(() => {
      setCurrent((c) => c - 1);
      setLeaving(false);
    }, 220);
  };

  if (!ready && !done) {
    return (
      <main className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-neutral-200 border-t-neutral-700 rounded-full animate-spin" />
      </main>
    );
  }

  if (done) {
    return (
      <main className="min-h-screen bg-[#0F0F0F] flex flex-col items-center justify-center gap-5">
        <div className="anim-scale-in text-5xl">🎉</div>
        <div className="anim-fade-up delay-200 text-center space-y-1">
          <h2 className="text-2xl font-bold text-white">You're all set!</h2>
          <p className="text-neutral-500 text-sm">Setting up your personalised workspace…</p>
        </div>
        <div className="mt-2 w-5 h-5 border-2 border-neutral-700 border-t-neutral-300 rounded-full animate-spin anim-fade-in delay-400" />
      </main>
    );
  }

  const q = QUESTIONS[current];
  const progress = (current / QUESTIONS.length) * 100;
  const slideClass = leaving
    ? enterDir === "r" ? "opacity-0 -translate-x-8" : "opacity-0 translate-x-8"
    : "opacity-100 translate-x-0";

  return (
    <main className="min-h-screen bg-[#FAFAF8] flex flex-col">
      {/* Top bar */}
      <div className="px-5 pt-10 pb-2">
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={back}
            disabled={current === 0}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-neutral-200 text-neutral-500 disabled:opacity-0 hover:bg-neutral-50 transition active:scale-95"
          >
            <svg viewBox="0 0 20 20" className="w-4 h-4 fill-current">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
          </button>
          <div className="flex-1 h-1 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0F0F0F] rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-neutral-400 tabular-nums w-10 text-right">{current + 1} / {QUESTIONS.length}</span>
        </div>

        <div className="flex items-center gap-2">
          <svg width="22" height="22" viewBox="0 0 64 64" fill="none">
            <rect width="64" height="64" rx="18" fill="#0F0F0F"/>
            <path d="M14 46 L14 26 L32 14 L50 26 L50 46 Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
            <rect x="24" y="34" width="16" height="12" rx="1" stroke="white" strokeWidth="2" fill="none"/>
            <rect x="20" y="26" width="10" height="8" rx="1" stroke="white" strokeWidth="2" fill="none"/>
          </svg>
          <span className="text-xs font-semibold tracking-widest uppercase text-neutral-400">Staged</span>
        </div>
      </div>

      {/* Question area */}
      <div className="flex-1 flex flex-col px-5 pt-6 pb-8 max-w-lg mx-auto w-full">
        <div
          key={current}
          className={`flex-1 flex flex-col transition-all duration-[220ms] ease-out ${slideClass}`}
        >
          {/* Step tag */}
          <p className="text-xs font-bold tracking-widest text-neutral-400 uppercase mb-3">
            Question {q.step}
          </p>

          <h2 className="text-2xl font-bold text-neutral-900 leading-snug mb-1">{q.question}</h2>
          <p className="text-sm text-neutral-500 mb-8">{q.subtitle}</p>

          <div className={`grid gap-3 ${q.options.length <= 4 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
            {q.options.map((opt) => {
              const isSelected = selected === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => choose(opt.value)}
                  className={`
                    relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 px-3 py-5
                    text-sm font-semibold text-center transition-all duration-150 active:scale-95
                    ${isSelected
                      ? "border-[#0F0F0F] bg-[#0F0F0F] text-white shadow-lg scale-[1.03]"
                      : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400 hover:shadow-sm"
                    }
                  `}
                >
                  <span className="text-2xl leading-none">{opt.icon}</span>
                  <span className="leading-tight">{opt.label}</span>
                  {isSelected && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                      <svg viewBox="0 0 12 12" className="w-3 h-3">
                        <path d="M2 6l3 3 5-5" stroke="#0F0F0F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-center text-xs text-neutral-400 mt-4">Tap any option to continue</p>
      </div>
    </main>
  );
}
