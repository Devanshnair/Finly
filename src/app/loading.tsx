export default function Loading() {
  return (
    <div className="min-h-screen bg-bg-page text-text-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-pulse">
        <div className="h-10 w-48 bg-bg-surface rounded-md" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-bg-surface border border-border" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 rounded-xl bg-bg-surface border border-border" />
          <div className="h-72 rounded-xl bg-bg-surface border border-border" />
        </div>
        <div className="h-96 rounded-xl bg-bg-surface border border-border" />
      </div>
    </div>
  );
}
