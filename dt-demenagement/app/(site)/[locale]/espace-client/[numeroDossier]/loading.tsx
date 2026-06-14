export default function DossierLoading() {
  return (
    <main className="min-h-screen bg-[var(--color-bg)] py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Breadcrumb + header */}
        <div className="space-y-3">
          <div className="h-4 w-56 rounded bg-white/[0.04] animate-pulse" />
          <div className="h-8 w-72 rounded-lg bg-white/[0.06] animate-pulse" />
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full rounded-full bg-white/[0.04] animate-pulse" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Devis section skeleton */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-4">
              <div className="h-5 w-40 rounded bg-white/[0.06] animate-pulse" />
              <div className="h-px w-full bg-white/[0.04]" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-4 w-48 rounded bg-white/[0.04] animate-pulse" />
                  <div className="h-4 w-20 rounded bg-white/[0.04] animate-pulse" />
                </div>
              ))}
              <div className="flex gap-3 pt-2">
                <div className="h-10 w-32 rounded-xl bg-white/[0.04] animate-pulse" />
                <div className="h-10 w-32 rounded-xl bg-white/[0.04] animate-pulse" />
              </div>
            </div>

            {/* Addresses card skeleton */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-4">
              <div className="h-5 w-32 rounded bg-white/[0.06] animate-pulse" />
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 w-20 rounded bg-white/[0.04] animate-pulse" />
                    <div className="h-4 w-36 rounded bg-white/[0.06] animate-pulse" />
                    <div className="h-3 w-28 rounded bg-white/[0.04] animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            {/* Messages skeleton */}
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-4">
              <div className="h-5 w-36 rounded bg-white/[0.06] animate-pulse" />
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`flex gap-3 ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
                  <div className="h-8 w-8 rounded-full bg-white/[0.04] animate-pulse shrink-0" />
                  <div className={`h-12 rounded-2xl bg-white/[0.04] animate-pulse ${i % 2 === 0 ? 'w-3/4' : 'w-2/3'}`} />
                </div>
              ))}
              <div className="h-10 w-full rounded-xl bg-white/[0.04] animate-pulse" />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-3">
                <div className="h-4 w-28 rounded bg-white/[0.06] animate-pulse" />
                <div className="h-3 w-36 rounded bg-white/[0.04] animate-pulse" />
                <div className="h-3 w-24 rounded bg-white/[0.04] animate-pulse" />
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}
