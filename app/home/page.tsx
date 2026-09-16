"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
const UploadForm = dynamic(() => import("@/components/UploadForm"), { ssr: false });
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import ShopGrid from "@/components/ShopGrid";
import ListingCopy from "@/components/ListingCopy";
import VideoPlayer from "@/components/VideoPlayer";
import Gallery from "@/components/Gallery";
import { useRoomStore } from "@/store/useRoomStore";
import type { Room, Style } from "@/lib/types";
import type { RoomType } from "@/lib/roomOptions";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [userName, setUserName] = useState("");
  const { rooms, addRoom, removeRoom, updateRoom } = useRoomStore();
  const [active, setActive] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user === null) { router.replace("/login"); return; }
    if (user) {
      if (!localStorage.getItem("staged_questionnaire_done")) { router.replace("/questionnaire"); return; }
      try {
        const d = JSON.parse(localStorage.getItem("staged_onboarding_data") ?? "{}");
        if (d.name) setUserName(d.name);
        else if (user.user_metadata?.full_name) setUserName(user.user_metadata.full_name.split(" ")[0]);
      } catch {}
    }
  }, [user, router]);

  const signOut = async () => {
    await createClient().auth.signOut();
    localStorage.removeItem("staged_questionnaire_done");
    localStorage.removeItem("staged_onboarding_done");
    router.replace("/");
  };

  const handleGenerate = async (
    image: string,
    style: Style,
    withVideo: boolean,
    roomType: RoomType,
    additions: string[],
    inspoImage: string | null
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/rooms/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, style, withVideo, roomType, additions, inspoImage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");

      const room: Room = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        beforeImage: image,
        style,
        afterImage: data.afterImage,
        inspoImage: inspoImage ?? null,
        items: data.items,
        listingCopy: data.listingCopy,
        videoUrl: null,
        videoError: null,
        sourceUrl: data.sourceUrl ?? null,
        videoLoading: withVideo,
      };
      addRoom(room);
      setActive(room);

      if (withVideo && data.sourceUrl) {
        fetch("/api/rooms/video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sourceUrl: data.sourceUrl, style }),
        })
          .then((r) => r.json())
          .then((v) => {
            const ch = { videoUrl: v.videoUrl ?? null, videoError: v.videoError ?? null, videoLoading: false };
            updateRoom(room.id, ch);
            setActive((cur) => cur?.id === room.id ? { ...cur, ...ch } : cur);
          })
          .catch((err) => {
            const ch = { videoUrl: null, videoError: err?.message ?? "Video failed", videoLoading: false };
            updateRoom(room.id, ch);
            setActive((cur) => cur?.id === room.id ? { ...cur, ...ch } : cur);
          });
      } else if (withVideo) {
        const ch = { videoUrl: null, videoError: "No image URL for video", videoLoading: false };
        updateRoom(room.id, ch);
        setActive((cur) => cur?.id === room.id ? { ...cur, ...ch } : cur);
      }
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (user === undefined) {
    return (
      <main className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-neutral-200 border-t-neutral-700 rounded-full animate-spin" />
      </main>
    );
  }
  if (!user) return null;

  return (
    <main className="min-h-screen bg-[#FAFAF8]">
      {/* Nav */}
      <nav className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="24" height="24" viewBox="0 0 64 64" fill="none">
              <rect width="64" height="64" rx="18" fill="#0F0F0F"/>
              <path d="M14 46 L14 26 L32 14 L50 26 L50 46 Z" stroke="white" strokeWidth="2.5" strokeLinejoin="round" fill="none"/>
              <rect x="24" y="34" width="16" height="12" rx="1" stroke="white" strokeWidth="2" fill="none"/>
              <rect x="20" y="26" width="10" height="8" rx="1" stroke="white" strokeWidth="2" fill="none"/>
            </svg>
            <span className="text-sm font-semibold tracking-widest uppercase text-neutral-900">Staged</span>
          </div>
          <div className="flex items-center gap-4">
            {userName && <span className="text-sm text-neutral-500 hidden sm:block">Hi, {userName}</span>}
            <button onClick={signOut} className="text-xs text-neutral-400 hover:text-neutral-700 transition">
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-5 py-10 space-y-10">
        {/* Hero */}
        <header className="anim-fade-up">
          <h1 className="text-3xl font-bold text-neutral-900">
            {userName ? `Stage a room, ${userName}` : "Stage a room"}
          </h1>
          <p className="text-neutral-500 mt-1 text-sm max-w-xl">
            Upload a photo, pick a style, and get a restyled image, a shoppable furniture list, listing copy, and a video walkthrough.
          </p>
        </header>

        {/* Main grid */}
        <section className="grid md:grid-cols-2 gap-8 anim-fade-up delay-100">
          <UploadForm onGenerate={handleGenerate} loading={loading} />

          <div className="space-y-4">
            {error && (
              <div className="rounded-xl bg-red-50 text-red-700 text-sm p-3 border border-red-100">
                {error}
              </div>
            )}
            {active?.afterImage ? (
              <BeforeAfterSlider beforeSrc={active.beforeImage} afterSrc={active.afterImage} />
            ) : (
              <div className="rounded-2xl border-2 border-dashed border-neutral-200 p-12 text-center text-sm text-neutral-400 h-full flex items-center justify-center bg-white">
                Your before / after will appear here
              </div>
            )}
          </div>
        </section>

        {active && (
          <section className="space-y-8 anim-fade-up">
            {active.listingCopy && <ListingCopy copy={active.listingCopy} />}
            <div>
              <h2 className="font-semibold mb-4 text-neutral-900">Shop this look</h2>
              <ShopGrid items={active.items} />
            </div>
            <div>
              <h2 className="font-semibold mb-4 text-neutral-900">Video walkthrough</h2>
              <VideoPlayer src={active.videoUrl} error={active.videoError} loading={active.videoLoading} />
            </div>
          </section>
        )}

        <Gallery
          rooms={rooms}
          onSelect={setActive}
          onRemove={(id) => {
            removeRoom(id);
            if (active?.id === id) setActive(null);
          }}
        />
      </div>
    </main>
  );
}
