"use client";

import { useRef, useState } from "react";
import StylePicker from "./StylePicker";
import RoomDetailsForm from "./RoomDetailsForm";
import type { Style } from "@/lib/types";
import type { RoomType } from "@/lib/roomOptions";

export default function UploadForm({
  onGenerate,
  loading,
}: {
  onGenerate: (
    image: string,
    style: Style,
    withVideo: boolean,
    roomType: RoomType,
    additions: string[]
  ) => void;
  loading: boolean;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [style, setStyle] = useState<Style>("scandi");
  const [withVideo, setWithVideo] = useState(false);
  const [roomType, setRoomType] = useState<RoomType>("living room");
  const [selectedFurniture, setSelectedFurniture] = useState<string[]>([]);
  const [otherFurniture, setOtherFurniture] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file) handleFile(file);
        }}
        className="rounded-xl border-2 border-dashed border-neutral-300 p-6 text-center cursor-pointer hover:border-neutral-400 transition"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Room preview" className="max-h-64 mx-auto rounded-lg" />
        ) : (
          <p className="text-sm text-neutral-500">
            Click or drag a photo of an empty / ugly room here
          </p>
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

      <RoomDetailsForm
        roomType={roomType}
        onRoomTypeChange={setRoomType}
        selectedFurniture={selectedFurniture}
        onSelectedFurnitureChange={setSelectedFurniture}
        otherFurniture={otherFurniture}
        onOtherFurnitureChange={setOtherFurniture}
      />

      <StylePicker value={style} onChange={setStyle} />

      <label className="flex items-center gap-2 text-sm text-neutral-600">
        <input
          type="checkbox"
          checked={withVideo}
          onChange={(e) => setWithVideo(e.target.checked)}
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
          onGenerate(preview, style, withVideo, roomType, additions);
        }}
        className="w-full rounded-xl bg-neutral-900 text-white py-3 font-medium disabled:opacity-40"
      >
        {loading ? "Staging your room…" : "Stage this room"}
      </button>
    </div>
  );
}
