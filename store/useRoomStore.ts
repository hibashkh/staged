import { create } from "zustand";
import type { Project, Room } from "@/lib/types";

interface RoomStore {
  rooms: Room[];
  projects: Project[];
  setRooms: (rooms: Room[]) => void;
  setProjects: (projects: Project[]) => void;
  addRoom: (room: Room) => void;
  removeRoom: (id: string) => void;
  updateRoom: (id: string, changes: Partial<Room>) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, changes: Partial<Project>) => void;
  removeProject: (id: string) => void;
}

export const useRoomStore = create<RoomStore>()((set) => ({
  rooms: [],
  projects: [],
  setRooms: (rooms) => set({ rooms }),
  setProjects: (projects) => set({ projects }),
  addRoom: (room) => set((state) => ({ rooms: [room, ...state.rooms] })),
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
}));
