export default function Loading() {
  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header skeleton */}
      <div className="flex items-center gap-4">
        <div className="skeleton h-12 w-12 rounded-2xl" />
        <div className="space-y-2">
          <div className="skeleton h-3 w-24 rounded-md" />
          <div className="skeleton h-7 w-56 rounded-lg" />
        </div>
      </div>

      {/* Stat cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="skeleton h-28 rounded-2xl"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div
          className="skeleton h-72 rounded-2xl"
          style={{ animationDelay: "300ms" }}
        />
        <div
          className="skeleton h-72 rounded-2xl"
          style={{ animationDelay: "450ms" }}
        />
      </div>

      {/* Watermark */}
      <div className="flex justify-center pt-4">
        <div className="flex items-center gap-2 text-slate-700 animate-breathing">
          <div className="h-6 w-6 rounded-lg bg-env/10 grid place-items-center">
            <div className="h-3 w-3 rounded-sm bg-env/20" />
          </div>
          <span className="text-xs font-medium tracking-wider uppercase">Loading</span>
        </div>
      </div>
    </div>
  );
}
