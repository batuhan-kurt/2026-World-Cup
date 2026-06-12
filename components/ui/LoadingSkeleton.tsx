"use client";

/**
 * components/ui/LoadingSkeleton.tsx
 * Yükleme iskelet bileşenleri
 */
export function MatchCardSkeleton() {
  return (
    <div className="glass-card p-5 animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="skeleton h-4 w-24 rounded" />
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
      <div className="flex items-center justify-between gap-4">
        {/* Ev sahibi */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="skeleton w-12 h-12 rounded-full" />
          <div className="skeleton h-3 w-20 rounded" />
        </div>
        {/* Skor */}
        <div className="flex flex-col items-center gap-1">
          <div className="skeleton h-10 w-24 rounded-lg" />
          <div className="skeleton h-3 w-16 rounded" />
        </div>
        {/* Deplasman */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="skeleton w-12 h-12 rounded-full" />
          <div className="skeleton h-3 w-20 rounded" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <div className="skeleton h-3 w-4 rounded" />
        <div className="skeleton h-3 w-32 rounded" />
      </div>
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="skeleton h-10 rounded-xl" />
      ))}
    </div>
  );
}

export function StatRowSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="skeleton h-4 w-8 rounded" />
          <div className="skeleton h-2 flex-1 rounded-full" />
          <div className="skeleton h-4 w-8 rounded" />
        </div>
      ))}
    </div>
  );
}
