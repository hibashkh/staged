export default function VideoPlayer({
  src,
  error,
  loading,
}: {
  src: string | null;
  error?: string | null;
  loading?: boolean;
}) {
  if (!src) {
    return (
      <div className="rounded-xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-400 bg-white">
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <span className="h-6 w-6 rounded-full border-2 border-clay-300 border-t-clay-600 animate-spin" />
            <span>Generating video walkthrough… this can take a couple of minutes.</span>
          </div>
        ) : error ? (
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
      className="w-full rounded-xl border border-stone-200 shadow-sm aspect-video object-cover"
    />
  );
}
