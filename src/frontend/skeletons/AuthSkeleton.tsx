import React from 'react';

export function AuthSkeleton() {
  return (
    <div className="max-w-2xl w-full mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8 animate-pulse">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left Column: Form Skeleton */}
        <div>
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-3 mb-6">
            <div className="h-6 w-36 bg-gray-200 rounded-md"></div>
            <div className="h-4 w-16 bg-gray-100 rounded-md"></div>
          </div>

          <div className="space-y-4">
            {/* Field 1: Username */}
            <div>
              <div className="h-4 w-24 bg-gray-200 rounded mb-1.5"></div>
              <div className="h-10 w-full bg-gray-100 border border-gray-200 rounded-lg"></div>
            </div>

            {/* Field 2: Email */}
            <div>
              <div className="h-4 w-16 bg-gray-200 rounded mb-1.5"></div>
              <div className="h-10 w-full bg-gray-100 border border-gray-200 rounded-lg"></div>
            </div>

            {/* Field 3: Password */}
            <div>
              <div className="h-4 w-20 bg-gray-200 rounded mb-1.5"></div>
              <div className="h-10 w-full bg-gray-100 border border-gray-200 rounded-lg"></div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2">
              <div className="flex-1 h-10 bg-blue-200 rounded-lg"></div>
              <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-gray-200 w-full"></div>
              <span className="bg-white px-3 text-xs text-gray-300">OR</span>
            </div>

            {/* Google Login button skeleton */}
            <div className="h-10 w-48 mx-auto bg-gray-200 rounded-lg"></div>
          </div>
        </div>

        {/* Right Column: Endpoints List Skeleton */}
        <div>
          <div className="border-b pb-3 mb-6">
            <div className="h-6 w-40 bg-gray-200 rounded-md"></div>
          </div>

          <ul className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <li key={i} className="flex items-center gap-2.5">
                <div className={`h-5 w-12 rounded ${i === 6 ? 'bg-blue-100' : 'bg-green-100'}`}></div>
                <div className="h-4 bg-gray-100 rounded" style={{ width: `${60 + (i % 3) * 20}%` }}></div>
              </li>
            ))}
          </ul>

          <div className="mt-8 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="h-3.5 w-3/4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 w-1/2 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
