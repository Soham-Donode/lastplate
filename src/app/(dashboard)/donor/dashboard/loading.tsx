export default function DashboardLoading() {
  return (
    <div className="space-y-4 sm:space-y-5" aria-busy="true">
      <span className="sr-only">Loading dashboard</span>

      <div className="flex flex-col gap-4 pb-1 pt-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="h-8 w-44 animate-pulse rounded-control bg-subtle" />
          <div className="h-4 w-72 max-w-full animate-pulse rounded-xs bg-surface" />
        </div>
        <div className="flex flex-wrap gap-2 sm:shrink-0">
          <div className="h-11 min-w-32 flex-1 animate-pulse rounded-control bg-subtle sm:h-10" />
          <div className="h-11 min-w-36 flex-1 animate-pulse rounded-control bg-subtle sm:h-10" />
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          <div className="h-64 animate-pulse rounded-card border border-line bg-surface" />
          <div className="h-72 animate-pulse rounded-card border border-line bg-surface" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2 xl:col-span-4 xl:grid-cols-1">
          <div className="h-64 animate-pulse rounded-card border border-line bg-surface" />
          <div className="h-56 animate-pulse rounded-card border border-line bg-surface" />
        </div>
      </div>
    </div>
  );
}
