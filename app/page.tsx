"use client";

import { useEffect, useState } from "react";
import UploadForm from "@/components/UploadForm";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import ShopGrid from "@/components/ShopGrid";
import VideoPlayer from "@/components/VideoPlayer";
import Gallery from "@/components/Gallery";
import { useRoomStore } from "@/store/useRoomStore";
import type { Room, Style } from "@/lib/types";
import type { RoomType } from "@/lib/roomOptions";

interface PendingInput {
  image: string;
  style: Style;
  withVideo: boolean;
  roomType: RoomType;
  additions: string[];
  budget: number | null;
  projectId: string | null;
  inspirationImage: string | null;
}

export default function Home() {
  const { rooms, projects, setRooms, setProjects, addRoom, removeRoom, updateRoom, updateProject } = useRoomStore();
  const [active, setActive] = useState<Room | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingInput, setPendingInput] = useState<PendingInput | null>(null);

  useEffect(() => {
    fetch("/api/rooms")
      .then((r) => r.json())
      .then((data) => setRooms(data.rooms ?? []))
      .catch(() => {});
    fetch("/api/projects")
      .then((r) => r.json())
      .then((data) => setProjects(data.projects ?? []))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startVideo = (roomId: string) => {
    updateRoom(roomId, { videoLoading: true });
    setActive((current) => (current?.id === roomId ? { ...current, videoLoading: true } : current));

    fetch("/api/rooms/video", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId }),
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
          inspirationImage: input.inspirationImage,
          projectId: input.projectId,
          existingRoomId: existingId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");

      const room: Room = data.room;
      setPendingInput(input);
      if (existingId) {
        updateRoom(existingId, room);
      } else {
        addRoom(room);
      }
      setActive(room);

      if (input.projectId) {
        updateProject(input.projectId, {
          style: input.style,
          roomType: input.roomType,
          budget: input.budget,
        });
      }

      if (input.withVideo) startVideo(room.id);
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
    budget: number | null,
    projectId: string | null,
    inspirationImage: string | null
  ) => {
    runGenerate({ image, style, withVideo, roomType, additions, budget, projectId, inspirationImage });
  };

  const handleRetry = () => {
    if (!pendingInput || !active) return;
    runGenerate(pendingInput, active.id);
  };

  const handleRemove = async (id: string) => {
    removeRoom(id);
    if (active?.id === id) setActive(null);
    try {
      await fetch(`/api/rooms/${id}`, { method: "DELETE" });
    } catch {
      // best-effort; room already removed from local state
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      <header>
        <h1 className="font-serif text-3xl font-bold text-stone-900">Staged</h1>
        <p className="text-stone-500 mt-1">
          Upload a photo of an empty or outdated room, pick a style and budget, and get a
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
                className="w-full rounded-xl border border-stone-300 py-2 text-sm font-medium hover:bg-stone-100 disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {loading && <span className="h-4 w-4 rounded-full border-2 border-stone-300 border-t-clay-600 animate-spin" />}
                {loading ? "Generating…" : "Don't like it? Generate again"}
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-stone-300 p-10 text-center text-sm text-stone-400 h-full flex items-center justify-center">
              {loading ? "Staging your room…" : "Your before/after will appear here"}
            </div>
          )}
        </div>
      </section>

      {active && (
        <section className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-serif font-semibold text-lg text-stone-900">Shop this look</h2>
              {active.budget ? (
                <span className="text-sm text-stone-600">
                  <span className="font-semibold text-clay-700">${active.totalCost ?? 0}</span> of ${active.budget} budget
                </span>
              ) : null}
            </div>
            <ShopGrid items={active.items} />
          </div>

          <div>
            <h2 className="font-serif font-semibold text-lg text-stone-900 mb-3">Video walkthrough</h2>
            <VideoPlayer src={active.videoUrl} error={active.videoError} loading={active.videoLoading} />
          </div>
        </section>
      )}

      <Gallery
        rooms={rooms}
        projects={projects}
        onSelect={setActive}
        onRemove={handleRemove}
      />
    </main>
  );
}
