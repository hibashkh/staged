"use client";

import { useState } from "react";
import type { Project } from "@/lib/types";

const NEW_PROJECT_VALUE = "__new__";

export default function ProjectPicker({
  projects,
  selectedProjectId,
  onChange,
  onCreate,
}: {
  projects: Project[];
  selectedProjectId: string | null;
  onChange: (projectId: string | null) => void;
  onCreate: (name: string) => void;
}) {
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  return (
    <div>
      <label className="block text-sm font-medium text-stone-700 mb-1">
        Project (house / unit)
      </label>

      {creating ? (
        <div className="flex gap-2">
          <input
            type="text"
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Tampines 3-room flat"
            className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-clay-500"
          />
          <button
            type="button"
            onClick={() => {
              if (!newName.trim()) return;
              onCreate(newName.trim());
              setNewName("");
              setCreating(false);
            }}
            className="rounded-lg bg-clay-600 text-white text-sm px-3 py-2 hover:bg-clay-700"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setCreating(false);
              setNewName("");
            }}
            className="rounded-lg border border-stone-300 text-sm px-3 py-2 hover:bg-stone-50"
          >
            Cancel
          </button>
        </div>
      ) : (
        <select
          value={selectedProjectId ?? ""}
          onChange={(e) => {
            const value = e.target.value;
            if (value === NEW_PROJECT_VALUE) {
              setCreating(true);
              return;
            }
            onChange(value || null);
          }}
          className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-clay-500"
        >
          <option value="">No project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
          <option value={NEW_PROJECT_VALUE}>+ New project…</option>
        </select>
      )}

      <p className="text-xs text-stone-400 mt-1">
        Group rooms from the same house/unit and reuse its style, room types, and budget.
      </p>
    </div>
  );
}
