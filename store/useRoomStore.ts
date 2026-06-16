import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Room } from "@/lib/types";

interface RoomStore {
  rooms: Room[];
  addRoom: (room: Room) => void;
  removeRoom: (id: string) => void;
  updateRoom: (id: string, changes: Partial<Room>) => void;
}

export const useRoomStore = create<RoomStore>()(
  persist(
    (set) => ({
      rooms: [],
      addRoom: (room) =>
        set((state) => ({ rooms: [room, ...state.rooms].slice(0, 3) })),
      removeRoom: (id) =>
        set((state) => ({ rooms: state.rooms.filter((r) => r.id !== id) })),
      updateRoom: (id, changes) =>
        set((state) => ({
          rooms: state.rooms.map((r) => (r.id === id ? { ...r, ...changes } : r)),
        })),
    }),
    {
      name: "staged-rooms",
      partialize: (state) => ({
        rooms: state.rooms.map(({ beforeImage: _, ...rest }) => rest),
      }),
    }
  )
);
