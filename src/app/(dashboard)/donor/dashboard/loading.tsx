export default function DashboardLoading() {
  return (
    <div className="space-y-4 sm:space-y-5" aria-busy="true">
      <span className="sr-only">Loading dashboard</span>

      <div className="flex flex-col gap-4 pb-1 pt-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-44 animate-pulse rounded-control bg-subtle" />
          <div className="h-4 w-72 max-w-full animate-pulse rounded-xs bg-surface" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-32 animate-pulse rounded-control bg-subtle" />
          <div className="h-10 w-36 animate-pulse rounded-control bg-subtle" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className="h-[148px] animate-pulse glass-surface rounded-card p-5"
          >
            <div className="h-4 w-28 rounded-xs bg-surface" />
            <div className="mt-8 h-9 w-16 rounded-xs bg-subtle" />
            <div className="mt-3 h-3 w-36 rounded-xs bg-surface" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="h-[290px] animate-pulse rounded-card border border-line/60 bg-surface lg:col-span-7 xl:col-span-5" />
        <div className="h-[290px] animate-pulse rounded-card border border-line/60 bg-surface lg:col-span-5 xl:col-span-3" />
        <div className="h-[290px] animate-pulse rounded-card border border-line/60 bg-surface lg:col-span-12 xl:col-span-4" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="h-[330px] animate-pulse rounded-card border border-line/60 bg-surface lg:col-span-7" />
        <div className="h-[330px] animate-pulse rounded-card border border-line/60 bg-surface lg:col-span-5" />
      </div>
    </div>
  );
}
