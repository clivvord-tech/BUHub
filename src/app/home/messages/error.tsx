'use client';

export default function MessagesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-screen border-x border-gray-800 items-center justify-center">
      <div className="text-center max-w-md p-8">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Something went wrong!</h2>
        <p className="text-gray-400 mb-6">
          {error.message || 'Failed to load messages. Please try again.'}
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition font-semibold"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
