export default function EspaceClientLoading() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-40 rounded-lg bg-white/[0.04] animate-pulse" />
            <div className="h-7 w-64 rounded-lg bg-white/[0.06] animate-pulse" />
          </div>
          <div className="h-9 w-28 rounded-xl bg-white/[0.04] animate-pulse" />
        </div>

        {/* Stat cards skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-3">
              <div className="h-3 w-20 rounded bg-white/[0.04] animate-pulse" />
              <div className="h-8 w-12 rounded-lg bg-white/[0.06] animate-pulse" />
            </div>
          ))}
        </div>

        {/* Action cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-3">
              <div className="h-8 w-8 rounded-xl bg-white/[0.04] animate-pulse" />
              <div className="h-4 w-32 rounded bg-white/[0.06] animate-pulse" />
              <div className="h-3 w-44 rounded bg-white/[0.04] animate-pulse" />
            </div>
          ))}
        </div>

        {/* Dossier list skeleton */}
        <div className="space-y-4">
          <div className="h-5 w-36 rounded bg-white/[0.06] animate-pulse" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-48 rounded bg-white/[0.06] animate-pulse" />
                <div className="h-3 w-64 rounded bg-white/[0.04] animate-pulse" />
              </div>
              <div className="h-6 w-24 rounded-full bg-white/[0.04] animate-pulse" />
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}
