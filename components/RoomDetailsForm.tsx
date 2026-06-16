"use client";

import { FURNITURE_SUGGESTIONS, ROOM_TYPES, type RoomType } from "@/lib/roomOptions";

export default function RoomDetailsForm({
  roomType,
  onRoomTypeChange,
  selectedFurniture,
  onSelectedFurnitureChange,
  otherFurniture,
  onOtherFurnitureChange,
}: {
  roomType: RoomType;
  onRoomTypeChange: (roomType: RoomType) => void;
  selectedFurniture: string[];
  onSelectedFurnitureChange: (items: string[]) => void;
  otherFurniture: string;
  onOtherFurnitureChange: (value: string) => void;
}) {
  const suggestions = FURNITURE_SUGGESTIONS[roomType];

  const toggleFurniture = (item: string) => {
    if (selectedFurniture.includes(item)) {
      onSelectedFurnitureChange(selectedFurniture.filter((i) => i !== item));
    } else {
      onSelectedFurnitureChange([...selectedFurniture, item]);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          What type of room is this?
        </label>
        <select
          value={roomType}
          onChange={(e) => {
            onRoomTypeChange(e.target.value as RoomType);
            onSelectedFurnitureChange([]);
          }}
          suppressHydrationWarning
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        >
          {ROOM_TYPES.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Furniture/decor to add (optional)
        </label>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((item) => (
            <button
              key={item}
              type="button"
              suppressHydrationWarning
              onClick={() => toggleFurniture(item)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                selectedFurniture.includes(item)
                  ? "bg-neutral-900 text-white border-neutral-900"
                  : "border-neutral-300 text-neutral-600 hover:border-neutral-400"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Anything else? (optional)
        </label>
        <input
          type="text"
          value={otherFurniture}
          onChange={(e) => onOtherFurnitureChange(e.target.value)}
          placeholder="e.g. a reading nook, indoor plants, a piano…"
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}
