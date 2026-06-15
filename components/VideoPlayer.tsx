export default function VideoPlayer({ src }: { src: string | null }) {
  if (!src) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-400">
        No walkthrough video yet.
      </div>
    );
  }

  return (
    <video
      src={src}
      controls
      loop
      muted
      playsInline
      className="w-full rounded-xl border border-neutral-200 aspect-video object-cover"
    />
  );
}
