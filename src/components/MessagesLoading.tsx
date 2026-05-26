'use client';

export default function MessagesLoading() {
  return (
    <div className="flex h-screen border-x border-gray-800">
      {/* Conversation List Skeleton */}
      <div className="w-full md:w-96 border-r border-gray-800 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="h-6 w-24 bg-gray-800 rounded animate-pulse"></div>
          <div className="h-10 w-10 bg-gray-800 rounded-full animate-pulse"></div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 border-b border-gray-800 flex items-start gap-3">
              <div className="w-12 h-12 bg-gray-800 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 w-32 bg-gray-800 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-48 bg-gray-800 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window Skeleton */}
      <div className="hidden md:flex flex-1 items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="h-8 w-48 bg-gray-800 rounded animate-pulse mx-auto mb-2"></div>
          <div className="h-4 w-64 bg-gray-800 rounded animate-pulse mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
