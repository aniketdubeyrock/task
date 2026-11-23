import React from 'react';
import { Skeleton } from '../ui/Skeleton';

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Stat Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-crisp flex items-center gap-4"
          >
            <Skeleton className="w-12 h-12 rounded-xl" />
            <div className="flex-1 flex flex-col gap-2">
              <Skeleton className="w-20 h-4" />
              <Skeleton className="w-14 h-7" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-crisp flex flex-col gap-4">
          <Skeleton className="w-40 h-6" />
          <div className="flex flex-col gap-3 mt-2">
            {[1, 2, 3].map((row) => (
              <div key={row} className="p-4 border border-slate-100 rounded-xl flex items-center justify-between">
                <div className="flex flex-col gap-2 w-1/2">
                  <Skeleton className="w-48 h-5" />
                  <Skeleton className="w-32 h-4" />
                </div>
                <Skeleton className="w-28 h-7 rounded-lg" />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-crisp flex flex-col gap-4">
          <Skeleton className="w-32 h-6" />
          <div className="flex items-center justify-center py-6">
            <Skeleton className="w-44 h-44 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

