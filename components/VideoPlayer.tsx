export default function VideoPlayer({
  src,
  error,
}: {
  src: string | null;
  error?: string | null;
}) {
  if (!src) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-400">
        {error ? (
          <>
            <p className="text-red-500">Video generation failed: {error}</p>
            <p className="mt-1">Your restyled photo and listing are still ready above.</p>
          </>
        ) : (
          "No walkthrough video yet."
        )}
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
