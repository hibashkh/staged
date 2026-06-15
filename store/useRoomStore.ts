import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Project, Room } from "@/lib/types";

interface RoomStore {
  rooms: Room[];
  projects: Project[];
  addRoom: (room: Room) => void;
  removeRoom: (id: string) => void;
  updateRoom: (id: string, changes: Partial<Room>) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, changes: Partial<Project>) => void;
  removeProject: (id: string) => void;
}

const MAX_STORED_ROOMS = 3;

export const useRoomStore = create<RoomStore>()(
  persist(
    (set) => ({
      rooms: [],
      projects: [],
      addRoom: (room) =>
        set((state) => ({ rooms: [room, ...state.rooms].slice(0, MAX_STORED_ROOMS) })),
      removeRoom: (id) =>
        set((state) => ({ rooms: state.rooms.filter((r) => r.id !== id) })),
      updateRoom: (id, changes) =>
        set((state) => ({
          rooms: state.rooms.map((r) => (r.id === id ? { ...r, ...changes } : r)),
        })),
      addProject: (project) =>
        set((state) => ({ projects: [project, ...state.projects] })),
      updateProject: (id, changes) =>
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? { ...p, ...changes } : p)),
        })),
      removeProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          rooms: state.rooms.map((r) => (r.projectId === id ? { ...r, projectId: null } : r)),
        })),
    }),
    {
      name: "staged-rooms",
      storage: {
        getItem: (name) => {
          const value = localStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: (name, value) => {
          let rooms = value.state.rooms as Room[];
          while (rooms.length > 0) {
            try {
              localStorage.setItem(name, JSON.stringify({ ...value, state: { ...value.state, rooms } }));
              return;
            } catch {
              rooms = rooms.slice(0, -1);
            }
          }
          localStorage.setItem(
            name,
            JSON.stringify({ ...value, state: { ...value.state, rooms: [] } })
          );
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);
