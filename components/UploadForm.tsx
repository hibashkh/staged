"use client";

import { useRef, useState } from "react";
import StylePicker from "./StylePicker";
import RoomDetailsForm from "./RoomDetailsForm";
import ProjectPicker from "./ProjectPicker";
import { useRoomStore } from "@/store/useRoomStore";
import type { Style } from "@/lib/types";
import { ROOM_TYPES, type RoomType } from "@/lib/roomOptions";

function isRoomType(value: string | undefined): value is RoomType {
  return !!value && (ROOM_TYPES as readonly string[]).includes(value);
}

export default function UploadForm({
  onGenerate,
  loading,
}: {
  onGenerate: (
    image: string,
    style: Style,
    withVideo: boolean,
    roomType: RoomType,
    additions: string[],
    budget: number | null,
    projectId: string | null,
    inspirationImage: string | null
  ) => void;
  loading: boolean;
}) {
  const { projects, addProject } = useRoomStore();
  const [preview, setPreview] = useState<string | null>(null);
  const [style, setStyle] = useState<Style>("scandi");
  const [withVideo, setWithVideo] = useState(false);
  const [roomType, setRoomType] = useState<RoomType>("living room");
  const [selectedFurniture, setSelectedFurniture] = useState<string[]>([]);
  const [otherFurniture, setOtherFurniture] = useState("");
  const [budget, setBudget] = useState("");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [inspirationPreview, setInspirationPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inspirationInputRef = useRef<HTMLInputElement>(null);

  const handleProjectChange = (id: string | null) => {
    setProjectId(id);
    const project = projects.find((p) => p.id === id);
    if (project) {
      if (project.style) setStyle(project.style);
      if (isRoomType(project.roomType)) setRoomType(project.roomType);
      if (project.budget) setBudget(String(project.budget));
    }
  };

  const handleCreateProject = async (name: string) => {
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create project");
      addProject(data.project);
      setProjectId(data.project.id);
    } catch (err) {
      console.error("create project failed:", err);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleInspirationFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setInspirationPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        className="rounded-xl border-2 border-dashed border-stone-300 p-6 text-center cursor-pointer hover:border-clay-400 hover:bg-clay-50/40 transition"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Room preview" className="max-h-64 mx-auto rounded-lg" />
        ) : (
          <div className="flex flex-col items-center gap-2 py-4 text-stone-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V19a2 2 0 002 2h14a2 2 0 002-2v-2.5M16 8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <p className="text-sm">
              Click or drag a photo of an empty / ugly room here
            </p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      <ProjectPicker
        projects={projects}
        selectedProjectId={projectId}
        onChange={handleProjectChange}
        onCreate={handleCreateProject}
      />

      <RoomDetailsForm
        roomType={roomType}
        onRoomTypeChange={setRoomType}
        selectedFurniture={selectedFurniture}
        onSelectedFurnitureChange={setSelectedFurniture}
        otherFurniture={otherFurniture}
        onOtherFurnitureChange={setOtherFurniture}
      />

      <StylePicker value={style} onChange={setStyle} />

      {style === "inspiration" && (
        <div
          onClick={() => inspirationInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) handleInspirationFile(file);
          }}
          className="rounded-xl border-2 border-dashed border-stone-300 p-4 text-center cursor-pointer hover:border-clay-400 hover:bg-clay-50/40 transition"
        >
          {inspirationPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={inspirationPreview} alt="Inspiration preview" className="max-h-40 mx-auto rounded-lg" />
          ) : (
            <p className="text-sm text-stone-500">
              Click or drag an inspiration photo here — we'll match its style
            </p>
          )}
          <input
            ref={inspirationInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleInspirationFile(file);
            }}
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Furniture budget (optional)
        </label>
        <input
          type="number"
          min="0"
          inputMode="decimal"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          placeholder="e.g. 1500"
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clay-500"
        />
        <p className="text-xs text-stone-400 mt-1">
          We'll pick matching furniture that fits within this total.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-stone-600">
        <input
          type="checkbox"
          checked={withVideo}
          onChange={(e) => setWithVideo(e.target.checked)}
          className="accent-clay-600"
        />
        Also generate a video walkthrough (slower)
      </label>

      <button
        type="button"
        disabled={!preview || loading}
        onClick={() => {
          if (!preview) return;
          const additions = [
            ...selectedFurniture,
            ...(otherFurniture.trim() ? [otherFurniture.trim()] : []),
          ];
          const parsedBudget = budget.trim() ? Number(budget) : null;
          onGenerate(
            preview,
            style,
            withVideo,
            roomType,
            additions,
            parsedBudget && parsedBudget > 0 ? parsedBudget : null,
            projectId,
            style === "inspiration" ? inspirationPreview : null
          );
        }}
        className="w-full rounded-xl bg-clay-600 text-white py-3 font-medium hover:bg-clay-700 transition disabled:opacity-40"
      >
        {loading ? "Staging your room…" : "Stage this room"}
      </button>
    </div>
  );
}
