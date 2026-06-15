import type { Project, Room } from "@/lib/types";

function RoomThumb({
  room,
  onSelect,
  onRemove,
}: {
  room: Room;
  onSelect: (room: Room) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="relative group">
      <button
        onClick={() => onSelect(room)}
        className="block w-full aspect-square rounded-lg overflow-hidden border border-neutral-200"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={room.afterImage ?? room.beforeImage}
          alt={room.style}
          className="w-full h-full object-cover"
        />
      </button>
      <div className="text-xs text-center mt-1 capitalize text-neutral-500">{room.style}</div>
      <button
        onClick={() => onRemove(room.id)}
        className="absolute top-1 right-1 bg-black/50 text-white text-xs w-5 h-5 rounded-full opacity-0 group-hover:opacity-100"
        aria-label="Remove"
      >
        ×
      </button>
    </div>
  );
}

export default function Gallery({
  rooms,
  projects,
  onSelect,
  onRemove,
}: {
  rooms: Room[];
  projects: Project[];
  onSelect: (room: Room) => void;
  onRemove: (id: string) => void;
}) {
  if (rooms.length === 0) return null;

  const unassigned = rooms.filter((r) => !r.projectId);
  const grouped = projects
    .map((project) => ({ project, rooms: rooms.filter((r) => r.projectId === project.id) }))
    .filter((g) => g.rooms.length > 0);

  return (
    <div className="space-y-6">
      {grouped.map(({ project, rooms: projectRooms }) => (
        <div key={project.id}>
          <h2 className="font-semibold mb-3">{project.name}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {projectRooms.map((room) => (
              <RoomThumb key={room.id} room={room} onSelect={onSelect} onRemove={onRemove} />
            ))}
          </div>
        </div>
      ))}

      {unassigned.length > 0 && (
        <div>
          <h2 className="font-semibold mb-3">Past stagings</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {unassigned.map((room) => (
              <RoomThumb key={room.id} room={room} onSelect={onSelect} onRemove={onRemove} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
