"use client";

import { useState } from "react";
import UploadForm from "@/components/UploadForm";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import ShopGrid from "@/components/ShopGrid";
import VideoPlayer from "@/components/VideoPlayer";
import Gallery from "@/components/Gallery";
import VariantPicker from "@/components/VariantPicker";
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
  const [variants, setVariants] = useState<RoomVariant[] | null>(null);

  const runGenerate = async (input: PendingInput) => {
    setLoading(true);
    setError(null);
    setVariants(null);
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
      setVariants(data.variants);
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

  const handleChooseVariant = (variant: RoomVariant) => {
    if (!pendingInput) return;
    const { image, style, withVideo, budget } = pendingInput;

    const room: Room = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      beforeImage: image,
      style,
      afterImage: variant.afterImage,
      items: variant.items,
      listingCopy: null,
      videoUrl: null,
      videoError: null,
      sourceUrl: variant.sourceUrl,
      videoLoading: withVideo,
      budget,
      totalCost: variant.totalCost,
    };

    addRoom(room);
    setActive(room);
    setVariants(null);
    setPendingInput(null);

    if (withVideo && variant.sourceUrl) {
      fetch("/api/rooms/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceUrl: variant.sourceUrl, style }),
      })
        .then((r) => r.json())
        .then((videoData) => {
          const changes = {
            videoUrl: videoData.videoUrl ?? null,
            videoError: videoData.videoError ?? null,
            videoLoading: false,
          };
          updateRoom(room.id, changes);
          setActive((current) => (current?.id === room.id ? { ...current, ...changes } : current));
        })
        .catch((err) => {
          const changes = { videoUrl: null, videoError: err?.message ?? "Video generation failed", videoLoading: false };
          updateRoom(room.id, changes);
          setActive((current) => (current?.id === room.id ? { ...current, ...changes } : current));
        });
    } else if (withVideo) {
      const changes = { videoUrl: null, videoError: "No image URL available for video generation", videoLoading: false };
      updateRoom(room.id, changes);
      setActive((current) => (current?.id === room.id ? { ...current, ...changes } : current));
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      <header>
        <h1 className="text-3xl font-bold">Staged</h1>
        <p className="text-neutral-500 mt-1">
          Upload a photo of an empty or ugly room, pick a style and budget, and get
          restyled options with a shoppable furniture list and a video walkthrough.
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
            <BeforeAfterSlider beforeSrc={active.beforeImage} afterSrc={active.afterImage} />
          ) : (
            <div className="rounded-xl border border-dashed border-neutral-300 p-10 text-center text-sm text-neutral-400 h-full flex items-center justify-center">
              Your before/after will appear here
            </div>
          )}
        </div>
      </section>

      {variants && pendingInput && (
        <VariantPicker
          beforeImage={pendingInput.image}
          variants={variants}
          budget={pendingInput.budget}
          loading={loading}
          onChoose={handleChooseVariant}
          onRegenerate={() => runGenerate(pendingInput)}
        />
      )}

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
