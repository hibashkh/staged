import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Room } from "@/lib/types";

interface RoomStore {
  rooms: Room[];
  addRoom: (room: Room) => void;
  removeRoom: (id: string) => void;
}

export const useRoomStore = create<RoomStore>()(
  persist(
    (set) => ({
      rooms: [],
      addRoom: (room) =>
        set((state) => ({ rooms: [room, ...state.rooms] })),
      removeRoom: (id) =>
        set((state) => ({ rooms: state.rooms.filter((r) => r.id !== id) })),
    }),
    { name: "staged-rooms" }
  )
);
