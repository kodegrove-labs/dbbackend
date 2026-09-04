import React from 'react';

interface DatabaseSkeletonProps {
  viewMode?: 'flat' | 'relational';
}

export function DatabaseSkeleton({ viewMode = 'flat' }: DatabaseSkeletonProps) {
  if (viewMode === 'relational') {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-4 w-72 bg-gray-200 rounded mb-4"></div>

        {/* User Card Skeletons */}
        {[1, 2].map((idx) => (
          <div key={idx} className="border border-gray-200 rounded-xl p-5 bg-gray-50/50 space-y-4">
            {/* Header: User avatar + details */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-32 bg-gray-300 rounded"></div>
                    <div className="h-4 w-14 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-3 w-44 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="space-y-1 text-right">
                <div className="h-3 w-16 bg-gray-200 rounded ml-auto"></div>
                <div className="h-4 w-24 bg-gray-300 rounded ml-auto"></div>
              </div>
            </div>

            {/* Inner Cards: Sessions & API Keys */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-xs space-y-3">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-28 bg-gray-200 rounded"></div>
                  <div className="h-4 w-6 bg-gray-200 rounded-full"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3.5 w-full bg-gray-100 rounded"></div>
                  <div className="h-3.5 w-5/6 bg-gray-100 rounded"></div>
                  <div className="h-3.5 w-4/5 bg-gray-100 rounded"></div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-xs space-y-3">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  <div className="h-4 w-6 bg-gray-200 rounded-full"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3.5 w-full bg-gray-100 rounded"></div>
                  <div className="h-3.5 w-3/4 bg-gray-100 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Flat View Table Skeleton
  return (
    <div className="space-y-8 animate-pulse">
      {/* Primary Table: Users */}
      <div>
        <div className="flex justify-between items-center mb-3 border-b pb-2">
          <div className="flex items-center gap-2">
            <div className="h-6 w-28 bg-gray-300 rounded-md"></div>
            <div className="h-5 w-8 bg-gray-200 rounded-full"></div>
          </div>
          <div className="h-5 w-24 bg-blue-100 rounded-md"></div>
        </div>

        {/* Table skeleton box */}
        <div className="overflow-hidden border border-gray-200 rounded-xl bg-white shadow-xs">
          {/* Table Header */}
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 grid grid-cols-6 md:grid-cols-8 gap-4">
            <div className="h-4 w-12 bg-gray-300 rounded"></div>
            <div className="h-4 w-28 bg-gray-300 rounded col-span-2"></div>
            <div className="h-4 w-20 bg-gray-300 rounded"></div>
            <div className="h-4 w-16 bg-gray-300 rounded"></div>
            <div className="h-4 w-16 bg-gray-300 rounded"></div>
            <div className="h-4 w-24 bg-gray-300 rounded hidden md:block"></div>
            <div className="h-4 w-16 bg-gray-300 rounded ml-auto"></div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-gray-100">
            {[1, 2, 3, 4, 5].map((row) => (
              <div key={row} className="px-4 py-3.5 grid grid-cols-6 md:grid-cols-8 gap-4 items-center">
                <div className="h-3.5 w-14 bg-gray-200 rounded font-mono"></div>
                <div className="h-3.5 w-36 bg-gray-200 rounded col-span-2"></div>
                <div className="h-3.5 w-24 bg-gray-100 rounded"></div>
                <div className="h-4 w-12 bg-green-100 rounded-full"></div>
                <div className="h-4 w-14 bg-purple-100 rounded-full"></div>
                <div className="h-3.5 w-28 bg-gray-100 rounded hidden md:block"></div>
                <div className="flex gap-2 justify-end">
                  <div className="h-5 w-5 bg-gray-200 rounded"></div>
                  <div className="h-5 w-5 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Secondary Table: Sessions or Activity */}
      <div>
        <div className="flex justify-between items-center mb-3 border-b pb-2">
          <div className="flex items-center gap-2">
            <div className="h-6 w-32 bg-gray-300 rounded-md"></div>
            <div className="h-5 w-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>

        <div className="overflow-hidden border border-gray-200 rounded-xl bg-white shadow-xs">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 grid grid-cols-4 gap-4">
            <div className="h-4 w-16 bg-gray-300 rounded"></div>
            <div className="h-4 w-32 bg-gray-300 rounded"></div>
            <div className="h-4 w-28 bg-gray-300 rounded"></div>
            <div className="h-4 w-20 bg-gray-300 rounded ml-auto"></div>
          </div>
          <div className="divide-y divide-gray-100">
            {[1, 2, 3].map((row) => (
              <div key={row} className="px-4 py-3 grid grid-cols-4 gap-4 items-center">
                <div className="h-3.5 w-20 bg-gray-200 rounded"></div>
                <div className="h-3.5 w-40 bg-gray-100 rounded"></div>
                <div className="h-3.5 w-32 bg-gray-100 rounded"></div>
                <div className="h-3.5 w-16 bg-gray-200 rounded ml-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
