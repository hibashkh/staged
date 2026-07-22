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
        <label className="block text-sm font-medium text-stone-700 mb-1">
          What type of room is this?
        </label>
        <select
          value={roomType}
          onChange={(e) => {
            onRoomTypeChange(e.target.value as RoomType);
            onSelectedFurnitureChange([]);
          }}
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-clay-500"
        >
          {ROOM_TYPES.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Furniture/decor to add (optional)
        </label>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => toggleFurniture(item)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                selectedFurniture.includes(item)
                  ? "bg-clay-600 text-white border-clay-600"
                  : "border-stone-300 text-stone-600 hover:border-clay-400 hover:text-clay-700"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">
          Anything else? (optional)
        </label>
        <input
          type="text"
          value={otherFurniture}
          onChange={(e) => onOtherFurnitureChange(e.target.value)}
          placeholder="e.g. a reading nook, indoor plants, a piano…"
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clay-500"
        />
      </div>
    </div>
  );
}
