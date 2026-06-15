"use client";

import { useState } from "react";
import UploadForm from "@/components/UploadForm";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import ShopGrid from "@/components/ShopGrid";
import VideoPlayer from "@/components/VideoPlayer";
import Gallery from "@/components/Gallery";
import { useRoomStore } from "@/store/useRoomStore";
import type { Room, RoomVariant, Style } from "@/lib/types";
import type { RoomType } from "@/lib/roomOptions";

interface PendingInput {
  image: string;
  style: Style;
  withVideo: boolean;
  roomType: RoomType;
  additions: string[];
  budget: number | null;
}

export default function Home() {
  const { rooms, addRoom, removeRoom, updateRoom } = useRoomStore();
  const [active, setActive] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingInput, setPendingInput] = useState<PendingInput | null>(null);

  const startVideo = (roomId: string, sourceUrl: string, style: Style) => {
    fetch("/api/rooms/video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceUrl, style }),
    })
      .then((r) => r.json())
      .then((videoData) => {
        const changes = {
          videoUrl: videoData.videoUrl ?? null,
          videoError: videoData.videoError ?? null,
          videoLoading: false,
        };
        updateRoom(roomId, changes);
        setActive((current) => (current?.id === roomId ? { ...current, ...changes } : current));
      })
      .catch((err) => {
        const changes = { videoUrl: null, videoError: err?.message ?? "Video generation failed", videoLoading: false };
        updateRoom(roomId, changes);
        setActive((current) => (current?.id === roomId ? { ...current, ...changes } : current));
      });
  };

  const applyVariant = (
    variant: RoomVariant,
    input: PendingInput,
    existingId?: string
  ) => {
    const room: Room = {
      id: existingId ?? crypto.randomUUID(),
      createdAt: Date.now(),
      beforeImage: input.image,
      style: input.style,
      afterImage: variant.afterImage,
      items: variant.items,
      listingCopy: null,
      videoUrl: null,
      videoError: null,
      sourceUrl: variant.sourceUrl,
      videoLoading: input.withVideo,
      budget: input.budget,
      totalCost: variant.totalCost,
    };

    if (existingId) {
      updateRoom(existingId, room);
    } else {
      addRoom(room);
    }
    setActive(room);

    if (input.withVideo && variant.sourceUrl) {
      startVideo(room.id, variant.sourceUrl, input.style);
    } else if (input.withVideo) {
      const changes = { videoUrl: null, videoError: "No image URL available for video generation", videoLoading: false };
      updateRoom(room.id, changes);
      setActive((current) => (current?.id === room.id ? { ...current, ...changes } : current));
    }
  };

  const runGenerate = async (input: PendingInput, existingId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/rooms/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: input.image,
          style: input.style,
          roomType: input.roomType,
          additions: input.additions,
          budget: input.budget,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");

      setPendingInput(input);
      applyVariant(data.variants[0], input, existingId);
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = (
    image: string,
    style: Style,
    withVideo: boolean,
    roomType: RoomType,
    additions: string[],
    budget: number | null
  ) => {
    runGenerate({ image, style, withVideo, roomType, additions, budget });
  };

  const handleRetry = () => {
    if (!pendingInput || !active) return;
    runGenerate(pendingInput, active.id);
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      <header>
        <h1 className="text-3xl font-bold">Staged</h1>
        <p className="text-neutral-500 mt-1">
          Upload a photo of an empty or ugly room, pick a style and budget, and get a
          restyled photo with a shoppable furniture list and a video walkthrough.
        </p>
      </header>

      <section className="grid md:grid-cols-2 gap-8">
        <UploadForm onGenerate={handleGenerate} loading={loading} />

        <div className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 text-red-700 text-sm p-3 border border-red-200">
              {error}
            </div>
          )}

          {active?.afterImage ? (
            <div className="space-y-3">
              <BeforeAfterSlider beforeSrc={active.beforeImage} afterSrc={active.afterImage} />
              <button
                type="button"
                onClick={handleRetry}
                disabled={loading}
                className="w-full rounded-xl border border-neutral-300 py-2 text-sm font-medium hover:bg-neutral-100 disabled:opacity-40"
              >
                {loading ? "Generating…" : "Don't like it? Generate again"}
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center text-sm text-neutral-400 h-full flex items-center justify-center">
              Your before/after will appear here
            </div>
          )}
        </div>
      </section>

      {active && (
        <section className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Shop this look</h2>
              {active.budget ? (
                <span className="text-sm text-neutral-600">
                  ${active.totalCost ?? 0} of ${active.budget} budget
                </span>
              ) : null}
            </div>
            <ShopGrid items={active.items} />
          </div>

          <div>
            <h2 className="font-semibold mb-3">Video walkthrough</h2>
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
    </main>
  );
}
