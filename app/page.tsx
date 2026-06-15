"use client";

import { useState } from "react";
import UploadForm from "@/components/UploadForm";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import ShopGrid from "@/components/ShopGrid";
import ListingCopy from "@/components/ListingCopy";
import VideoPlayer from "@/components/VideoPlayer";
import Gallery from "@/components/Gallery";
import { useRoomStore } from "@/store/useRoomStore";
import type { Room, Style } from "@/lib/types";
import type { RoomType } from "@/lib/roomOptions";

export default function Home() {
  const { rooms, addRoom, removeRoom, updateRoom } = useRoomStore();
  const [active, setActive] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (
    image: string,
    style: Style,
    withVideo: boolean,
    roomType: RoomType,
    additions: string[]
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/rooms/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, style, withVideo, roomType, additions }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");

      const room: Room = {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        beforeImage: image,
        style,
        afterImage: data.afterImage,
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
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      <header>
        <h1 className="text-3xl font-bold">Staged</h1>
        <p className="text-neutral-500 mt-1">
          Upload a photo of an empty or ugly room, pick a style, and get a restyled
          photo, a shoppable furniture list, listing copy, and a video walkthrough.
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

      {active && (
        <section className="space-y-6">
          {active.listingCopy && <ListingCopy copy={active.listingCopy} />}

          <div>
            <h2 className="font-semibold mb-3">Shop this look</h2>
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
