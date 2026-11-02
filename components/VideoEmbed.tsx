export function VideoEmbed({ src, poster, caption }: { src: string; poster?: string; caption?: string }) {
  return (
    <figure className="my-10">
      <video
        src={src}
        poster={poster}
        controls
        playsInline
        preload="metadata"
        className="w-full rounded-lg border border-slate-200 dark:border-slate-800"
      />
      {caption && (
        <figcaption className="mt-3 text-center text-sm text-slate-500 dark:text-slate-400">{caption}</figcaption>
      )}
    </figure>
  );
}
