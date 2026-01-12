import { DateCardSkeleton } from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-8 w-32 bg-gray-200 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-40 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
      </div>

      {/* Counter skeleton */}
      <div className="h-24 bg-gray-200 rounded-2xl animate-pulse mb-6" />

      {/* Section header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
        <div className="h-5 w-24 bg-gray-200 rounded-lg animate-pulse" />
      </div>

      {/* Date cards skeleton */}
      <div className="space-y-3">
        <DateCardSkeleton />
        <DateCardSkeleton />
        <DateCardSkeleton />
      </div>
    </div>
  );
}
