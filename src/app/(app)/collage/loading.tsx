export default function CollageLoading() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-8 w-24 bg-gray-200 rounded-lg animate-pulse mb-2" />
          <div className="h-4 w-32 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
      </div>

      {/* Month navigation skeleton */}
      <div className="flex items-center justify-between mb-6 bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
        <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-6 w-32 bg-gray-200 rounded-lg animate-pulse" />
        <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse" />
      </div>

      {/* Collage skeleton */}
      <div className="bg-gray-200 rounded-2xl animate-pulse aspect-square" />

      {/* Button skeleton */}
      <div className="mt-6 h-12 bg-gray-200 rounded-xl animate-pulse" />
    </div>
  );
}
