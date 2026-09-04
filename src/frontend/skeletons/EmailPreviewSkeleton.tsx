import React from 'react';

export function EmailPreviewSkeleton() {
  return (
    <div className="h-full flex flex-col bg-white animate-pulse">
      {/* Subject Bar Skeleton */}
      <div className="px-4 py-2.5 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
        <div className="h-3 w-14 bg-gray-300 rounded"></div>
        <div className="h-4 w-64 bg-gray-200 rounded"></div>
      </div>

      {/* Simulated Email Body Container */}
      <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50 flex justify-center">
        <div className="w-full max-w-md bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden flex flex-col">
          {/* Email Template Header Banner */}
          <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-6 flex flex-col items-center justify-center border-b border-gray-100">
            <div className="h-6 w-44 bg-blue-200/80 rounded-md mb-2"></div>
            <div className="h-3.5 w-28 bg-blue-200/50 rounded"></div>
          </div>

          {/* Email Content Body */}
          <div className="p-6 space-y-4">
            {/* Salutation */}
            <div className="h-4 w-28 bg-gray-200 rounded"></div>

            {/* Paragraph lines */}
            <div className="space-y-2">
              <div className="h-3.5 w-full bg-gray-100 rounded"></div>
              <div className="h-3.5 w-11/12 bg-gray-100 rounded"></div>
              <div className="h-3.5 w-3/4 bg-gray-100 rounded"></div>
            </div>

            {/* Key Information Box */}
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center">
                <div className="h-3 w-20 bg-gray-200 rounded"></div>
                <div className="h-3 w-28 bg-gray-200 rounded"></div>
              </div>
              <div className="flex justify-between items-center">
                <div className="h-3 w-16 bg-gray-200 rounded"></div>
                <div className="h-3 w-24 bg-gray-200 rounded"></div>
              </div>
            </div>

            {/* Call to action button */}
            <div className="py-2 flex justify-center">
              <div className="h-10 w-48 bg-blue-500/30 rounded-lg"></div>
            </div>

            {/* Closing text */}
            <div className="space-y-1.5 pt-2">
              <div className="h-3 w-32 bg-gray-100 rounded"></div>
              <div className="h-3 w-24 bg-gray-100 rounded"></div>
            </div>
          </div>

          {/* Email Footer */}
          <div className="p-4 bg-gray-50 border-t border-gray-100 text-center flex flex-col items-center space-y-1">
            <div className="h-2.5 w-40 bg-gray-200 rounded"></div>
            <div className="h-2 w-32 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EmailSendingSkeleton() {
  return (
    <div className="mt-4 p-4 bg-blue-50/70 border border-blue-200 rounded-xl animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 rounded-full bg-blue-300"></div>
        <div className="flex-1 space-y-1.5">
          <div className="h-4 w-48 bg-blue-300 rounded"></div>
          <div className="h-3 w-32 bg-blue-200 rounded"></div>
        </div>
        <div className="h-6 w-20 bg-blue-200 rounded-md"></div>
      </div>
    </div>
  );
}
