import { MemoryCardSkeleton } from '@/components/ui/Skeleton';

export default function MemoriesLoading() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-8 w-28 bg-gray-200 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-36 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
      </div>

      {/* Filter skeleton */}
      <div className="flex gap-2 mb-6">
        <div className="h-10 w-20 bg-gray-200 rounded-full animate-pulse" />
        <div className="h-10 w-24 bg-gray-200 rounded-full animate-pulse" />
        <div className="h-10 w-28 bg-gray-200 rounded-full animate-pulse" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 gap-3">
        <MemoryCardSkeleton />
        <MemoryCardSkeleton />
        <MemoryCardSkeleton />
        <MemoryCardSkeleton />
      </div>
    </div>
  );
}
